import { act, renderHook } from '@testing-library/react'
import { StrictMode, type PropsWithChildren, type ReactNode } from 'react'

import { buscarNarracaoCriacao } from '../content/creationNarrations'
import type { SnapshotProgressaoCriacao } from '../components/game/creation/progression'
import { momentosCriacao } from '../components/game/creation/progression'
import type { TtsController, TtsEstado } from '../services/tts'
import { useGameStore } from '../stores/gameStore'
import { useCreationNarration } from './useCreationNarration'

const snapshotVazio: SnapshotProgressaoCriacao = {
  momento: momentosCriacao[0],
  estado: {
    momentoAtualId: 'vazio',
    momentosConcluidos: [],
    concluida: false,
  },
}

const snapshotLuz: SnapshotProgressaoCriacao = {
  momento: momentosCriacao[1],
  estado: {
    momentoAtualId: 'luz',
    momentosConcluidos: ['vazio'],
    concluida: false,
  },
}

const snapshotFinal: SnapshotProgressaoCriacao = {
  momento: momentosCriacao[8],
  estado: {
    momentoAtualId: 'fruto-escolha',
    momentosConcluidos: momentosCriacao.slice(0, 8).map(({ id }) => id),
    concluida: false,
  },
}

function criarTtsControlavel(suportado = true) {
  let estado: TtsEstado = 'idle'
  const listeners = new Set<(novoEstado: TtsEstado) => void>()
  const emitir = (novoEstado: TtsEstado) => {
    if (novoEstado === estado) return
    estado = novoEstado
    for (const listener of listeners) listener(novoEstado)
  }

  const tts: TtsController = {
    suportado,
    estado: () => estado,
    assinar: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    falar: vi.fn(),
    narrar: vi.fn(async () => {
      emitir('loading')
      emitir('playing')
    }),
    pausar: vi.fn(() => emitir('paused')),
    retomar: vi.fn(() => emitir('playing')),
    cancelar: vi.fn(() => emitir('idle')),
  }

  return { tts, emitir }
}

