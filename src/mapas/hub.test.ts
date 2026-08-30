import { describe, expect, it } from 'vitest'

import { mapaHub } from './hub'

describe('mapa do hub', () => {
  it('não possui colecionáveis próprios', () => {
    expect(mapaHub.coletaveis).toEqual([])
  })

  it('seleciona peças nomeadas nos props que usam packs GLB', () => {
    const propsModelados = mapaHub.props.filter(({ modelo }) => modelo)

    expect(propsModelados.length).toBeGreaterThan(0)
    expect(propsModelados.every(({ modeloNo }) => Boolean(modeloNo))).toBe(true)
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
