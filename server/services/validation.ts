import type { AlternativaId, QuizAprovado } from '../data/respostas-cache.ts'
import type { FaixaEtaria } from '../data/passagens.ts'

const ALTERNATIVA_IDS: readonly AlternativaId[] = ['A', 'B', 'C', 'D']

const STOPWORDS = new Set([
  'para',
  'como',
  'quando',
  'onde',
  'that',
  'this',
  'with',
  'from',
  'what',
  'when',
  'where',
  'which',
  'como',
  'esta',
  'este',
  'esto',
  'para',
  'porque',
  'pues',
  'that',
])

const TERMOS_INADEQUADOS_CRIANCA = [
  'sangue',
  'suicidio',
  'estupro',
  'sexo',
  'porn',
  'nudes',
  'inferno',
  'demonio',
  'diabo',
  'tortura',
  'massacre',
  'blood',
  'suicide',
  'rape',
  'hell',
  'demon',
  'torture',
  'infierno',
  'demonio',
]

const NOMES_FORA_DE_CONTEXTO = [
  'noe',
  'noah',
  'jose',
  'joseph',
  'egito',
  'egypt',
  'egipto',
  'farao',
  'pharaoh',
  'faraon',
  'arca',
  'ark',
  'nineve',
  'daniel',
  'baleia',
  'whale',
  'fornalha',
  'leoes',
]

export interface QuizGerado {
  pergunta: string
  alternativas: { id: AlternativaId; texto: string }[]
  respostaCorretaId: AlternativaId
  explicacao: string
}

export interface FalhaValidacao {
  ok: false
  motivo: string
}

export interface QuizValidado {
  ok: true
  quiz: QuizGerado
}

const normalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')

const tokens = (texto: string): Set<string> =>
  new Set(
    normalizar(texto)
      .split(/\s+/)
      .filter((token) => token.length > 3 && !STOPWORDS.has(token)),
  )

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

const idsIguais = (value: unknown): value is AlternativaId =>
  ALTERNATIVA_IDS.includes(value as AlternativaId)

export const parseQuizGerado = (value: unknown): QuizGerado | null => {
  const data = asRecord(value)
  const pergunta = asString(data?.pergunta)
  const explicacao = asString(data?.explicacao)
  const respostaCorretaId = data?.respostaCorretaId
  const alternativas = Array.isArray(data?.alternativas) ? data.alternativas : []
  const parsed = alternativas.map((item) => {
    const alternativa = asRecord(item)
    return { id: alternativa?.id, texto: asString(alternativa?.texto) }
  })

  if (
    !pergunta ||
    !explicacao ||
    !idsIguais(respostaCorretaId) ||
    parsed.length !== 4 ||
    parsed.some((item) => !idsIguais(item.id) || !item.texto)
  ) {
    return null
  }

  const ids = parsed.map((item) => item.id)
  if (new Set(ids).size !== 4) return null

  return {
    pergunta,
    explicacao,
    respostaCorretaId,
    alternativas: parsed.map((item) => ({
      id: item.id as AlternativaId,
      texto: item.texto as string,
    })),
  }
}

const contemPalavra = (texto: string, palavra: string): boolean =>
  new RegExp(`(?:^|\\s)${palavra}(?:\\s|$)`).test(` ${normalizar(texto)} `)

export const validarQuiz = (
  quiz: QuizGerado,
  passagem: string,
  faixaEtaria: FaixaEtaria,
): QuizValidado | FalhaValidacao => {
  const textos = quiz.alternativas.map((item) => normalizar(item.texto))
  if (new Set(textos).size !== 4) {
    return { ok: false, motivo: 'alternativas-duplicadas' }
  }

  const correta = quiz.alternativas.find((item) => item.id === quiz.respostaCorretaId)
  if (!correta) return { ok: false, motivo: 'resposta-ausente' }

  const ancorado = `${quiz.pergunta} ${quiz.explicacao} ${correta.texto}`
  const inadequado = TERMOS_INADEQUADOS_CRIANCA.some((termo) =>
    normalizar(`${ancorado} ${quiz.alternativas.map((item) => item.texto).join(' ')}`).includes(termo),
  )
  if (inadequado) return { ok: false, motivo: 'conteudo-inadequado' }

  if (faixaEtaria === 'crianca') {
    if (quiz.pergunta.length > 140 || quiz.explicacao.length > 280) {
      return { ok: false, motivo: 'texto-longo-para-crianca' }
    }
    if (quiz.alternativas.some((item) => item.texto.length > 80)) {
      return { ok: false, motivo: 'alternativa-longa-para-crianca' }
    }
  }

  const suporte = tokens(`${correta.texto} ${quiz.explicacao}`)
  const passagemTokens = tokens(passagem)
  const intersecao = [...suporte].filter((token) => passagemTokens.has(token))
  if (intersecao.length === 0) {
    return { ok: false, motivo: 'sem-suporte-na-passagem' }
  }

  const fora = NOMES_FORA_DE_CONTEXTO.filter(
    (nome) => contemPalavra(ancorado, nome) && !contemPalavra(passagem, nome),
  )
  if (fora.length > 0) {
    return { ok: false, motivo: 'conhecimento-externo' }
  }

  return { ok: true, quiz }
}

export const quizPublico = (quiz: QuizAprovado | (QuizGerado & { id: string; passagemId: string }), origem: 'ia' | 'fallback') => ({
  id: quiz.id,
  passagemId: quiz.passagemId,
  pergunta: quiz.pergunta,
  alternativas: quiz.alternativas,
  origem,
})
