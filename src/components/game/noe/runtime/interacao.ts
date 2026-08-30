import type { ColetavelMapa } from '../../../../mapas/types'
import type { RequisitoPendenteNoe } from '../progression/estado'
import type { AcaoNoeId } from '../progression/types'

export type AcionarInteracaoNoe = () => void

interface CandidatoInteracaoNoeBase {
  /** Stable scene ID used as the final deterministic tie-breaker. */
  id: string
  distancia: number
  acionar: AcionarInteracaoNoe
}

export interface CandidatoTarefaNoe extends CandidatoInteracaoNoeBase {
  tipo: 'tarefa'
  acaoId: AcaoNoeId
  unidadeId: string
}

export interface CandidatoSelahNoe extends CandidatoInteracaoNoeBase {
  tipo: 'selah'
  passagemId: string
}

export interface CandidatoPortalNoe extends CandidatoInteracaoNoeBase {
  tipo: 'portal'
}

export type CandidatoInteracaoNoe =
  | CandidatoTarefaNoe
  | CandidatoSelahNoe
  | CandidatoPortalNoe

const PRIORIDADE_INTERACAO: Readonly<Record<CandidatoInteracaoNoe['tipo'], number>> = {
  tarefa: 0,
  selah: 1,
  portal: 2,
}

function distanciaComparavel(distancia: number): number {
  return Number.isFinite(distancia) ? distancia : Number.POSITIVE_INFINITY
}

function compararIds(idA: string, idB: string): number {
  if (idA === idB) return 0
  return idA < idB ? -1 : 1
}

/**
 * Selects one interaction without mutating the detector-owned candidate list.
 * A local task always wins over Selah, which always wins over a portal; only
 * candidates of the same kind are compared by distance and stable ID.
 */
export function selecionarCandidatoInteracaoNoe(
  candidatos: readonly CandidatoInteracaoNoe[],
): CandidatoInteracaoNoe | null {
  let selecionado: CandidatoInteracaoNoe | null = null

  for (const candidato of candidatos) {
    if (!selecionado) {
      selecionado = candidato
      continue
    }

    const prioridade =
      PRIORIDADE_INTERACAO[candidato.tipo] -
      PRIORIDADE_INTERACAO[selecionado.tipo]
    if (prioridade < 0) {
      selecionado = candidato
      continue
    }
    if (prioridade > 0) continue

    const distancia =
      distanciaComparavel(candidato.distancia) -
      distanciaComparavel(selecionado.distancia)
    if (distancia < 0) {
      selecionado = candidato
      continue
    }
    if (distancia > 0) continue

    if (compararIds(candidato.id, selecionado.id) < 0) {
      selecionado = candidato
    }
  }

  return selecionado
}

export type RequisitoSelahFinalNoe = Extract<
  RequisitoPendenteNoe,
  { tipo: 'selah-final' }
>

/**
 * Exposes the final Selah only when it is the sole pending requirement.
 * This fail-closed rule prevents a malformed mixed list from revealing it
 * before every local task has actually finished.
 */
export function obterRequisitoSelahFinalNoe(
  requisitosPendentes: readonly RequisitoPendenteNoe[],
): RequisitoSelahFinalNoe | null {
  if (requisitosPendentes.length !== 1) return null

  const requisito = requisitosPendentes[0]
  return requisito.tipo === 'selah-final' ? requisito : null
}

/** Hides every future or already completed crystal from Noah's scene. */
export function selecionarColetaveisSelahFinalNoe(
  coletaveis: readonly ColetavelMapa[],
  requisitosPendentes: readonly RequisitoPendenteNoe[],
  selahsConcluidos: readonly string[],
): readonly ColetavelMapa[] {
  const requisito = obterRequisitoSelahFinalNoe(requisitosPendentes)
  if (!requisito || selahsConcluidos.includes(requisito.passagemId)) return []

  return coletaveis.filter(
    ({ passagemId }) => passagemId === requisito.passagemId,
  )
}

export interface OpcoesCandidatoSelahFinalNoe {
  id?: string
  distancia: number
  acionar: (passagemId: string) => void
}

/** Builds a Selah candidate without reading progression or global stores. */
export function criarCandidatoSelahFinalNoe(
  requisitosPendentes: readonly RequisitoPendenteNoe[],
  opcoes: OpcoesCandidatoSelahFinalNoe,
): CandidatoSelahNoe | null {
  const requisito = obterRequisitoSelahFinalNoe(requisitosPendentes)
  if (!requisito) return null

  return {
    tipo: 'selah',
    id: opcoes.id ?? `selah:${requisito.passagemId}`,
    distancia: opcoes.distancia,
    passagemId: requisito.passagemId,
    acionar: () => opcoes.acionar(requisito.passagemId),
  }
}
