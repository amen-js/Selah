// @vitest-environment node
import { validarQuiz, type QuizGerado } from './validation.ts'

const quizLuz = (): QuizGerado => ({
  pergunta: 'O que aconteceu quando Deus falou?',
  alternativas: [
    { id: 'A', texto: 'Houve luz' },
    { id: 'B', texto: 'Começou a chover' },
    { id: 'C', texto: 'Surgiu uma cidade' },
    { id: 'D', texto: 'Apareceu um palácio' },
  ],
  respostaCorretaId: 'A',
  explicacao: 'A passagem diz: haja luz. E houve luz.',
})

describe('validarQuiz', () => {
  it('accepts a child-safe quiz grounded in the passage', () => {
    const resultado = validarQuiz(
      quizLuz(),
      'E disse Deus: Haja luz. E houve luz.',
      'crianca',
    )
    expect(resultado.ok).toBe(true)
  })

  it('rejects quizzes that introduce other biblical stories', () => {
    const resultado = validarQuiz(
      {
        ...quizLuz(),
        explicacao: 'José sonhou, e depois Deus disse haja luz.',
      },
      'E disse Deus: Haja luz. E houve luz.',
      'geral',
    )
    expect(resultado).toMatchObject({ ok: false, motivo: 'conhecimento-externo' })
  })

  it('rejects quizzes whose correct answer is not supported by the passage', () => {
    const resultado = validarQuiz(
      {
        ...quizLuz(),
        alternativas: [
          { id: 'A', texto: 'Um palácio dourado' },
          { id: 'B', texto: 'Uma cidade grande' },
          { id: 'C', texto: 'Um jardim secreto' },
          { id: 'D', texto: 'Uma torre alta' },
        ],
        explicacao: 'A resposta fala de um palácio dourado.',
      },
      'E disse Deus: Haja luz. E houve luz.',
      'geral',
    )
    expect(resultado).toMatchObject({ ok: false, motivo: 'sem-suporte-na-passagem' })
  })
})
