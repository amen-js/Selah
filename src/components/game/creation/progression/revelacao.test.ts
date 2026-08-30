import { describe, expect, it } from 'vitest'
import { momentosCriacao } from './catalogo'
import { obterRevelacaoCriacao } from './revelacao'

describe('contrato de revelação de assets da Criação', () => {
  it('expõe somente os assets acumulados até o momento atual', () => {
    const vazio = obterRevelacaoCriacao('vazio')
    const luz = obterRevelacaoCriacao('luz')

    expect(vazio.assetsVisiveis).toEqual(momentosCriacao[0].assets)
    expect(luz.assetsDoMomento).toEqual(momentosCriacao[1].assets)
    expect(luz.assetsVisiveis).toContain('ambiente-vazio')
    expect(luz.assetsVisiveis).toContain('nucleo-luz')
    expect(luz.assetsVisiveis).not.toContain('terreno-criacao')
  })

  it('preserva a ordem de descoberta e elimina IDs repetidos', () => {
    const final = obterRevelacaoCriacao('fruto-escolha')
    const todos = momentosCriacao.flatMap(({ assets }) => assets)

    expect(final.assetsVisiveis).toEqual([...new Set(todos)])
    expect(final.assetsVisiveis.filter((id) => id === 'luz-guia')).toHaveLength(1)
  })
})
