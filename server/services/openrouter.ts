import OpenAI from 'openai'

import type { FaixaEtaria, Idioma } from '../data/passagens.ts'
import { parseQuizGerado, type QuizGerado } from './validation.ts'

const QUIZ_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['pergunta', 'alternativas', 'respostaCorretaId', 'explicacao'],
  properties: {
    pergunta: { type: 'string' },
    respostaCorretaId: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
    explicacao: { type: 'string' },
    alternativas: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'texto'],
        properties: {
          id: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
          texto: { type: 'string' },
        },
      },
    },
  },
} as const

const PROVIDER_PRIVACIDADE = {
  data_collection: 'deny',
  zdr: true,
  allow_fallbacks: true,
} as const

export interface GerarQuizLlmInput {
  referencia: string
  texto: string
  idioma: Idioma
  faixaEtaria: FaixaEtaria
  dificuldade: 'facil' | 'medio'
}

export interface OpenRouterClient {
  gerarQuiz: (input: GerarQuizLlmInput) => Promise<QuizGerado | null>
}

const idiomaPrompt = (idioma: Idioma): string => {
  switch (idioma) {
    case 'pt-BR':
      return 'português brasileiro'
    case 'en-US':
      return 'English'
    case 'es-ES':
      return 'español'
    default: {
      const exhaustive: never = idioma
      return exhaustive
    }
  }
}

const faixaPrompt = (faixa: FaixaEtaria): string => {
  switch (faixa) {
    case 'crianca':
      return 'crianças pequenas que ainda estão aprendendo a ler; frases curtas, concretas e gentis'
    case 'geral':
      return 'famílias e crianças um pouco mais velhas; ainda simples, sem jargão teológico'
    default: {
      const exhaustive: never = faixa
      return exhaustive
    }
  }
}

const extrairJson = (content: string): unknown => {
  const trimmed = content.trim()
  const cercado = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(cercado?.[1] ?? trimmed)
}

const formatos: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming['response_format'][] = [
  {
    type: 'json_schema',
    json_schema: {
      name: 'quiz',
      strict: true,
      schema: QUIZ_JSON_SCHEMA,
    },
  },
  { type: 'json_object' },
]

export const createOpenRouterClient = (
  apiKey: string,
  models: string[],
  fetchFn: typeof fetch = fetch,
): OpenRouterClient => {
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    fetch: fetchFn,
    defaultHeaders: {
      'HTTP-Referer': 'https://selah.local',
      'X-Title': 'Selah',
    },
  })

  return {
    gerarQuiz: async (input) => {
      if (!apiKey || models.length === 0) return null

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: [
            'Você gera um único quiz de múltipla escolha ancorado EXCLUSIVAMENTE na passagem bíblica fornecida pela YouVersion.',
            'Proibido usar conhecimento externo, inventar fatos, complementar a narrativa ou citar outras histórias.',
            'Gere exatamente quatro alternativas A, B, C e D, com exatamente uma correta.',
            'A letra da resposta correta deve variar; não coloque sempre a certa em A.',
            'As alternativas incorretas devem ser claramente erradas e concretas, sem nomes de outras narrativas bíblicas.',
            'A explicação deve repetir ou parafrasear somente o que está na passagem e mencionar a referência.',
            'Não use violência gráfica, medo, culpa, urgência ou conteúdo adulto.',
            'Responda só com JSON válido no formato {pergunta, alternativas, respostaCorretaId, explicacao}.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            `Idioma da pergunta: ${idiomaPrompt(input.idioma)}.`,
            `Público: ${faixaPrompt(input.faixaEtaria)}.`,
            `Dificuldade: ${input.dificuldade}.`,
            `Referência YouVersion: ${input.referencia}.`,
            `Passagem aprovada:\n${input.texto}`,
          ].join('\n'),
        },
      ]

      for (const model of models) {
        for (const response_format of formatos) {
          try {
            const completion = await client.chat.completions.create({
              model,
              temperature: 0.2,
              stream: false,
              messages,
              response_format,
              provider: PROVIDER_PRIVACIDADE,
            } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming)

            const content = completion.choices[0]?.message?.content
            if (!content) continue
            const quiz = parseQuizGerado(extrairJson(content))
            if (quiz) return quiz
          } catch {
            continue
          }
        }
      }

      return null
    },
  }
}
