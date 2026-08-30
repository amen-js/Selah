import { describe, expect, it } from 'vitest'
import { manifestoAssetsCriacao } from '../../../../../mapas/criacaoAssets'
import { indiceMomentoCriacao } from '../../progression/estado'
import {
  composicoesBiomasCriacao,
  criarComposicaoBosqueDaVida,
  criarComposicaoCampoCriacao,
  criarComposicaoEden,
  criarComposicaoValeDasAguas,
  obterInstanciasBiomasCriacao,
} from '.'

describe('composições dos biomas da Criação', () => {
  it('mantém os quatro biomas na ordem da jornada e com landmarks legíveis', () => {
    expect(composicoesBiomasCriacao.map(({ id }) => id)).toEqual([
      'campo',
      'vale-das-aguas',
      'bosque-da-vida',
      'eden',
    ])
    expect(composicoesBiomasCriacao.map(({ marcos }) => marcos)).toHaveLength(4)
    for (const { marcos } of composicoesBiomasCriacao) {
      expect(marcos.length).toBeGreaterThanOrEqual(2)
      for (const marco of marcos) {
        expect(marco.raioLeitura).toBeGreaterThan(0)
      }
    }
  })

  it('é determinística e não compartilha arrays mutáveis entre criações', () => {
    const criadores = [
      criarComposicaoCampoCriacao,
      criarComposicaoValeDasAguas,
      criarComposicaoBosqueDaVida,
      criarComposicaoEden,
    ]

    for (const criar of criadores) {
      const primeira = criar()
      const segunda = criar()
      expect(primeira).toEqual(segunda)
      expect(primeira).not.toBe(segunda)
      expect(primeira.instancias).not.toBe(segunda.instancias)
    }
  })

  it('usa somente assets manifestados, IDs únicos e momentos válidos', () => {
    const instancias = obterInstanciasBiomasCriacao()
    const assetsManifestados = new Set(
      manifestoAssetsCriacao.entradas.map(({ id }) => id),
    )
    const ids = instancias.map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const instancia of instancias) {
      expect(assetsManifestados.has(instancia.assetId)).toBe(true)
      expect(indiceMomentoCriacao(instancia.momentoMinimo)).toBeGreaterThanOrEqual(0)
      expect(instancia.posicao).toHaveLength(3)
      expect(instancia.posicao.every(Number.isFinite)).toBe(true)
    }
  })

  it('separa a Árvore da Vida da árvore da escolha e preserva o campo aberto', () => {
    const campo = composicoesBiomasCriacao[0]
    const eden = composicoesBiomasCriacao[3]
    const vida = eden.instancias.find(({ id }) => id === 'eden-arvore-da-vida')
    const escolha = eden.instancias.find(({ id }) => id === 'eden-arvore-da-escolha')

    expect(campo.instancias.filter(({ assetId }) => assetId === 'ovelha')).toHaveLength(3)
    expect(vida?.momentoMinimo).toBe('eden')
    expect(escolha?.momentoMinimo).toBe('fruto-escolha')
    expect(vida?.posicao).not.toEqual(escolha?.posicao)
  })
})
