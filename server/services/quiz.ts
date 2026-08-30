import { randomUUID } from 'node:crypto'

import {
  buscarQuizAprovado,
  buscarQuizAprovadoPorId,
  type QuizAprovado,
} from '../data/respostas-cache.ts'
import { passagemPermitida, type FaixaEtaria, type Idioma } from '../data/passagens.ts'
import type { OpenRouterClient } from './openrouter.ts'
import type { QuizSessionStore } from './quizSession.ts'
import { embaralharAlternativas, quizPublico, validarQuiz, type QuizGerado } from './validation.ts'
import type { YouVersionClient } from './youversion.ts'

export interface GerarQuizInput {
  historiaId: string
  passagemId: string
  idioma: Idioma
  faixaEtaria: FaixaEtaria
  dificuldade: 'facil' | 'medio'
  iaAtiva: boolean
}

export class QuizHttpError extends Error {
  readonly status: 400 | 404 | 503

  constructor(status: 400 | 404 | 503, message: string) {
    super(message)
    this.status = status
  }
}

export const createQuizService = ({
  youVersion,
  openRouter,
  sessoes,
}: {
  youVersion: YouVersionClient
  openRouter: OpenRouterClient | null
  sessoes: QuizSessionStore
}) => {
  const publicar = (quiz: QuizAprovado, origem: 'ia' | 'fallback') => {
    const embaralhado: QuizAprovado = { ...quiz, ...embaralharAlternativas(quiz) }
    sessoes.guardar(embaralhado)
    return quizPublico(embaralhado, origem)
  }

  const promoverGerado = (
    gerado: QuizGerado,
    passagemId: string,
    textoPassagem: string,
    faixaEtaria: FaixaEtaria,
  ): QuizAprovado | null => {
    const validado = validarQuiz(gerado, textoPassagem, faixaEtaria)
    if (!validado.ok) return null
    return {
      id: `quiz-${randomUUID()}`,
      passagemId,
      idioma: 'pt-BR',
      faixaEtaria,
      pergunta: validado.quiz.pergunta,
      alternativas: validado.quiz.alternativas,
      respostaCorretaId: validado.quiz.respostaCorretaId,
      explicacao: validado.quiz.explicacao,
      referencia: '',
    }
  }

  return {
    gerar: async (input: GerarQuizInput) => {
      const passagem = passagemPermitida(input.passagemId, input.historiaId, input.faixaEtaria)
      if (!passagem) {
        throw new QuizHttpError(400, 'Passagem não aprovada para esta história ou faixa etária.')
      }

      const versiculo = await youVersion.buscar(passagem.usfm, passagem.passagemId, input.idioma)
      if (!versiculo) {
        throw new QuizHttpError(503, 'Não foi possível obter a passagem aprovada.')
      }

      if (input.iaAtiva && openRouter) {
        const gerado = await openRouter.gerarQuiz({
          referencia: versiculo.referencia,
          texto: versiculo.texto,
          idioma: input.idioma,
          faixaEtaria: input.faixaEtaria,
          dificuldade: input.dificuldade,
        })
        const promovido = gerado
          ? promoverGerado(gerado, passagem.passagemId, versiculo.texto, input.faixaEtaria)
          : null
        if (promovido) {
          return publicar(
            {
              ...promovido,
              idioma: input.idioma,
              referencia: versiculo.referencia,
              explicacao: promovido.explicacao,
            },
            'ia',
          )
        }
      }

      const fallback = buscarQuizAprovado(passagem.passagemId, input.idioma, input.faixaEtaria)
      if (!fallback) {
        throw new QuizHttpError(503, 'Não há quiz local aprovado para esta passagem.')
      }
      return publicar(fallback, 'fallback')
    },

    responder: (quizId: string, alternativaId: string) => {
      if (!['A', 'B', 'C', 'D'].includes(alternativaId)) {
        throw new QuizHttpError(400, 'Alternativa inválida.')
      }

      const sessao = sessoes.obter(quizId) ?? buscarQuizAprovadoPorId(quizId)
      if (!sessao) {
        throw new QuizHttpError(404, 'Quiz não encontrado.')
      }

      return {
        acertou: sessao.respostaCorretaId === alternativaId,
        explicacao: sessao.explicacao,
        referencia: sessao.referencia,
      }
    },
  }
}

export type QuizService = ReturnType<typeof createQuizService>
