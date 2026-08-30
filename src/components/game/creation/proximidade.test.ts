import { describe, expect, it } from 'vitest'

import { estaNoRaio } from './proximidade'

describe('estaNoRaio', () => {
  const centro = [0, 0, 0] as const

  it('inclui uma posição exatamente no limite do raio', () => {
    expect(estaNoRaio({ x: 3, y: 0, z: 0 }, centro, 3)).toBe(true)
  })

  it('retorna false para uma posição fora do raio', () => {
    expect(estaNoRaio({ x: 3.01, y: 0, z: 0 }, centro, 3)).toBe(false)
  })

  it('considera os três eixos no cálculo da distância', () => {
    expect(estaNoRaio({ x: 1, y: 2, z: 2 }, centro, 3)).toBe(true)
    expect(estaNoRaio({ x: 1, y: 2, z: 2.01 }, centro, 3)).toBe(false)
  })
})
