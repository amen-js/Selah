import { act, fireEvent, render, screen } from '@testing-library/react'

import App from './App'
import { useGameStore } from './stores/gameStore'

const canvasMock = vi.hoisted(() => ({
  element: null as HTMLCanvasElement | null,
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
    useGameStore.getState().apagarProgresso()
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

    expect(screen.getByTestId('game-canvas')).toHaveAttribute('data-playing', 'false')
    expect(screen.getByTestId('game-overlay')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Entrar no mundo' }))
    expect(requestPointerLock).toHaveBeenCalledOnce()
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