async function avancarTempo(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

async function emitirEstado(
  controle: ReturnType<typeof criarTtsControlavel>,
  estado: TtsEstado,
) {
  await act(async () => {
    controle.emitir(estado)
    await Promise.resolve()
  })
}

function strictWrapper({ children }: PropsWithChildren): ReactNode {
  return <StrictMode>{children}</StrictMode>
}

describe('useCreationNarration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    useGameStore.getState().setFaixaEtaria('geral')
    useGameStore.getState().setTtsAtivo(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts the first moment narration once under React StrictMode', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')

    const { result } = renderHook(
      () =>
        useCreationNarration({
          snapshot: snapshotVazio,
          inatividade: false,
          ativo: true,
          tts: controle.tts,
        }),
      { wrapper: strictWrapper },
    )

    expect(result.current.linha?.fase).toBe('inicial')
    expect(controle.tts.narrar).not.toHaveBeenCalled()

    await avancarTempo(0)

    expect(controle.tts.narrar).toHaveBeenCalledOnce()
    expect(controle.tts.narrar).toHaveBeenCalledWith({
      narracaoId: 'criacao.vazio.inicial',
      idioma: 'pt-BR',
      textoFallback: buscarNarracaoCriacao(
        'criacao.vazio.inicial',
        'pt-BR',
      )?.texto,
    })
  })

  it('enables automatic narration for a general profile preference', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setTtsAtivo(true)

    renderHook(() =>
      useCreationNarration({
        snapshot: snapshotVazio,
        inatividade: false,
        ativo: true,
        tts: controle.tts,
      }),
    )

    await avancarTempo(0)

    expect(controle.tts.narrar).toHaveBeenCalledOnce()
  })

  it('keeps silent narration visible for exactly four seconds', async () => {
    const controle = criarTtsControlavel()
    const { result } = renderHook(() =>
      useCreationNarration({
        snapshot: snapshotVazio,
        inatividade: false,
        ativo: true,
        tts: controle.tts,
      }),
    )

    expect(result.current.linha?.fase).toBe('inicial')

    await avancarTempo(3_999)
    expect(result.current.linha?.fase).toBe('inicial')
    expect(controle.tts.narrar).not.toHaveBeenCalled()

    await avancarTempo(1)
    expect(result.current.linha).toMatchObject({
      fase: 'objetivo',
      texto: 'Dê alguns passos e descubra o primeiro caminho.',
    })
  })

  it('sequences the outgoing transition before the incoming initial line', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    const { result, rerender } = renderHook(
      ({ snapshot }: { snapshot: SnapshotProgressaoCriacao }) =>
        useCreationNarration({
          snapshot,
          inatividade: false,
          ativo: true,
          tts: controle.tts,
        }),
      { initialProps: { snapshot: snapshotVazio } },
    )

    await avancarTempo(0)
    await emitirEstado(controle, 'idle')
    expect(result.current.linha?.fase).toBe('objetivo')

    rerender({ snapshot: snapshotLuz })
    expect(result.current.linha).toMatchObject({
      fase: 'transicao',
      narracaoId: 'criacao.vazio.transicao',
    })

    await avancarTempo(0)
    await emitirEstado(controle, 'idle')
    expect(result.current.linha).toMatchObject({
      fase: 'inicial',
      narracaoId: 'criacao.luz.inicial',
    })

    await avancarTempo(0)
    await emitirEstado(controle, 'idle')
    expect(result.current.linha?.fase).toBe('objetivo')
    expect(vi.mocked(controle.tts.narrar).mock.calls.map(([fala]) => fala.narracaoId)).toEqual([
      'criacao.vazio.inicial',
      'criacao.vazio.transicao',
      'criacao.luz.inicial',
    ])
  })

  it('queues support after the current line and only once per inactivity episode', async () => {
    const controle = criarTtsControlavel()
    const { result, rerender } = renderHook(
      ({ inatividade }: { inatividade: boolean }) =>
        useCreationNarration({
          snapshot: snapshotVazio,
          inatividade,
          ativo: true,
          tts: controle.tts,
        }),
      { initialProps: { inatividade: false } },
    )

    rerender({ inatividade: true })
    expect(result.current.linha?.fase).toBe('inicial')

    await avancarTempo(4_000)
    expect(result.current.linha).toMatchObject({
      fase: 'apoio',
      narracaoId: 'criacao.vazio.apoio',
    })
    await avancarTempo(4_000)
    expect(result.current.linha?.fase).toBe('objetivo')

    await avancarTempo(20_000)
    expect(result.current.linha?.fase).toBe('objetivo')

    rerender({ inatividade: false })
    rerender({ inatividade: true })
    expect(result.current.linha?.fase).toBe('apoio')
  })

  it('cancels and invalidates stale work when narration becomes inactive', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    const { result, rerender } = renderHook(
      ({ ativo }: { ativo: boolean }) =>
        useCreationNarration({
          snapshot: snapshotVazio,
          inatividade: false,
          ativo,
          tts: controle.tts,
        }),
      { initialProps: { ativo: true } },
    )

    await avancarTempo(0)
    expect(result.current.linha?.fase).toBe('inicial')

    rerender({ ativo: false })
    expect(controle.tts.cancelar).toHaveBeenCalled()
    expect(result.current.linha?.fase).toBe('objetivo')

    await emitirEstado(controle, 'error')
    await avancarTempo(10_000)
    expect(result.current.linha?.fase).toBe('objetivo')
    expect(controle.tts.narrar).toHaveBeenCalledOnce()
  })

  it('cancels and restarts the current line when the language changes', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    const { result } = renderHook(() =>
      useCreationNarration({
        snapshot: snapshotVazio,
        inatividade: false,
        ativo: true,
        tts: controle.tts,
      }),
    )

    await avancarTempo(0)
    act(() => useGameStore.getState().setIdioma('en-US'))

    expect(controle.tts.cancelar).toHaveBeenCalled()
    expect(result.current.linha).toMatchObject({
      fase: 'inicial',
      texto: buscarNarracaoCriacao('criacao.vazio.inicial', 'en-US')?.texto,
    })

    await avancarTempo(0)
    expect(controle.tts.narrar).toHaveBeenLastCalledWith({
      narracaoId: 'criacao.vazio.inicial',
      idioma: 'en-US',
      textoFallback: buscarNarracaoCriacao(
        'criacao.vazio.inicial',
        'en-US',
      )?.texto,
    })
  })

  it('emits the final transition when the ninth moment becomes complete', async () => {
    const controle = criarTtsControlavel()
    const { result, rerender } = renderHook(
      ({ snapshot }: { snapshot: SnapshotProgressaoCriacao }) =>
        useCreationNarration({
          snapshot,
          inatividade: false,
          ativo: true,
          tts: controle.tts,
        }),
      { initialProps: { snapshot: snapshotFinal } },
    )

    await avancarTempo(4_000)
    expect(result.current.linha?.fase).toBe('objetivo')

    rerender({
      snapshot: {
        ...snapshotFinal,
        estado: { ...snapshotFinal.estado, concluida: true },
      },
    })

    expect(result.current.linha).toMatchObject({
      fase: 'transicao',
      narracaoId: 'criacao.fruto-escolha.transicao',
    })
    await avancarTempo(4_000)
    expect(result.current.linha?.fase).toBe('objetivo')
  })

  it('advances without stalling when narration reaches an error terminal', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    const { result } = renderHook(() =>
      useCreationNarration({
        snapshot: snapshotVazio,
        inatividade: false,
        ativo: true,
        tts: controle.tts,
      }),
    )

    await avancarTempo(0)
    expect(result.current.linha?.fase).toBe('inicial')

    await emitirEstado(controle, 'error')
    expect(result.current.linha?.fase).toBe('objetivo')
  })

  it('uses silent dwell without a request when the controller is unsupported', async () => {
    const controle = criarTtsControlavel(false)
    useGameStore.getState().setFaixaEtaria('crianca')
    const { result } = renderHook(() =>
      useCreationNarration({
        snapshot: snapshotVazio,
        inatividade: false,
        ativo: true,
        tts: controle.tts,
      }),
    )

    await avancarTempo(4_000)

    expect(controle.tts.narrar).not.toHaveBeenCalled()
    expect(result.current.linha?.fase).toBe('objetivo')
  })
})
