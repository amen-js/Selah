import type { VetorControleMobile } from './mobileInput'

export type LimitesJoystick = Readonly<{
  centroX: number
  centroY: number
  raio: number
}>

export function calcularJoystick(
  clientX: number,
  clientY: number,
  limites: LimitesJoystick,
): VetorControleMobile {
  if (limites.raio <= 0) return { x: 0, y: 0 }

  const deltaX = clientX - limites.centroX
  const deltaY = clientY - limites.centroY
  const distancia = Math.hypot(deltaX, deltaY)
  const escala = distancia > limites.raio ? limites.raio / distancia : 1
  const x = (deltaX * escala) / limites.raio
  const y = (-deltaY * escala) / limites.raio

  return {
    x: Object.is(x, -0) ? 0 : x,
    y: Object.is(y, -0) ? 0 : y,
  }
}
