import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../../../../stores/gameStore'
import { useProgressaoNoeRuntime } from './ProgressaoNoeRuntime'

function concluirChamado(
  emitir: ReturnType<typeof useProgressaoNoeRuntime>['emitir'],
) {
  emitir({
    tipo: 'unidade-acao-concluida',
    acaoId: 'noe.chamado.confirmado',
    unidadeId: 'chamado-noe',
  })
}

function concluirTarefasM2(
  emitir: ReturnType<typeof useProgressaoNoeRuntime>['emitir'],
) {
  for (const unidadeId of ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4']) {
    emitir({
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.madeira.coletada',
      unidadeId,
    })
  }
  emitir({
    tipo: 'unidade-acao-concluida',
    acaoId: 'noe.rampa.reparada',
    unidadeId: 'rampa-principal',
  })
  for (const unidadeId of [
    'fenda-casco-1',
    'fenda-casco-2',
    'fenda-casco-3',
  ]) {
    emitir({
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.betume.aplicado',
      unidadeId,
    })
  }
}

describe('useProgressaoNoeRuntime', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
  })

  it('publica o checkpoint local no store e avança M1 por evento explícito', async () => {
    const { result } = renderHook(() => useProgressaoNoeRuntime(true))

    expect(result.current.estado.momentoAtualId).toBe('chamado-canteiro')
    act(() => concluirChamado(result.current.emitir))

    expect(result.current.estado.momentoAtualId).toBe('coleta-vedacao')
    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe).toMatchObject({
        momentosConcluidos: ['chamado-canteiro'],
        progressoMomentoAtual: [],
      }),
    )
  })

  it('não usa histórico nem Selah futuro para pular tarefas locais', () => {
    useGameStore.setState({
      selahsConcluidos: ['genesis-6-14'],
      historico: [
        {
          quizId: 'quiz-noe',
          passagemId: 'genesis-6-14',
          alternativaId: 'A',
          acertou: true,
        },
      ],
    })
    const { result } = renderHook(() => useProgressaoNoeRuntime(true))

    act(() => concluirChamado(result.current.emitir))

    expect(result.current.estado.momentoAtualId).toBe('coleta-vedacao')
    expect(result.current.estado.progressoMomentoAtual).toEqual([])
  })

  it('consome o Selah somente quando a exploração volta após a pausa', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useProgressaoNoeRuntime(enabled),
      { initialProps: { enabled: false } },
    )

    act(() => {
      concluirChamado(result.current.emitir)
      concluirTarefasM2(result.current.emitir)
      useGameStore.setState({ selahsConcluidos: ['genesis-6-14'] })
    })

    expect(result.current.estado.momentoAtualId).toBe('coleta-vedacao')
    rerender({ enabled: true })
    expect(result.current.estado.momentoAtualId).toBe('estoque-mantimentos')
  })

  it('reage ao reset externo do checkpoint sem preservar parcial antigo', () => {
    const { result } = renderHook(() => useProgressaoNoeRuntime(true))

    act(() => concluirChamado(result.current.emitir))
    expect(result.current.estado.momentoAtualId).toBe('coleta-vedacao')

    act(() => useGameStore.getState().apagarProgresso())
    expect(result.current.estado).toMatchObject({
      momentoAtualId: 'chamado-canteiro',
      momentosConcluidos: [],
      progressoMomentoAtual: [],
      concluida: false,
    })
  })
})
