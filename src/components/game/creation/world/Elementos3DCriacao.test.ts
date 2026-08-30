import { describe, expect, it } from 'vitest'
import { manifestoAssetsCriacao } from '../../../../mapas/criacaoAssets'
import {
  instanciasAssetsCriacao,
  obterInstanciasAssetsCriacaoVisiveis,
} from './elementos'

describe('chunks 3D da Criação', () => {
  it('usa IDs únicos e somente assets disponíveis no manifesto', () => {
    const ids = instanciasAssetsCriacao.map(({ id }) => id)
    const assetsDisponiveis = new Set(
      manifestoAssetsCriacao.entradas.map(({ id }) => id),
    )

    expect(new Set(ids).size).toBe(ids.length)
    for (const instancia of instanciasAssetsCriacao) {
      expect(assetsDisponiveis.has(instancia.assetId)).toBe(true)
    }
  })

  it('não monta modelos no vazio e acumula somente os momentos alcançados', () => {
    expect(obterInstanciasAssetsCriacaoVisiveis('vazio')).toEqual([])
    expect(obterInstanciasAssetsCriacaoVisiveis('luz')).toEqual([])
    expect(
      obterInstanciasAssetsCriacaoVisiveis('ceu-terra-aguas').every(
        ({ assetId }) => assetId === 'montanhas' || assetId === 'rios',
      ),
    ).toBe(true)
    expect(
      obterInstanciasAssetsCriacaoVisiveis('natureza').length,
    ).toBeGreaterThan(
      obterInstanciasAssetsCriacaoVisiveis('ceu-terra-aguas').length,
    )
    expect(
      obterInstanciasAssetsCriacaoVisiveis('criaturas').filter(
        ({ assetId }) => assetId === 'ovelha',
      ),
    ).toHaveLength(3)
    expect(
      obterInstanciasAssetsCriacaoVisiveis('eden').some(
        ({ assetId }) => assetId === 'adao' || assetId === 'eva',
      ),
    ).toBe(false)
    expect(
      obterInstanciasAssetsCriacaoVisiveis('adao-e-eva').filter(
        ({ assetId }) => assetId === 'adao' || assetId === 'eva',
      ),
    ).toHaveLength(2)
    expect(
      obterInstanciasAssetsCriacaoVisiveis('fruto-escolha'),
    ).toHaveLength(instanciasAssetsCriacao.length)
  })

  it('usa colisores explícitos somente nos marcos navegáveis', () => {
    const colidiveis = instanciasAssetsCriacao.filter(({ colisor }) => colisor)

    expect(colidiveis.map(({ id }) => id)).toEqual([
      'eden-arvore-da-vida',
      'eden-arvore-da-escolha',
    ])
    for (const { colisor } of colidiveis) {
      expect(colisor?.meiaExtensao.every((valor) => valor > 0)).toBe(true)
    }
  })
})
