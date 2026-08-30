import type { MovementInput } from 'ecctrl'

export type VetorControleMobile = {
  x: number
  y: number
}

export type EstadoControleMobile = {
  movimento: VetorControleMobile
  pular: boolean
  arrastoCamera: VetorControleMobile
}

type ControlesTeclado = Readonly<{
  forward: boolean
  backward: boolean
  leftward: boolean
  rightward: boolean
  jump: boolean
  run: boolean
}>

const limitarEixo = (valor: number) => Math.min(1, Math.max(-1, valor))

/** Mutable input sampled by the render loop, avoiding React renders per move. */
export function criarEstadoControleMobile(): EstadoControleMobile {
  return {
    movimento: { x: 0, y: 0 },
    pular: false,
    arrastoCamera: { x: 0, y: 0 },
  }
}

export function definirMovimentoMobile(
  estado: EstadoControleMobile,
  x: number,
  y: number,
) {
  estado.movimento.x = limitarEixo(x)
  estado.movimento.y = limitarEixo(y)
}

export function definirPuloMobile(
  estado: EstadoControleMobile,
  ativo: boolean,
) {
  estado.pular = ativo
}

export function acumularArrastoCameraMobile(
  estado: EstadoControleMobile,
  deltaX: number,
  deltaY: number,
) {
  estado.arrastoCamera.x += deltaX
  estado.arrastoCamera.y += deltaY
}

export function consumirArrastoCameraMobile(
  estado: EstadoControleMobile,
): VetorControleMobile {
  const arrasto = {
    x: estado.arrastoCamera.x,
    y: estado.arrastoCamera.y,
  }
  estado.arrastoCamera.x = 0
  estado.arrastoCamera.y = 0
  return arrasto
}

export function resetarControleMobile(estado: EstadoControleMobile) {
  definirMovimentoMobile(estado, 0, 0)
  definirPuloMobile(estado, false)
  estado.arrastoCamera.x = 0
  estado.arrastoCamera.y = 0
}

/** Keeps keyboard and touch inputs independent and usable at the same time. */
export function combinarControlesJogador(
  teclado: ControlesTeclado,
  mobile: EstadoControleMobile,
): MovementInput {
  return {
    ...teclado,
    jump: teclado.jump || mobile.pular,
    joystick: {
      x: mobile.movimento.x,
      y: mobile.movimento.y,
    },
  }
}

/** Reuses the world's existing E/Enter arbiter, including its precedence rules. */
export function dispararInteracaoMobile(alvo: Window = window) {
  return alvo.dispatchEvent(
    new KeyboardEvent('keydown', {
      code: 'KeyE',
      key: 'e',
      bubbles: true,
      cancelable: true,
    }),
  )
}
