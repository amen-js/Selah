import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { modelosNatureza } from './assets'

const referencias = Object.values(modelosNatureza)

describe('catálogo de modelos de natureza', () => {
  it('aponta somente para os GLBs CC0 importados e existentes', () => {
    for (const { modelo } of referencias) {
      expect(modelo).toMatch(
        /^\/models\/quaternius\/ultimate-stylized-nature\/[a-z-]+\.glb$/,
      )
      expect(existsSync(join(process.cwd(), 'public', modelo.slice(1)))).toBe(true)
    }
  })

  it('sempre seleciona uma peça nomeada em vez do pack inteiro', () => {
    for (const { modeloNo } of referencias) {
      expect(modeloNo.trim().length).toBeGreaterThan(0)
    }
  })
})

