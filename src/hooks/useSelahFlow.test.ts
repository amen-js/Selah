import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, StrictMode, type PropsWithChildren } from 'react'

import type { SelahGateway } from '../services/selahGateway'
import { useGameStore } from '../stores/gameStore'
import type { AvaliacaoQuiz, QuizPublico, VersiculoPublico } from '../types/selah'
import { useSelahFlow } from './useSelahFlow'

const versiculo: VersiculoPublico = {
  passagemId: 'genesis-1-3',
  referencia: 'Gênesis 1:3',
  texto: 'Haja luz.',
  idioma: 'pt-BR',
  versao: 'Demo',
  atribuicao: 'Texto de teste.',
}

const quiz: QuizPublico = {
  id: 'quiz-1',
  passagemId: versiculo.passagemId,
  pergunta: 'O que surgiu?',
  alternativas: [
    { id: 'A', texto: 'A luz' },
    { id: 'B', texto: 'A arca' },
    { id: 'C', texto: 'A cidade' },
    { id: 'D', texto: 'O palácio' },
  ],
  origem: 'ia',
}

const avaliacao: AvaliacaoQuiz = {
  acertou: true,
  explicacao: 'A luz surgiu.',
  referencia: versiculo.referencia,
}

const createGateway = (): SelahGateway => ({
  buscarVersiculo: vi.fn().mockResolvedValue(versiculo),
  gerarQuiz: vi.fn().mockResolvedValue(quiz),
  responderQuiz: vi.fn().mockResolvedValue(avaliacao),
  enviarMetricas: vi.fn().mockResolvedValue(undefined),
})

describe('useSelahFlow', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('loads verse and quiz once and reports the start with consent', async () => {
    const gateway = createGateway()
    useGameStore.getState().setIdioma('en-US')
    useGameStore.getState().setFaixaEtaria('geral')
    useGameStore.getState().setIaAtiva(true)
    useGameStore.getState().setCompartilharMetricas(true)
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })

    renderHook(() => useSelahFlow({ gateway, appVersion: 'test' }))

    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))
    expect(gateway.buscarVersiculo).toHaveBeenCalledOnce()
    expect(gateway.buscarVersiculo).toHaveBeenCalledWith(
      { historiaId: 'criacao', passagemId: versiculo.passagemId },
      'en-US',
    )
    expect(gateway.gerarQuiz).toHaveBeenCalledOnce()
    expect(gateway.gerarQuiz).toHaveBeenCalledWith({
      historiaId: 'criacao',
      passagemId: versiculo.passagemId,
      idioma: 'en-US',
      faixaEtaria: 'geral',
      dificuldade: 'medio',
      iaAtiva: true,
    })
    expect(gateway.enviarMetricas).toHaveBeenCalledWith(
      [{ tipo: 'selah_iniciado', historiaId: 'criacao', versaoApp: 'test' }],
      true,
    )
  })

  it('derives easy quiz preferences for a child with AI disabled', async () => {
    const gateway = createGateway()
    useGameStore.getState().setIdioma('es-ES')
    useGameStore.getState().setFaixaEtaria('crianca')
    useGameStore.getState().setIaAtiva(false)
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })

    renderHook(() => useSelahFlow({ gateway }))

    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))
    expect(gateway.gerarQuiz).toHaveBeenCalledOnce()
    expect(gateway.gerarQuiz).toHaveBeenCalledWith({
      historiaId: 'criacao',
      passagemId: versiculo.passagemId,
      idioma: 'es-ES',
      faixaEtaria: 'crianca',
      dificuldade: 'facil',
      iaAtiva: false,
    })
  })

  it('finishes loading under React StrictMode without duplicating requests', async () => {
    const gateway = createGateway()
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    const wrapper = ({ children }: PropsWithChildren) => createElement(StrictMode, null, children)

    renderHook(() => useSelahFlow({ gateway }), { wrapper })

    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))
    expect(gateway.buscarVersiculo).toHaveBeenCalledOnce()
    expect(gateway.gerarQuiz).toHaveBeenCalledOnce()
  })

  it('does not call the metrics gateway without consent', async () => {
    const gateway = createGateway()
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })

    renderHook(() => useSelahFlow({ gateway }))

    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))
    expect(gateway.enviarMetricas).not.toHaveBeenCalled()
  })

  it('submits one answer and stores only the minimal local result', async () => {
    const gateway = createGateway()
    useGameStore.getState().setCompartilharMetricas(true)
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    const { result } = renderHook(() => useSelahFlow({ gateway, appVersion: 'test' }))
    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))

    act(() => result.current.mostrarQuiz())
    await act(async () => result.current.responder('A'))

    expect(useGameStore.getState().selahAtivo?.fase).toBe('feedback')
    expect(useGameStore.getState().historico).toEqual([
      { quizId: 'quiz-1', passagemId: 'genesis-1-3', alternativaId: 'A', acertou: true },
    ])
    expect(gateway.enviarMetricas).toHaveBeenCalledWith(
      [
        {
          tipo: 'quiz_respondido',
          historiaId: 'criacao',
          versaoApp: 'test',
          acertou: true,
        },
      ],
      true,
    )
  })

  it('completes the reflection and activates parental pause', async () => {
    const gateway = createGateway()
    useGameStore.getState().setCompartilharMetricas(true)
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    const { result } = renderHook(() => useSelahFlow({ gateway, appVersion: 'test' }))
    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))
    act(() => result.current.mostrarQuiz())
    await act(async () => result.current.responder('A'))

    act(() => result.current.concluir())

    expect(useGameStore.getState().pausaParentalAtiva).toBe(true)
    expect(gateway.enviarMetricas).toHaveBeenCalledWith(
      [{ tipo: 'selah_concluido', historiaId: 'criacao', versaoApp: 'test' }],
      true,
    )
  })

  it.each([
    [
      'pt-BR',
      'Não foi possível carregar este momento. Tente novamente em instantes.',
    ],
    ['en-US', 'We could not load this moment. Please try again shortly.'],
    [
      'es-ES',
      'No pudimos cargar este momento. Inténtalo de nuevo en unos instantes.',
    ],
  ] as const)('shows a controlled %s error when content cannot be loaded', async (idioma, error) => {
    const gateway = createGateway()
    vi.mocked(gateway.buscarVersiculo).mockRejectedValue(new Error('network details'))
    useGameStore.getState().setIdioma(idioma)
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })

    renderHook(() => useSelahFlow({ gateway }))

    await waitFor(() => expect(useGameStore.getState().selahAtivo?.erro).toBe(error))
  })

  it('localizes answer errors and returns to the quiz phase', async () => {
    const gateway = createGateway()
    vi.mocked(gateway.responderQuiz).mockRejectedValue(new Error('diagnostic details'))
    useGameStore.getState().setIdioma('es-ES')
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    const { result } = renderHook(() => useSelahFlow({ gateway }))
    await waitFor(() => expect(useGameStore.getState().selahAtivo?.fase).toBe('versiculo'))

    act(() => result.current.mostrarQuiz())
    await act(async () => result.current.responder('A'))

    expect(useGameStore.getState().selahAtivo).toMatchObject({
      fase: 'quiz',
      erro: 'No pudimos verificar tu respuesta. Inténtalo de nuevo.',
    })
  })
})
