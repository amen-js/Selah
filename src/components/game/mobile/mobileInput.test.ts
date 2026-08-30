import { describe, expect, it, vi } from 'vitest'
import {
  acumularArrastoCameraMobile,
  combinarControlesJogador,
  consumirArrastoCameraMobile,
  criarEstadoControleMobile,
  definirMovimentoMobile,
  definirPuloMobile,
  dispararInteracaoMobile,
  resetarControleMobile,
} from './mobileInput'

const tecladoParado = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  jump: false,
  run: false,
}

describe('mobileInput', () => {
  it('combina joystick e pulo touch sem apagar o teclado', () => {
    const estado = criarEstadoControleMobile()
    definirMovimentoMobile(estado, 0.45, -0.8)
    definirPuloMobile(estado, true)

    expect(
      combinarControlesJogador(
        { ...tecladoParado, forward: true, run: true },
        estado,
      ),
    ).toEqual({
      ...tecladoParado,
      forward: true,
      run: true,
      jump: true,
      joystick: { x: 0.45, y: -0.8 },
    })
  })

  it('limita os eixos do joystick ao intervalo aceito pelo controller', () => {
    const estado = criarEstadoControleMobile()

    definirMovimentoMobile(estado, 4, -3)

    expect(estado.movimento).toEqual({ x: 1, y: -1 })
  })

  it('consome cada lote de arrasto da câmera uma única vez', () => {
    const estado = criarEstadoControleMobile()
    acumularArrastoCameraMobile(estado, 8, -3)
    acumularArrastoCameraMobile(estado, 2, 7)

    expect(consumirArrastoCameraMobile(estado)).toEqual({ x: 10, y: 4 })
    expect(consumirArrastoCameraMobile(estado)).toEqual({ x: 0, y: 0 })
  })

  it('reseta movimento, pulo e câmera juntos', () => {
    const estado = criarEstadoControleMobile()
    definirMovimentoMobile(estado, 1, 1)
    definirPuloMobile(estado, true)
    acumularArrastoCameraMobile(estado, 4, 5)

    resetarControleMobile(estado)

    expect(estado).toEqual(criarEstadoControleMobile())
  })

  it('traduz Ação para o mesmo evento E cancelável do árbitro existente', () => {
    const confirmar = vi.fn((event: KeyboardEvent) => {
      expect(event.code).toBe('KeyE')
      expect(event.key).toBe('e')
      event.preventDefault()
    })
    window.addEventListener('keydown', confirmar, { once: true })

    expect(dispararInteracaoMobile()).toBe(false)
    expect(confirmar).toHaveBeenCalledOnce()
  })
})
