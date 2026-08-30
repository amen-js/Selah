import { act, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import type { TtsController, TtsEstado } from '../../../../services/tts'
import { useGameStore } from '../../../../stores/gameStore'
import { DialogoMissaoNoe } from './DialogoMissaoNoe'

function criarTtsControlavel() {
  let estado: TtsEstado = 'idle'
  const listeners = new Set<(novoEstado: TtsEstado) => void>()
  const emitir = (novoEstado: TtsEstado) => {
    if (novoEstado === estado) return
    estado = novoEstado
    for (const listener of listeners) listener(novoEstado)
  }
  const tts: TtsController = {
    suportado: true,
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

  return tts
}

async function iniciarNarracao() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

describe('DialogoMissaoNoe', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.setState({
      idioma: 'pt-BR',
      faixaEtaria: 'geral',
      ttsAtivo: false,
      narracaoAtiva: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('só conclui a missão após as três falas', () => {
    const onConcluir = vi.fn()
    render(
      <DialogoMissaoNoe onConcluir={onConcluir} onCancelar={vi.fn()} />,
    )

    const continuar = () =>
      screen.getByRole('button', { name: /continue|continuar/i })

    fireEvent.click(continuar())
    expect(onConcluir).not.toHaveBeenCalled()
    fireEvent.click(continuar())
    expect(onConcluir).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getByRole('button', {
        name: /begin the mission|começar a missão|comenzar la misión/i,
      }),
    )

    expect(onConcluir).toHaveBeenCalledTimes(1)
  })

  it('permite ouvir depois, cancela a voz e não conclui o checkpoint', async () => {
    const tts = criarTtsControlavel()
    const onConcluir = vi.fn()
    const onCancelar = vi.fn()
    useGameStore.setState({ faixaEtaria: 'crianca' })
    render(
      <DialogoMissaoNoe
        tts={tts}
        onConcluir={onConcluir}
        onCancelar={onCancelar}
      />,
    )
    await iniciarNarracao()

    fireEvent.click(
      screen.getByRole('button', {
        name: /listen later|ouvir depois|escuchar después/i,
      }),
    )
    expect(onCancelar).toHaveBeenCalledTimes(1)
    expect(onConcluir).not.toHaveBeenCalled()
    expect(tts.cancelar).toHaveBeenCalled()
    expect(tts.estado()).toBe('idle')
    expect(useGameStore.getState().narracaoAtiva).toBe(false)
  })

  it('narra cada fala uma única vez para o perfil infantil em Strict Mode', async () => {
    const tts = criarTtsControlavel()
    useGameStore.setState({ faixaEtaria: 'crianca' })
    render(
      <StrictMode>
        <DialogoMissaoNoe
          tts={tts}
          onConcluir={vi.fn()}
          onCancelar={vi.fn()}
        />
      </StrictMode>,
    )

    await iniciarNarracao()
    expect(tts.narrar).toHaveBeenCalledOnce()
    expect(tts.narrar).toHaveBeenLastCalledWith({
      narracaoId: 'noe.mission.line1',
      idioma: 'pt-BR',
      textoFallback:
        'Deus nos confiou uma grande missão: preparar um abrigo seguro para a vida.',
    })
    expect(useGameStore.getState().narracaoAtiva).toBe(true)

    fireEvent.click(
      screen.getByRole('button', { name: /continue|continuar/i }),
    )
    await iniciarNarracao()
    fireEvent.click(
      screen.getByRole('button', { name: /continue|continuar/i }),
    )
    await iniciarNarracao()

    expect(
      vi.mocked(tts.narrar).mock.calls.map(([narracao]) =>
        narracao.narracaoId,
      ),
    ).toEqual([
      'noe.mission.line1',
      'noe.mission.line2',
      'noe.mission.line3',
    ])
    expect(tts.cancelar).toHaveBeenCalled()
  })

  it('permanece silencioso para perfil geral sem a preferência de TTS', async () => {
    const tts = criarTtsControlavel()
    render(
      <DialogoMissaoNoe
        tts={tts}
        onConcluir={vi.fn()}
        onCancelar={vi.fn()}
      />,
    )

    await iniciarNarracao()
    expect(tts.narrar).not.toHaveBeenCalled()
    expect(useGameStore.getState().narracaoAtiva).toBe(false)
  })

  it('cancela a fala anterior e reinicia no idioma selecionado', async () => {
    const tts = criarTtsControlavel()
    useGameStore.setState({ ttsAtivo: true })
    const { unmount } = render(
      <DialogoMissaoNoe
        tts={tts}
        onConcluir={vi.fn()}
        onCancelar={vi.fn()}
      />,
    )

    await iniciarNarracao()
    act(() => useGameStore.getState().setIdioma('es-ES'))
    await iniciarNarracao()

    expect(tts.narrar).toHaveBeenLastCalledWith({
      narracaoId: 'noe.mission.line1',
      idioma: 'es-ES',
      textoFallback:
        'Dios nos confió una gran misión: preparar un refugio seguro para la vida.',
    })
    expect(tts.cancelar).toHaveBeenCalled()

    unmount()
    expect(tts.estado()).toBe('idle')
    expect(useGameStore.getState().narracaoAtiva).toBe(false)
  })
})
