import { act, fireEvent, render, screen } from '@testing-library/react'

import App from './App'
import { momentosCriacao } from './components/game/creation/progression/catalogo'
import type { SnapshotProgressaoCriacao } from './components/game/creation/progression/types'
import { GAME_STORAGE_KEY, useGameStore } from './stores/gameStore'

const canvasMock = vi.hoisted(() => ({
  element: null as HTMLCanvasElement | null,
  shouldThrow: false,
  onProgressaoCriacaoChange: null as ((
    snapshot: SnapshotProgressaoCriacao | null,
  ) => void) | null,
  onInatividadeCriacaoChange: null as ((inativo: boolean) => void) | null,
}))

const selahAudioMock = vi.hoisted(() => ({
  useSelahAudio: vi.fn(),
}))

const progressMock = vi.hoisted(() => ({
  state: {
    active: false,
    progress: 100,
    item: '',
    loaded: 1,
    total: 1,
    errors: [] as string[],
  },
}))

vi.mock('@react-three/drei', () => ({
  useProgress: () => progressMock.state,
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
      onSceneReady,
      onProgressaoCriacaoChange,
      onInatividadeCriacaoChange,
      touchControls,
      onPause,
    }: {
      playing: boolean
      onCanvasReady?: (canvas: HTMLCanvasElement) => void
      onSceneReady?: () => void
      onProgressaoCriacaoChange?: (
        snapshot: SnapshotProgressaoCriacao | null,
      ) => void
      onInatividadeCriacaoChange?: (inativo: boolean) => void
      touchControls?: boolean
      onPause?: () => void
    }) => {
      if (canvasMock.shouldThrow) throw new Error('webgl-scene-failed')
      canvasMock.onProgressaoCriacaoChange = onProgressaoCriacaoChange ?? null
      canvasMock.onInatividadeCriacaoChange =
        onInatividadeCriacaoChange ?? null

      useEffect(() => {
        if (canvasMock.element) onCanvasReady?.(canvasMock.element)
        onSceneReady?.()
      }, [onCanvasReady, onSceneReady])

      return (
        <div
          data-testid="game-canvas"
          data-playing={String(playing)}
          data-touch-controls={String(touchControls)}
        >
          {touchControls && (
            <button type="button" onClick={onPause}>
              Pausar no celular
            </button>
          )}
        </div>
      )
    },
  }
})

vi.mock('./components/game/GameOverlay', () => ({
  GameOverlay: ({
    progressaoCriacao,
    exploracaoAtiva,
    inatividadeCriacao,
  }: {
    progressaoCriacao?: SnapshotProgressaoCriacao
    exploracaoAtiva?: boolean
    inatividadeCriacao?: boolean
  }) => (
    <aside
      data-testid="game-overlay"
      data-momento={progressaoCriacao?.momento.id}
      data-exploracao-ativa={String(exploracaoAtiva)}
      data-inatividade-criacao={String(inatividadeCriacao)}
    />
  ),
}))

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

