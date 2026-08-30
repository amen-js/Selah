import { describe, expect, it } from 'vitest'
import { mapaCriacao } from './criacao'
import { mapaHub } from './hub'
import { mapaNoe } from './noe'
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
      mapa: mapaHub,
    })
  })

  it('expõe a Criação como a única região jogável disponível', () => {
    const criacao = obterDefinicaoRegiao('criacao')

    expect(criacao.tipo).toBe('mundo')
    expect(criacao.disponivel).toBe(true)
    expect(criacao.mapa).toBe(mapaCriacao)
    expect(obterMapaRegiao('criacao')).toBe(mapaCriacao)
  })

  it('expõe Noé como mundo disponível e José como expansão futura', () => {
    expect(obterDefinicaoRegiao('noe')).toMatchObject({
      id: 'noe',
      tipo: 'mundo',
      disponivel: true,
      mapa: mapaNoe,
    })
    expect(obterMapaRegiao('noe')).toBe(mapaNoe)

    expect(obterDefinicaoRegiao('jose')).toMatchObject({
      id: 'jose',
      tipo: 'mundo',
      disponivel: false,
      mapa: null,
    })
    expect(obterMapaRegiao('jose')).toBeNull()
  })
})
