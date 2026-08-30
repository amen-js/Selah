import { describe, expect, it } from 'vitest'
import { mapaCriacao } from './criacao'
import {
  catalogoRegioes,
  obterDefinicaoRegiao,
  obterMapaRegiao,
} from './regioes'

describe('catálogo de regiões', () => {
  it('cobre todas as regiões do contrato do jogo', () => {
    expect(Object.keys(catalogoRegioes).sort()).toEqual([
      'criacao',
      'hub',
      'jose',
      'noe',
    ])
  })

  it('define o hub como runtime próprio, sem mapa de exploração', () => {
    expect(obterDefinicaoRegiao('hub')).toEqual({
      id: 'hub',
      tipo: 'hub',
      disponivel: true,
      mapa: null,
    })
  })

  it('expõe a Criação como a única região jogável disponível', () => {
    const criacao = obterDefinicaoRegiao('criacao')

    expect(criacao.tipo).toBe('mundo')
    expect(criacao.disponivel).toBe(true)
    expect(criacao.mapa).toBe(mapaCriacao)
    expect(obterMapaRegiao('criacao')).toBe(mapaCriacao)
  })

  it('mantém Noé e José explicitamente indisponíveis até seus mapas existirem', () => {
    for (const regiao of ['noe', 'jose'] as const) {
      expect(obterDefinicaoRegiao(regiao)).toMatchObject({
        id: regiao,
        tipo: 'mundo',
        disponivel: false,
        mapa: null,
      })
      expect(obterMapaRegiao(regiao)).toBeNull()
    }
  })
})
