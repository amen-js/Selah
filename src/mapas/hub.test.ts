import { describe, expect, it } from 'vitest'

import { mapaHub } from './hub'

describe('mapa do hub', () => {
  it('não possui colecionáveis próprios', () => {
    expect(mapaHub.coletaveis).toEqual([])
  })

  it('usa somente props geométricos fallback', () => {
    expect(mapaHub.props.every(({ modelo }) => modelo === undefined)).toBe(true)
  })

  it('mantém IDs e posições válidos dentro dos limites', () => {
    const entidades = [{ id: 'spawn', posicao: mapaHub.spawn }, ...mapaHub.props]
    const ids = entidades.map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const entidade of entidades) {
      expect(entidade.posicao[0]).toBeGreaterThanOrEqual(-mapaHub.limites.meiaLargura)
      expect(entidade.posicao[0]).toBeLessThanOrEqual(mapaHub.limites.meiaLargura)
      expect(entidade.posicao[2]).toBeGreaterThanOrEqual(-mapaHub.limites.meiaProfundidade)
      expect(entidade.posicao[2]).toBeLessThanOrEqual(mapaHub.limites.meiaProfundidade)
    }
  })
})
