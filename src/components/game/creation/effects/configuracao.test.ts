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

  it('respeita a cumulatividade dos efeitos procedurais conforme o avanco', () => {
    // Momento 1 (vazio): ambiente-vazio e luz-guia
    const configVazio = obterConfiguracaoEfeitosCriacao('vazio')
    expect(configVazio.efeitosAtivos).toEqual(['ambiente-vazio', 'luz-guia'])
    expect(configVazio.temEfeito('ambiente-vazio')).toBe(true)
    expect(configVazio.temEfeito('luz-guia')).toBe(true)
    expect(configVazio.temEfeito('nucleo-luz')).toBe(false)

    // Momento 2 (luz): acumula nucleo-luz e marcadores-caminho-luz
    const configLuz = obterConfiguracaoEfeitosCriacao('luz')
    expect(configLuz.temEfeito('ambiente-vazio')).toBe(true)
    expect(configLuz.temEfeito('luz-guia')).toBe(true)
    expect(configLuz.temEfeito('nucleo-luz')).toBe(true)
    expect(configLuz.temEfeito('marcadores-caminho-luz')).toBe(true)

    // Momento 4 (natureza): acumula efeito-crescimento
    const configNatureza = obterConfiguracaoEfeitosCriacao('natureza')
    expect(configNatureza.temEfeito('efeito-crescimento')).toBe(true)

    // Momento 5 (ceu-ritmo): acumula sol, lua, estrelas e nuvens
    const configCeu = obterConfiguracaoEfeitosCriacao('ceu-ritmo')
    expect(configCeu.temEfeito('sol')).toBe(true)
    expect(configCeu.temEfeito('lua')).toBe(true)
    expect(configCeu.temEfeito('estrelas')).toBe(true)
    expect(configCeu.temEfeito('nuvens')).toBe(true)

    // Momento 9 (fruto-escolha): todos os 9 efeitos procedurais visiveis acumulados
    const configEscolha = obterConfiguracaoEfeitosCriacao('fruto-escolha')
    expect(configEscolha.efeitosAtivos.length).toBe(9)
    for (const id of IDS_EFEITOS_PROCEDURAIS) {
      expect(configEscolha.temEfeito(id)).toBe(true)
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
