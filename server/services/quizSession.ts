import { randomUUID } from 'node:crypto'

import type { AlternativaId, QuizAprovado } from '../data/respostas-cache.ts'

const TTL_MS = 30 * 60 * 1000

export interface QuizSessao {
  id: string
  passagemId: string
  respostaCorretaId: AlternativaId
  explicacao: string
  referencia: string
  criadoEm: number
}

export const createQuizSessionStore = (now: () => number = Date.now) => {
  const sessoes = new Map<string, QuizSessao>()

  const limparExpirados = (): void => {
    const limite = now() - TTL_MS
    for (const [id, sessao] of sessoes) {
      if (sessao.criadoEm < limite) sessoes.delete(id)
    }
  }

  return {
    guardar: (quiz: Pick<QuizAprovado, 'id' | 'passagemId' | 'respostaCorretaId' | 'explicacao' | 'referencia'>): QuizSessao => {
      limparExpirados()
      const sessao: QuizSessao = {
        id: quiz.id,
        passagemId: quiz.passagemId,
        respostaCorretaId: quiz.respostaCorretaId,
        explicacao: quiz.explicacao,
        referencia: quiz.referencia,
        criadoEm: now(),
      }
      sessoes.set(sessao.id, sessao)
      return sessao
    },
    obter: (quizId: string): QuizSessao | undefined => {
      limparExpirados()
      return sessoes.get(quizId)
    },
    novoId: (): string => `quiz-${randomUUID()}`,
  }
}

export type QuizSessionStore = ReturnType<typeof createQuizSessionStore>