describe('App integration', () => {
  let pointerLockElement: Element | null
  let exitPointerLock: ReturnType<typeof vi.fn>
  let requestPointerLock: ReturnType<typeof vi.fn>
  let coarsePointer: boolean

  beforeEach(() => {
    selahAudioMock.useSelahAudio.mockClear()
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    useGameStore.getState().concluirConfiguracaoInicial()
    pointerLockElement = null
    coarsePointer = false
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)' && coarsePointer,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    })
    requestPointerLock = vi.fn()
    canvasMock.element = document.createElement('canvas')
    canvasMock.shouldThrow = false
    canvasMock.onProgressaoCriacaoChange = null
    canvasMock.onInatividadeCriacaoChange = null
    progressMock.state = {
      active: false,
      progress: 100,
      item: '',
      loaded: 1,
      total: 1,
      errors: [],
    }
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
    expect(screen.getByRole('heading', { name: 'Selah', level: 1 })).toBeInTheDocument()
    expect(
      document.querySelector('img[src="/brand/selah-logo.avif"]'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Entrar no mundo' }))
    expect(requestPointerLock).toHaveBeenCalledOnce()
  })

  it('forwards the active Creation snapshot and exploration status to the overlay', () => {
    render(<App />)

    act(() => {
      pointerLockElement = canvasMock.element
      document.dispatchEvent(new Event('pointerlockchange'))
      canvasMock.onProgressaoCriacaoChange?.(snapshotVazio)
    })

    expect(screen.getByTestId('game-overlay')).toHaveAttribute('data-momento', 'vazio')
    expect(screen.getByTestId('game-overlay')).toHaveAttribute(
      'data-exploracao-ativa',
      'true',
    )
  })

  it('updates and clears transient Creation state without changing pointer lock or storage', () => {
    render(<App />)

    act(() => {
      pointerLockElement = canvasMock.element
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    const persistedBefore = localStorage.getItem(GAME_STORAGE_KEY)

    act(() => canvasMock.onProgressaoCriacaoChange?.(snapshotVazio))
    act(() => canvasMock.onInatividadeCriacaoChange?.(true))
    act(() => canvasMock.onProgressaoCriacaoChange?.(snapshotLuz))

    expect(screen.getByTestId('game-overlay')).toHaveAttribute('data-momento', 'luz')
    expect(screen.getByTestId('game-overlay')).toHaveAttribute(
      'data-inatividade-criacao',
      'true',
    )
    expect(exitPointerLock).not.toHaveBeenCalled()
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBe(persistedBefore)

    act(() => canvasMock.onProgressaoCriacaoChange?.(null))

    expect(screen.getByTestId('game-overlay')).not.toHaveAttribute('data-momento')
    expect(screen.getByTestId('game-overlay')).toHaveAttribute(
      'data-exploracao-ativa',
      'true',
    )
    expect(screen.getByTestId('game-overlay')).toHaveAttribute(
      'data-inatividade-criacao',
      'false',
    )
    expect(exitPointerLock).not.toHaveBeenCalled()
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBe(persistedBefore)
  })

  it('keeps exploration and pointer lock while later Creation chunks load', () => {
    const { rerender } = render(<App />)

    act(() => {
      pointerLockElement = canvasMock.element
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-playing',
      'true',
    )

    progressMock.state = {
      active: true,
      progress: 20,
      item: '/models/creation/nature/tree.glb',
      loaded: 0,
      total: 1,
      errors: [],
    }
    rerender(<App />)

    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-playing',
      'true',
    )
    expect(screen.getByTestId('game-overlay')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'O mundo está despertando' }),
    ).not.toBeInTheDocument()
    expect(exitPointerLock).not.toHaveBeenCalled()
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

  it('keeps the responsible onboarding in front while the scene loads', () => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    progressMock.state = {
      active: true,
      progress: 32,
      item: '/models/hub.glb',
      loaded: 0,
      total: 1,
      errors: [],
    }

    render(<App />)

    expect(
      screen.getByRole('dialog', { name: 'Configuração do responsável' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'O mundo está despertando' }),
    ).not.toBeInTheDocument()
  })

  it('blocks entry and overlay controls until the scene is ready', () => {
    progressMock.state = {
      active: true,
      progress: 42,
      item: '/models/hub.glb',
      loaded: 0,
      total: 1,
      errors: [],
    }

    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'O mundo está despertando' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
    expect(screen.queryByRole('button', { name: 'Entrar no mundo' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('game-overlay')).not.toBeInTheDocument()
    expect(requestPointerLock).not.toHaveBeenCalled()
  })

  it('accepts the resolved scene signal when the loading manager has no totals', () => {
    progressMock.state = {
      active: false,
      progress: 0,
      item: '',
      loaded: 0,
      total: 0,
      errors: [],
    }

    render(<App />)

    expect(screen.getByRole('button', { name: 'Entrar no mundo' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'O mundo está despertando' }),
    ).not.toBeInTheDocument()
  })

  it('offers a reload when the loading manager reports an asset failure', () => {
    const reloadPage = vi.fn()
    progressMock.state = {
      active: false,
      progress: 58,
      item: '/models/broken.glb',
      loaded: 0,
      total: 1,
      errors: ['/models/broken.glb'],
    }

    render(<App reloadPage={reloadPage} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O jardim precisa de mais um instante',
    )
    expect(screen.queryByText('/models/broken.glb')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(reloadPage).toHaveBeenCalledOnce()
  })

  it('recovers visibly when the scene render tree throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const reloadPage = vi.fn()
    canvasMock.shouldThrow = true

    render(<App reloadPage={reloadPage} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O jardim precisa de mais um instante',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(reloadPage).toHaveBeenCalledOnce()
    consoleError.mockRestore()
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

  it('starts and pauses touch exploration without Pointer Lock', () => {
    coarsePointer = true
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrar no mundo' }))

    expect(requestPointerLock).not.toHaveBeenCalled()
    expect(screen.getByRole('main')).toHaveClass('has-touch-controls')
    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-touch-controls',
      'true',
    )
    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-playing',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pausar no celular' }))

    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-playing',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Continuar jornada' })).toBeInTheDocument()
  })

  it('offers touch controls on a hybrid device with a fine primary pointer', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 5,
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrar no mundo' }))

    expect(requestPointerLock).not.toHaveBeenCalled()
    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-touch-controls',
      'true',
    )
    expect(screen.getByTestId('game-canvas')).toHaveAttribute(
      'data-playing',
      'true',
    )
  })
})
