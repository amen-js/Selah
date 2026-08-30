import { momentosNoe } from './catalogo'
import {
  chaveMarcoNoe,
  criarEstadoProgressaoNoe,
  obterMomentoAtualNoe,
} from './estado'
import type {
  EstadoProgressaoNoe,
  MarcoConclusaoNoe,
  MomentoNoeId,
} from './types'

export const VERSAO_CHECKPOINT_NOE = 1

export interface CheckpointProgressaoNoe {
  versao: typeof VERSAO_CHECKPOINT_NOE
  momentosConcluidos: readonly string[]
  marcosMomentoAtualConcluidos: readonly string[]
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function lerStrings(valor: unknown): readonly string[] {
  return Array.isArray(valor)
    ? valor.filter((item): item is string => typeof item === 'string')
    : []
}

function obterPrefixoCanonico(ids: readonly string[]): MomentoNoeId[] {
  const prefixo: MomentoNoeId[] = []
  for (const momento of momentosNoe) {
    if (ids[prefixo.length] !== momento.id) break
    prefixo.push(momento.id)
  }
  return prefixo
}

function desserializarMarco(
  chave: string,
  permitidos: readonly MarcoConclusaoNoe[],
): MarcoConclusaoNoe | null {
  return permitidos.find((marco) => chaveMarcoNoe(marco) === chave) ?? null
}

/** Serializes only the canonical prefix and partial markers of the active beat. */
export function criarCheckpointProgressaoNoe(
  estado: EstadoProgressaoNoe,
): CheckpointProgressaoNoe {
  return {
    versao: VERSAO_CHECKPOINT_NOE,
    momentosConcluidos: [...estado.momentosConcluidos],
    marcosMomentoAtualConcluidos: estado.concluida
      ? []
      : estado.marcosMomentoAtualConcluidos.map(chaveMarcoNoe),
  }
}

/**
 * Parses untrusted persisted data. It keeps the longest contiguous known
 * prefix and only marker keys declared by that resulting current moment.
 */
export function reconstruirProgressaoNoe(
  checkpoint: unknown,
): EstadoProgressaoNoe {
  if (!ehRegistro(checkpoint) || checkpoint.versao !== VERSAO_CHECKPOINT_NOE) {
    return criarEstadoProgressaoNoe()
  }

  const prefixo = obterPrefixoCanonico(lerStrings(checkpoint.momentosConcluidos))
  const concluida = prefixo.length === momentosNoe.length
  const momentoAtual = concluida
    ? momentosNoe[momentosNoe.length - 1]
    : momentosNoe[prefixo.length]
  const candidatos = concluida
    ? []
    : lerStrings(checkpoint.marcosMomentoAtualConcluidos)
  const vistos = new Set<string>()
  const marcos = candidatos.flatMap((chave) => {
    if (vistos.has(chave)) return []
    vistos.add(chave)
    const marco = desserializarMarco(chave, momentoAtual.gatilhoConclusao.marcos)
    return marco ? [marco] : []
  })

  return {
    momentoAtualId: momentoAtual.id,
    momentosConcluidos: prefixo,
    marcosMomentoAtualConcluidos: marcos,
    concluida,
  }
}

/** Convenience guard for consumers that only need the active checkpoint. */
export function obterMarcosAtuaisNoe(
  estado: EstadoProgressaoNoe,
): readonly MarcoConclusaoNoe[] {
  return estado.concluida ? [] : obterMomentoAtualNoe(estado).gatilhoConclusao.marcos
}
