import { describe, expect, it, vi } from 'vitest'
import type { RequisitoPendenteNoe } from '../progression/estado'
import {
  criarCandidatoSelahFinalNoe,
  obterRequisitoSelahFinalNoe,
  selecionarCandidatoInteracaoNoe,
  type CandidatoInteracaoNoe,
  type CandidatoPortalNoe,
  type CandidatoSelahNoe,
  type CandidatoTarefaNoe,
} from './interacao'

function tarefa(
  id: string,
  distancia: number,
  acionar = vi.fn(),
): CandidatoTarefaNoe {
  return {
    tipo: 'tarefa',
    id,
    distancia,
    acaoId: 'noe.madeira.coletada',
    unidadeId: id,
    acionar,
  }
}

function selah(
  id: string,
  distancia: number,
  acionar = vi.fn(),
): CandidatoSelahNoe {
  return {
    tipo: 'selah',
    id,
    distancia,
    passagemId: 'genesis-6-14',
    acionar,
  }
}

function portal(
  id: string,
  distancia: number,
  acionar = vi.fn(),
): CandidatoPortalNoe {
  return { tipo: 'portal', id, distancia, acionar }
}

describe('selecionarCandidatoInteracaoNoe', () => {
  it('aplica a prioridade tarefa > Selah > portal antes da distância', () => {
    const candidatos: readonly CandidatoInteracaoNoe[] = [
      portal('portal-perto', 0.1),
      selah('selah-perto', 0.2),
      tarefa('tarefa-distante', 8),
    ]

    expect(selecionarCandidatoInteracaoNoe(candidatos)?.id).toBe(
      'tarefa-distante',
    )
    expect(selecionarCandidatoInteracaoNoe(candidatos.slice(0, 2))?.id).toBe(
      'selah-perto',
    )
  })

  it('prefere a menor distância entre candidatos da mesma prioridade', () => {
    expect(
      selecionarCandidatoInteracaoNoe([
        tarefa('tabua-distante', 2),
        tarefa('tabua-perto', 0.5),
      ])?.id,
    ).toBe('tabua-perto')
  })

  it('desempata distância pelo ID sem depender da ordem de entrada', () => {
    const candidatoA = tarefa('tabua-a', 1)
    const candidatoB = tarefa('tabua-b', 1)

    expect(
      selecionarCandidatoInteracaoNoe([candidatoB, candidatoA])?.id,
    ).toBe('tabua-a')
    expect(
      selecionarCandidatoInteracaoNoe([candidatoA, candidatoB])?.id,
    ).toBe('tabua-a')
  })

  it('retorna null sem candidatos', () => {
    expect(selecionarCandidatoInteracaoNoe([])).toBeNull()
  })
})

describe('candidato de Selah final', () => {
  const tarefaPendente: RequisitoPendenteNoe = {
    tipo: 'tarefa-local',
    acaoId: 'noe.madeira.coletada',
    quantidadeConcluida: 3,
    quantidadeNecessaria: 4,
  }
  const selahFinal: RequisitoPendenteNoe = {
    tipo: 'selah-final',
    passagemId: 'genesis-6-14',
  }

  it.each([
    [[] as readonly RequisitoPendenteNoe[]],
    [[tarefaPendente]],
    [[tarefaPendente, selahFinal]],
  ])('não expõe Selah para requisitos %o', (requisitos) => {
    expect(obterRequisitoSelahFinalNoe(requisitos)).toBeNull()
    expect(
      criarCandidatoSelahFinalNoe(requisitos, {
        distancia: 1,
        acionar: vi.fn(),
      }),
    ).toBeNull()
  })

  it('cria candidato somente para selah-final e encaminha a passagem', () => {
    const acionar = vi.fn()
    const candidato = criarCandidatoSelahFinalNoe([selahFinal], {
      id: 'cristal-vedacao',
      distancia: 1.25,
      acionar,
    })

    expect(candidato).toMatchObject({
      tipo: 'selah',
      id: 'cristal-vedacao',
      distancia: 1.25,
      passagemId: 'genesis-6-14',
    })

    candidato?.acionar()
    expect(acionar).toHaveBeenCalledOnce()
    expect(acionar).toHaveBeenCalledWith('genesis-6-14')
  })
})
