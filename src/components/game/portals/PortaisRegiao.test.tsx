import { act, fireEvent, render } from '@testing-library/react'
import type { PortalMapa, PosicaoXZ } from './types'
import { PortaisRegiao } from './PortaisRegiao'

const frameMock = vi.hoisted(() => ({ callbacks: [] as unknown[] }))

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: unknown) => frameMock.callbacks.push(callback),
}))

vi.mock('./PortalVisual', () => ({
  PortalVisual: ({ portal }: { portal: PortalMapa }) => (
    <div data-testid={`portal-${portal.id}`} />
  ),
}))

const portais: readonly PortalMapa[] = [
  {
    id: 'distante',
    destino: 'hub',
    posicao: [1.5, 0, 0],
    raioAtivacao: 2,
  },
  {
    id: 'proximo',
    destino: 'criacao',
    posicao: [0.5, 0, 0],
    raioAtivacao: 2,
  },
]

function executarFrameDeInteracao() {
  const callback = frameMock.callbacks[0] as (
    estado: unknown,
    delta: number,
  ) => void
  callback({}, 1 / 60)
}

describe('PortaisRegiao', () => {
  const playerRef: { current: PosicaoXZ | null } = {
    current: { x: 0, z: 0 },
  }

  beforeEach(() => {
    frameMock.callbacks.length = 0
    playerRef.current = { x: 0, z: 0 }
  })

  it('preserva a confirmação interna por padrão', () => {
    const onPortalAcionado = vi.fn()
    render(
      <PortaisRegiao
        portais={portais}
        playerRef={playerRef}
        enabled
        onPortalAcionado={onPortalAcionado}
      />,
    )

    act(executarFrameDeInteracao)
    const evento = new KeyboardEvent('keydown', {
      code: 'KeyE',
      bubbles: true,
      cancelable: true,
    })
    window.dispatchEvent(evento)

    expect(evento.defaultPrevented).toBe(true)
    expect(onPortalAcionado).toHaveBeenCalledOnce()
    expect(onPortalAcionado).toHaveBeenCalledWith(portais[1])
  })

  it('em confirmação externa publica candidatos sem acionar ou consumir a tecla', () => {
    const onPortalProximo = vi.fn()
    const onPortalAcionavel = vi.fn()
    const onPortalAcionado = vi.fn()
    render(
      <PortaisRegiao
        portais={portais}
        playerRef={playerRef}
        enabled
        confirmacaoExterna
        onPortalProximo={onPortalProximo}
        onPortalAcionavel={onPortalAcionavel}
        onPortalAcionado={onPortalAcionado}
      />,
    )

    act(executarFrameDeInteracao)
    expect(onPortalProximo).toHaveBeenLastCalledWith(portais[1])
    expect(onPortalAcionavel).toHaveBeenLastCalledWith(portais[1])

    const evento = new KeyboardEvent('keydown', {
      code: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    window.dispatchEvent(evento)

    expect(evento.defaultPrevented).toBe(false)
    expect(onPortalAcionado).not.toHaveBeenCalled()
  })

  it('continua renderizando os portais no modo externo', () => {
    const { getByTestId } = render(
      <PortaisRegiao
        portais={portais}
        playerRef={playerRef}
        enabled
        confirmacaoExterna
      />,
    )

    expect(getByTestId('portal-distante')).toBeInTheDocument()
    expect(getByTestId('portal-proximo')).toBeInTheDocument()

    fireEvent.keyDown(window, { code: 'KeyE' })
  })
})
