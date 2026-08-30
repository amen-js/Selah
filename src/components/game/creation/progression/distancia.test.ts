import { describe, expect, it } from 'vitest'
import { acumularDistanciaNarrativa, distanciaHorizontal } from './distancia'

describe('distância narrativa da Criação', () => {
  it('contabiliza apenas deslocamento no plano do chão', () => {
    expect(
      distanciaHorizontal(
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 20, z: 4 },
      ),
    ).toBe(5)
  })

  it('ignora o primeiro frame e saltos que representam teleporte', () => {
    const atual = { x: 1, y: 0, z: 0 }
    expect(acumularDistanciaNarrativa(2, null, atual)).toBe(2)
    expect(
      acumularDistanciaNarrativa(2, atual, { x: 10, y: 0, z: 0 }),
    ).toBe(2)
  })

  it('acumula passos consecutivos válidos', () => {
    expect(
      acumularDistanciaNarrativa(
        2,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 5, z: 0 },
      ),
    ).toBe(3)
  })
})
