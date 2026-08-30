import { describe, expect, it } from 'vitest'
import type { ColetavelMapa } from '../../../mapas/types'
import {
  obterColetaveisAindaAcionados,
  selecionarColetavelAcionavel,
  type EstadoSelecaoColetavel,
} from './coletaveisInteracao'

const coletaveis: readonly ColetavelMapa[] = [
  {
    id: 'distante',
    historiaId: 'criacao',
    passagemId: 'genesis-1-3',
    posicao: [1.2, 0, 0],
    raioAtivacao: 2,
  },
  {
    id: 'proximo',
    historiaId: 'criacao',
    passagemId: 'genesis-1-11',
    posicao: [0.4, 0, 0],
    raioAtivacao: 2,
  },
]

const estadoLivre: EstadoSelecaoColetavel = {
  enabled: true,
  selahAtivo: false,
  pausaParentalAtiva: false,
  selahsConcluidos: [],
  coletaveisAcionados: new Set(),
}

describe('seleção de coletáveis por interação', () => {
  it('seleciona apenas o coletável acionável mais próximo em uma sobreposição', () => {
    expect(
      selecionarColetavelAcionavel(
        coletaveis,
        { x: 0, y: 0, z: 0 },
        estadoLivre,
      )?.id,
    ).toBe('proximo')
  })

  it('ignora coletáveis acionados ou com Selah concluído', () => {
    expect(
      selecionarColetavelAcionavel(
        coletaveis,
        { x: 0, y: 0, z: 0 },
        {
          ...estadoLivre,
          coletaveisAcionados: new Set(['proximo']),
        },
      )?.id,
    ).toBe('distante')

    expect(
      selecionarColetavelAcionavel(
        coletaveis,
        { x: 0, y: 0, z: 0 },
        {
          ...estadoLivre,
          selahsConcluidos: ['genesis-1-11', 'genesis-1-3'],
        },
      ),
    ).toBeNull()
  })

  it('bloqueia seleção durante Selah, pausa ou exploração desabilitada', () => {
    for (const bloqueio of [
      { enabled: false },
      { selahAtivo: true },
      { pausaParentalAtiva: true },
    ]) {
      expect(
        selecionarColetavelAcionavel(
          coletaveis,
          { x: 0, y: 0, z: 0 },
          { ...estadoLivre, ...bloqueio },
        ),
      ).toBeNull()
    }
  })

  it('rearma tentativa sem resposta somente depois de sair do raio', () => {
    const acionados = new Set(['proximo'])

    const dentro = obterColetaveisAindaAcionados(
      coletaveis,
      { x: 0, y: 0, z: 0 },
      acionados,
      [],
    )
    expect(dentro.has('proximo')).toBe(true)

    const fora = obterColetaveisAindaAcionados(
      coletaveis,
      { x: 5, y: 0, z: 0 },
      dentro,
      [],
    )
    expect(fora.has('proximo')).toBe(false)

    expect(
      selecionarColetavelAcionavel(
        coletaveis,
        { x: 0, y: 0, z: 0 },
        { ...estadoLivre, coletaveisAcionados: fora },
      )?.id,
    ).toBe('proximo')
  })

  it('nunca rearma uma passagem cujo Selah foi concluído', () => {
    const aindaAcionados = obterColetaveisAindaAcionados(
      coletaveis,
      { x: 5, y: 0, z: 0 },
      new Set(['proximo']),
      ['genesis-1-11'],
    )

    expect(aindaAcionados.has('proximo')).toBe(true)
    expect(
      selecionarColetavelAcionavel(
        coletaveis,
        { x: 0, y: 0, z: 0 },
        {
          ...estadoLivre,
          selahsConcluidos: ['genesis-1-11'],
          coletaveisAcionados: aindaAcionados,
        },
      )?.id,
    ).toBe('distante')
  })
})
