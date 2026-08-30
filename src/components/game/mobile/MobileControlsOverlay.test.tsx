import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../../../stores/gameStore'
import { MobileControlsOverlay } from './MobileControlsOverlay'
import { calcularJoystick } from './joystick'
import {
  consumirArrastoCameraMobile,
  criarEstadoControleMobile,
  definirMovimentoMobile,
  definirPuloMobile,
} from './mobileInput'

describe('calcularJoystick', () => {
  it('normaliza os eixos e limita o arrasto ao círculo', () => {
    expect(
      calcularJoystick(200, 100, {
        centroX: 100,
        centroY: 100,
        raio: 50,
      }),
    ).toEqual({ x: 1, y: 0 })
    expect(
      calcularJoystick(100, 50, {
        centroX: 100,
        centroY: 100,
        raio: 50,
      }),
    ).toEqual({ x: 0, y: 1 })
  })
})

describe('MobileControlsOverlay', () => {
  beforeEach(() => useGameStore.getState().setIdioma('pt-BR'))

  it('só renderiza durante uma sessão touch ativa', () => {
    const input = criarEstadoControleMobile()
    const { rerender } = render(
      <MobileControlsOverlay enabled={false} input={input} />,
    )

    expect(screen.queryByTestId('mobile-controls')).not.toBeInTheDocument()

    rerender(<MobileControlsOverlay enabled input={input} />)
    expect(screen.getByTestId('mobile-controls')).toBeInTheDocument()
  })

  it('segura o pulo enquanto o botão está pressionado', () => {
    const input = criarEstadoControleMobile()
    render(<MobileControlsOverlay enabled input={input} />)
    const pulo = screen.getByRole('button', { name: 'Pular' })

    fireEvent.pointerDown(pulo, { pointerId: 2 })
    expect(input.pular).toBe(true)

    fireEvent.pointerUp(pulo, { pointerId: 2 })
    expect(input.pular).toBe(false)
  })

  it('dispara interação e pausa por botões independentes', () => {
    const input = criarEstadoControleMobile()
    const onPause = vi.fn()
    const confirmar = vi.fn()
    window.addEventListener('keydown', confirmar, { once: true })
    render(
      <MobileControlsOverlay enabled input={input} onPause={onPause} />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Ação' }))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Pausar' }))

    expect(confirmar).toHaveBeenCalledOnce()
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('acumula o arrasto da câmera entre pointer moves', () => {
    const input = criarEstadoControleMobile()
    render(<MobileControlsOverlay enabled input={input} />)
    const camera = screen.getByTestId('mobile-controls').firstElementChild!

    fireEvent.pointerDown(camera, {
      pointerId: 4,
      clientX: 20,
      clientY: 30,
    })
    fireEvent.pointerMove(camera, {
      pointerId: 4,
      clientX: 32,
      clientY: 25,
    })

    expect(consumirArrastoCameraMobile(input)).toEqual({ x: 12, y: -5 })
  })

  it('zera controles presos quando a janela perde foco ou o overlay fecha', () => {
    const input = criarEstadoControleMobile()
    const { rerender } = render(
      <MobileControlsOverlay enabled input={input} />,
    )
    definirMovimentoMobile(input, 1, 0.5)
    definirPuloMobile(input, true)

    fireEvent.blur(window)
    expect(input.movimento).toEqual({ x: 0, y: 0 })
    expect(input.pular).toBe(false)

    definirMovimentoMobile(input, -1, 0)
    rerender(<MobileControlsOverlay enabled={false} input={input} />)
    expect(input.movimento).toEqual({ x: 0, y: 0 })
  })
})
