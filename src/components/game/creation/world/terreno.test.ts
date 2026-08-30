import { describe, expect, it } from 'vitest'
import {
  COLUNAS_TERRENO_CRIACAO,
  criarMalhaTerrenoCriacao,
  LINHAS_TERRENO_CRIACAO,
  obterAlturaTerrenoCriacao,
} from './terreno'

describe('terreno navegável da Criação', () => {
  it('gera uma malha indexada determinística para visual e colisão', () => {
    const primeira = criarMalhaTerrenoCriacao()
    const segunda = criarMalhaTerrenoCriacao()

    expect([...primeira.vertices]).toEqual([...segunda.vertices])
    expect([...primeira.indices]).toEqual([...segunda.indices])
    expect(primeira.vertices).toHaveLength(
      (COLUNAS_TERRENO_CRIACAO + 1) *
        (LINHAS_TERRENO_CRIACAO + 1) *
        3,
    )
    expect(primeira.indices).toHaveLength(
      COLUNAS_TERRENO_CRIACAO * LINHAS_TERRENO_CRIACAO * 6,
    )
  })

  it('mantém o spawn suave e destaca os mirantes sem paredes abruptas', () => {
    expect(Math.abs(obterAlturaTerrenoCriacao(0, 19))).toBeLessThan(0.2)
    expect(obterAlturaTerrenoCriacao(-14, 5)).toBeGreaterThan(1.2)
    expect(obterAlturaTerrenoCriacao(0, -17)).toBeGreaterThan(0.8)
    expect(obterAlturaTerrenoCriacao(13, 5)).toBeLessThan(0.2)
  })
})
