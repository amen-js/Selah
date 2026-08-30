import { describe, expect, it } from 'vitest'
import { mapaCriacao } from '../../../../mapas/criacao'
import {
  coletavelCriacaoDisponivelNoMomento,
  obterObjetivoZonaCriacao,
} from './interacao'

describe('interações liberadas pela progressão da Criação', () => {
  it('mantém os Selahs futuros escondidos até o momento correspondente', () => {
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-1', 'vazio')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-3', 'vazio')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-3', 'luz')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-11', 'ceu-terra-aguas')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-11', 'natureza')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-24', 'ceu-ritmo')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-24', 'criaturas')).toBe(true)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-27', 'eden')).toBe(false)
    expect(coletavelCriacaoDisponivelNoMomento('genesis-1-27', 'adao-e-eva')).toBe(true)
  })

  it('falha fechado para passagens sem beat configurado na Criação', () => {
    expect(coletavelCriacaoDisponivelNoMomento('exodus-3-14', 'vazio')).toBe(false)
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
    expect(obterObjetivoZonaCriacao('fruto-escolha', true)).toBeNull()
  })

  it.each([
    ['ceu-terra-aguas', 'genesis-1-11'],
    ['ceu-ritmo', 'genesis-1-24'],
    ['eden', 'genesis-1-27'],
  ] as const)(
    'separa o objetivo de %s do Selah liberado em seguida',
    (momentoId, passagemId) => {
      const objetivo = obterObjetivoZonaCriacao(momentoId)
      const coletavel = mapaCriacao.coletaveis.find(
        (item) => item.passagemId === passagemId,
      )

      expect(objetivo).not.toBeNull()
      expect(coletavel).toBeDefined()

      const distancia = Math.hypot(
        coletavel!.posicao[0] - objetivo!.posicao[0],
        coletavel!.posicao[1] - objetivo!.posicao[1],
        coletavel!.posicao[2] - objetivo!.posicao[2],
      )
      expect(distancia).toBeGreaterThan(
        objetivo!.raio + (coletavel!.raioAtivacao ?? 2.5),
      )
    },
  )
})
