import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useGameStore } from '../stores/gameStore'
import { useSelahAudio } from './useSelahAudio'

const howlerMock = vi.hoisted(() => ({
  fade: vi.fn(),
  play: vi.fn(() => 7),
  playing: vi.fn(() => false),
  stop: vi.fn(),
  unload: vi.fn(),
  volume: vi.fn(() => 0.7),
}))

vi.mock('howler', () => ({
  Howl: vi.fn(function HowlMock() {
    return howlerMock
  }),
}))

describe('useSelahAudio', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    howlerMock.playing.mockReturnValue(false)
    howlerMock.volume.mockReturnValue(0.7)
    useGameStore.getState().apagarProgresso()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fades the reflection cue in and out with the Selah flow', () => {
    const { unmount } = renderHook(() => useSelahAudio())

    act(() => {
      useGameStore.getState().abrirSelah({
        historiaId: 'criacao',
        passagemId: 'GEN.1.1',
      })
    })

    expect(howlerMock.play).toHaveBeenCalledOnce()
    expect(howlerMock.fade).toHaveBeenCalledWith(0, 0.7, 900, 7)

    act(() => {
      useGameStore.getState().cancelarSelah()
    })

    expect(howlerMock.fade).toHaveBeenCalledWith(0.7, 0, 650, 7)

    act(() => {
      vi.advanceTimersByTime(650)
    })

    expect(howlerMock.stop).toHaveBeenCalledWith(7)

    unmount()
    expect(howlerMock.unload).toHaveBeenCalledOnce()
  })

  it('ducks ambient audio during narration and restores it after pause', () => {
    const { unmount } = renderHook(() => useSelahAudio())

    act(() => {
      useGameStore.getState().abrirSelah({
        historiaId: 'criacao',
        passagemId: 'GEN.1.1',
      })
    })
    howlerMock.playing.mockReturnValue(true)
    act(() => useGameStore.getState().setNarracaoAtiva(true))

    expect(howlerMock.fade).toHaveBeenCalledWith(0.7, 0.18, 250, 7)

    howlerMock.volume.mockReturnValueOnce(0.18)
    act(() => useGameStore.getState().setNarracaoAtiva(false))
    expect(howlerMock.fade).toHaveBeenCalledWith(0.18, 0.7, 250, 7)

    unmount()
  })
})
