import { describe, expect, it } from 'vitest'
import { modelosNatureza } from './assets'

const referencias = Object.values(modelosNatureza)
const arquivosEsperados = new Set([
  '/models/quaternius/ultimate-stylized-nature/flower-bushes.glb',
  '/models/quaternius/ultimate-stylized-nature/grass.glb',
  '/models/quaternius/ultimate-stylized-nature/rocks.glb',
  '/models/quaternius/ultimate-stylized-nature/trees.glb',
])

describe('catálogo de modelos de natureza', () => {
  it('aponta somente para os GLBs CC0 importados', () => {
    for (const { modelo } of referencias) {
      expect(modelo).toMatch(
        /^\/models\/quaternius\/ultimate-stylized-nature\/[a-z-]+\.glb$/,
      )
      expect(arquivosEsperados.has(modelo)).toBe(true)
    }
    expect(new Set(referencias.map(({ modelo }) => modelo))).toEqual(arquivosEsperados)
  })

  it('sempre seleciona uma peça nomeada em vez do pack inteiro', () => {
    for (const { modeloNo } of referencias) {
      expect(modeloNo.trim().length).toBeGreaterThan(0)
    }
  })
})
