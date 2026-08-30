import { act, fireEvent, render, screen } from '@testing-library/react'

import App from './App'
import { useGameStore } from './stores/gameStore'

const canvasMock = vi.hoisted(() => ({
  element: null as HTMLCanvasElement | null,
}))

const selahAudioMock = vi.hoisted(() => ({
  useSelahAudio: vi.fn(),
}))

vi.mock('./hooks/useSelahAudio', () => ({
  useSelahAudio: selahAudioMock.useSelahAudio,
}))

vi.mock('./components/game/GameCanvas', async () => {
  const { useEffect } = await import('react')

  return {
    GameCanvas: ({
      playing,
      onCanvasReady,
    }: {
      playing: boolean
      onCanvasReady?: (canvas: HTMLCanvasElement) => void
    }) => {
      useEffect(() => {
        if (canvasMock.element) onCanvasReady?.(canvasMock.element)
      }, [onCanvasReady])

      return <div data-testid="game-canvas" data-playing={String(playing)} />
    },
  }
})

vi.mock('./components/game/GameOverlay', () => ({
  GameOverlay: () => <aside data-testid="game-overlay" />,
}))

describe('App integration', () => {
  let pointerLockElement: Element | null
  let exitPointerLock: ReturnType<typeof vi.fn>
  let requestPointerLock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    selahAudioMock.useSelahAudio.mockClear()
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    useGameStore.getState().concluirConfiguracaoInicial()
    pointerLockElement = null
    requestPointerLock = vi.fn()
    canvasMock.element = document.createElement('canvas')
    Object.defineProperty(canvasMock.element, 'requestPointerLock', {
      configurable: true,
      value: requestPointerLock,
    })
    Object.defineProperty(document, 'pointerLockElement', {
      configurable: true,
      get: () => pointerLockElement,
    })
    exitPointerLock = vi.fn(() => {
      pointerLockElement = null
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    Object.defineProperty(document, 'exitPointerLock', {
      configurable: true,
      value: exitPointerLock,
    })
  })

  it('mounts the Canvas and DOM overlay together', () => {
    render(<App />)

    expect(selahAudioMock.useSelahAudio).toHaveBeenCalledOnce()
    expect(screen.getByTestId('game-canvas')).toHaveAttribute('data-playing', 'false')
    expect(screen.getByTestId('game-overlay')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A Criação' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Noé e a Arca' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'José, o Sonhador' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Entrar no mundo' }))
    expect(requestPointerLock).toHaveBeenCalledOnce()
  })

  it('requires responsible setup before requesting pointer lock', () => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    render(<App />)

    expect(
      screen.getByRole('dialog', { name: 'Configuração do responsável' }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('game-overlay')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Entrar no mundo' })).not.toBeInTheDocument()
    expect(requestPointerLock).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Jogar sem salvar' }))

    expect(
      screen.queryByRole('dialog', { name: 'Configuração do responsável' }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('game-overlay')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Entrar no mundo' }))
    expect(requestPointerLock).toHaveBeenCalledOnce()

    act(() => useGameStore.getState().apagarProgresso())
    expect(
      screen.getByRole('dialog', { name: 'Configuração do responsável' }),
    ).toBeInTheDocument()
  })

  it('translates the entry screen and controls immediately', () => {
    useGameStore.getState().setIdioma('en-US')
    render(<App />)

    expect(screen.getByRole('button', { name: 'Enter the world' })).toBeInTheDocument()
    expect(screen.getByLabelText('Game controls')).toHaveTextContent('Space Jump')

    act(() => useGameStore.getState().setIdioma('es-ES'))

    expect(screen.getByRole('button', { name: 'Entrar al mundo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Controles del juego')).toHaveTextContent(
      'Ratón Cámara',
    )
  })

  it('disables exploration and exits pointer lock when an overlay blocks the game', () => {
    render(<App />)

    act(() => {
      pointerLockElement = canvasMock.element
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    expect(screen.getByTestId('game-canvas')).toHaveAttribute('data-playing', 'true')

    act(() => {
      useGameStore.getState().setDialogoAberto(true)
    })

    expect(exitPointerLock).toHaveBeenCalledOnce()
    expect(screen.getByTestId('game-canvas')).toHaveAttribute('data-playing', 'false')
    expect(screen.getByRole('main')).toHaveClass('is-overlay-active')
  })

  it('pauses active exploration with the P shortcut', () => {
    render(<App />)

    act(() => {
      pointerLockElement = canvasMock.element
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    fireEvent.keyDown(document, { code: 'KeyP' })

    expect(exitPointerLock).toHaveBeenCalledOnce()
    expect(screen.getByTestId('game-canvas')).toHaveAttribute('data-playing', 'false')
    expect(screen.getByRole('button', { name: 'Continuar jornada' })).toBeInTheDocument()
  })
})
