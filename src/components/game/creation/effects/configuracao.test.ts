import { describe, expect, it } from 'vitest'
import { momentosCriacao, type MomentoCriacaoId } from '../progression'
import {
  ehEfeitoProcedural,
  IDS_EFEITOS_PROCEDURAIS,
  obterConfiguracaoEfeitosCriacao,
} from './configuracao'
import type { ProceduralVfxAssetId } from './types'

describe('configuracao de efeitos procedurais da criacao', () => {
  it('reconhece exatamente os 9 IDs procedurais aprovados', () => {
    const idsEsperados: ProceduralVfxAssetId[] = [
      'ambiente-vazio',
      'luz-guia',
      'nucleo-luz',
      'marcadores-caminho-luz',
      'efeito-crescimento',
      'sol',
      'lua',
      'estrelas',
      'nuvens',
    ]

    expect(IDS_EFEITOS_PROCEDURAIS).toEqual(idsEsperados)
    expect(IDS_EFEITOS_PROCEDURAIS.length).toBe(9)

    for (const id of idsEsperados) {
      expect(ehEfeitoProcedural(id)).toBe(true)
    }
  })

  it('rejeita IDs de modelos 3D, personagens, animais, terreno ou audio', () => {
    const idsNaoProcedurais = [
      'som-vazio',
      'som-revelacao-luz',
      'som-agua',
      'som-transicao-celeste',
      'sons-animais',
      'som-eden',
      'som-encerramento-criacao',
      'terreno-criacao',
      'rios',
      'lago',
      'montanhas',
      'arvores',
      'arbustos',
      'flores',
      'grama',
      'leao',
      'girafa',
      'ovelha',
      'jardim-eden',
      'arvore-central',
      'rios-eden',
      'adao',
      'eva',
      'animacao-idle-humanos',
      'arvore-conhecimento',
      'fruto-nao-interativo',
      'id-inventado-inexistente',
    ]

    for (const id of idsNaoProcedurais) {
      expect(ehEfeitoProcedural(id)).toBe(false)
    }
  })

  it('configura corretamente os 9 momentos da criacao em ordem', () => {
    for (const momento of momentosCriacao) {
      const config = obterConfiguracaoEfeitosCriacao(momento.id)
      expect(config.momentoId).toBe(momento.id)
      expect(config.faseCenario).toBe(momento.faseCenario)
      expect(config.reducedMotion).toBe(false)

      // Only valid procedural IDs are included in active effects
      for (const ativo of config.efeitosAtivos) {
        expect(IDS_EFEITOS_PROCEDURAIS).toContain(ativo)
      }

      // todasEntradas maps all 9 procedural effects
      expect(config.todasEntradas.length).toBe(9)
      for (const entrada of config.todasEntradas) {
        expect(entrada.ativo).toBe(config.temEfeito(entrada.id))
      }
    }
  })

  it('monta cues temporarios por beat e persiste somente o ceu a partir de ceu-ritmo', () => {
    const expectativas: readonly [
      MomentoCriacaoId,
      readonly ProceduralVfxAssetId[],
    ][] = [
      ['vazio', ['ambiente-vazio', 'luz-guia']],
      ['luz', ['luz-guia', 'nucleo-luz', 'marcadores-caminho-luz']],
      ['ceu-terra-aguas', []],
      ['natureza', ['efeito-crescimento']],
      ['ceu-ritmo', ['sol', 'lua', 'estrelas', 'nuvens']],
      ['criaturas', ['sol', 'lua', 'estrelas', 'nuvens']],
      ['eden', ['sol', 'lua', 'estrelas', 'nuvens']],
      ['adao-e-eva', ['sol', 'lua', 'estrelas', 'nuvens']],
      ['fruto-escolha', ['sol', 'lua', 'estrelas', 'nuvens']],
    ]

    for (const [momentoId, esperados] of expectativas) {
      const config = obterConfiguracaoEfeitosCriacao(momentoId)
      expect(config.efeitosAtivos).toEqual(esperados)

      for (const id of IDS_EFEITOS_PROCEDURAIS) {
        expect(config.temEfeito(id)).toBe(esperados.includes(id))
      }
    }
  })

  it('propaga a opcao de reducedMotion de forma pura', () => {
    const configPadrao = obterConfiguracaoEfeitosCriacao('ceu-ritmo')
    expect(configPadrao.reducedMotion).toBe(false)

    const configReduzida = obterConfiguracaoEfeitosCriacao('ceu-ritmo', {
      reducedMotion: true,
    })
    expect(configReduzida.reducedMotion).toBe(true)
    for (const entrada of configReduzida.todasEntradas) {
      expect(entrada.reducedMotion).toBe(true)
    }
  })

  it('garante que nenhum ID inventado ou externo e exposto', () => {
    const todosMomentosIds: MomentoCriacaoId[] = [
      'vazio',
      'luz',
      'ceu-terra-aguas',
      'natureza',
      'ceu-ritmo',
      'criaturas',
      'eden',
      'adao-e-eva',
      'fruto-escolha',
    ]

    for (const mId of todosMomentosIds) {
      const config = obterConfiguracaoEfeitosCriacao(mId)
      for (const id of config.efeitosAtivos) {
        expect(IDS_EFEITOS_PROCEDURAIS).toContain(id)
      }
    }
  })
})
