import { describe, expect, it } from 'vitest'
import { mapaCriacao } from '../../../../mapas/criacao'
import {
  elementoCriacaoVisivel,
  obterArtesCriacaoVisiveis,
  obterMomentoMinimoElementoCriacao,
  obterPropsCriacaoVisiveis,
} from './visibilidade'

describe('revelação dos elementos do mundo da Criação', () => {
  it('classifica explicitamente cada prop e arte do mapa', () => {
    const elementos = [...mapaCriacao.props, ...(mapaCriacao.artes2D ?? [])]

    expect(elementos.length).toBeGreaterThan(0)
    for (const elemento of elementos) {
      expect(obterMomentoMinimoElementoCriacao(elemento.id)).not.toBeNull()
    }
  })

  it('não mostra vegetação, Éden ou escolha antes da hora', () => {
    expect(elementoCriacaoVisivel('prop-pedra-luz', 'vazio')).toBe(false)
    expect(elementoCriacaoVisivel('prop-pedra-luz', 'luz')).toBe(true)
    expect(elementoCriacaoVisivel('prop-campo-sul', 'ceu-terra-aguas')).toBe(false)
    expect(elementoCriacaoVisivel('prop-campo-sul', 'natureza')).toBe(true)
  })

  it('retorna listas acumulativas sem mutar os dados do mapa', () => {
    const propsOriginais = [...mapaCriacao.props]
    const artesOriginais = [...(mapaCriacao.artes2D ?? [])]

    expect(obterPropsCriacaoVisiveis(mapaCriacao.props, 'vazio')).toEqual([])
    expect(obterArtesCriacaoVisiveis(artesOriginais, 'vazio')).toEqual([])
    expect(obterArtesCriacaoVisiveis(artesOriginais, 'luz')).toHaveLength(5)
    expect(obterPropsCriacaoVisiveis(mapaCriacao.props, 'fruto-escolha')).toHaveLength(
      mapaCriacao.props.length,
    )
    expect(mapaCriacao.props).toEqual(propsOriginais)
    expect(mapaCriacao.artes2D).toEqual(artesOriginais)
  })

  it('mantém elemento desconhecido oculto por padrão', () => {
    expect(elementoCriacaoVisivel('prop-nao-catalogado', 'fruto-escolha')).toBe(false)
  })
})
