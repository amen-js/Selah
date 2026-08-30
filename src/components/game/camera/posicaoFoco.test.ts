import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import {
  calcularDirecaoLateral,
  calcularPosicaoFoco,
} from './posicaoFoco'

describe('câmera cinematográfica', () => {
  it('mantém o lado atual e respeita distância e elevação', () => {
    const lado = new Vector3(0, 0, 1)
    const resultado = calcularPosicaoFoco(
      lado,
      [2, 3, -4],
      6,
      1.5,
      new Vector3(),
    )

    expect(resultado.toArray()).toEqual([2, 4.5, 2])
  })

  it('normaliza a direção horizontal da câmera', () => {
    const lado = calcularDirecaoLateral(
      { x: 4, z: 2 },
      [1, 0, -2],
      0,
      new Vector3(),
    )

    expect(lado.x).toBeCloseTo(3 / 5)
    expect(lado.z).toBeCloseTo(4 / 5)
  })

  it('usa fallback determinístico quando a direção horizontal degenera', () => {
    const lado = calcularDirecaoLateral(
      { x: 1, z: -2 },
      [1, 8, -2],
      Math.PI / 2,
      new Vector3(),
    )

    expect(lado.x).toBeCloseTo(1)
    expect(lado.y).toBe(0)
    expect(lado.z).toBeCloseTo(0)
  })
})
