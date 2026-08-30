import { describe, expect, it } from 'vitest'
import { mapaCriacao } from '../../../../mapas/criacao'
import {
  coletavelCriacaoDisponivelNoMomento,
  obterObjetivoZonaCriacao,
} from './interacao'

describe('interações liberadas pela progressão da Criação', () => {
  it('mantém os Selahs futuros escondidos até o momento correspondente', () => {
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-1', 'vazio')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-3', 'vazio')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-3', 'luz')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-11', 'ceu-terra-aguas')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-11', 'natureza')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-24', 'ceu-ritmo')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-24', 'criaturas')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-27', 'eden')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-27', 'adao-e-eva')).toBe(true)
  })

  it('não interfere em passagens que não pertencem à jornada da Criação', () => {
    expect(coletavelCriacaoDisponivelNoMomento('exodus-3-14', 'vazio')).toBe(true)
  })

  it('expõe objetivo somente para os quatro momentos de descoberta espacial', () => {
    expect(obterObjetivoZonaCriacao('vazio')).toBeNull()
    expect(obterObjetivoZonaCriacao('natureza')).toBeNull()
    expect(obterObjetivoZonaCriacao('ceu-terra-aguas')).toMatchObject({
      id: 'mirante-dos-rios',
      posicao: [-14, 2.5, 5],
    })
    expect(obterObjetivoZonaCriacao('ceu-ritmo')?.id).toBe('observatorio-do-ceu')
    expect(obterObjetivoZonaCriacao('eden')?.id).toBe('coracao-do-eden')
    expect(obterObjetivoZonaCriacao('fruto-escolha')?.id).toBe(
      'arvore-do-conhecimento',
    )
  })

  it('mantém o Selah da humanidade fora do gatilho anterior do Éden', () => {
    const objetivoEden = obterObjetivoZonaCriacao('eden')
    const humanidade = mapaCriacao.coletaveis.find(
      ({ passagemId }) => passagemId === 'genesis-1-27',
    )

    expect(objetivoEden).not.toBeNull()
    expect(humanidade).toBeDefined()

    const distancia = Math.hypot(
      humanidade!.posicao[0] - objetivoEden!.posicao[0],
      humanidade!.posicao[1] - objetivoEden!.posicao[1],
      humanidade!.posicao[2] - objetivoEden!.posicao[2],
    )
    expect(distancia).toBeGreaterThan(objetivoEden!.raio)
  })
})
