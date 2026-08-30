import { momentosNoe } from './catalogo'
import { expandirUnidadeCompativelNoe } from './compatibilidade'
import {
  criarEstadoProgressaoNoe,
  processarEventoProgressaoNoe,
} from './estado'
import type {
  EstadoProgressaoNoe,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from './types'

export const VERSAO_CHECKPOINT_NOE = 1

export interface ProgressoAcaoCheckpointNoe {
  acaoId: string
  unidadesConcluidas: readonly string[]
}

export interface CheckpointProgressaoNoe {
  versao: typeof VERSAO_CHECKPOINT_NOE
  momentosConcluidos: readonly string[]
  progressoMomentoAtual: readonly ProgressoAcaoCheckpointNoe[]
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function lerStrings(valor: unknown): readonly string[] {
  return Array.isArray(valor)
    ? valor.filter((item): item is string => typeof item === 'string')
    : []
}

function obterPrefixoCanonico(valor: unknown): MomentoNoeId[] {
  if (!Array.isArray(valor)) return []

  const prefixo: MomentoNoeId[] = []
  for (const momento of momentosNoe) {
    if (valor[prefixo.length] !== momento.id) break
    prefixo.push(momento.id)
  }
  return prefixo
}

function normalizarProgresso(
  valor: unknown,
  momentoAtual: (typeof momentosNoe)[number],
): readonly ProgressoAcaoNoe[] {
  if (!Array.isArray(valor)) return []

  const unidadesInformadas = valor.flatMap((item) => {
    if (!ehRegistro(item) || typeof item.acaoId !== 'string') return []

    return lerStrings(item.unidadesConcluidas).flatMap((unidadeId) =>
      expandirUnidadeCompativelNoe(
        momentoAtual.id,
        item.acaoId as string,
        unidadeId,
      ),
    )
  })
  const temUnidadeInformada = (acaoId: string, unidadeId: string) =>
    unidadesInformadas.some(
      (unidade) => unidade.acaoId === acaoId && unidade.unidadeId === unidadeId,
    )

  // M8's return marker was the entire old beat. A v1 checkpoint without the
  // newly introduced send marker is grandfathered as send + return.
  if (
    momentoAtual.id === 'retorno-pomba' &&
    temUnidadeInformada('noe.pomba.retornou', 'retorno-com-oliveira') &&
    !temUnidadeInformada('noe.pomba.enviada', 'envio-janela-superior')
  ) {
    unidadesInformadas.push({
      acaoId: 'noe.pomba.enviada',
      unidadeId: 'envio-janela-superior',
    })
  }

  // A fully completed old M9 had no altar action. Grandfather only that exact
  // completed pair; a partial legacy desembark still has to build the altar.
  const tinhaDesembarqueLegado = valor.some(
    (item) =>
      ehRegistro(item) &&
      item.acaoId === 'noe.animais.desembarcados' &&
      lerStrings(item.unidadesConcluidas).includes('desembarque-seguro'),
  )
  if (
    momentoAtual.id === 'nova-terra-arco-iris' &&
    tinhaDesembarqueLegado &&
    temUnidadeInformada('noe.arco-iris.contemplado', 'contemplacao-da-alianca')
  ) {
    unidadesInformadas.push({
      acaoId: 'noe.altar.construido',
      unidadeId: 'altar-de-gratidao',
    })
  }

  return momentoAtual.gatilhoConclusao.tarefas.flatMap((tarefa) => {
    const unidadesDeclaradas = new Set<string>(tarefa.unidadesNecessarias)
    const unidades = unidadesInformadas.flatMap((item) =>
      item.acaoId === tarefa.acaoId ? [item.unidadeId] : [],
    )
    const unicasPermitidas = [...new Set(unidades)].filter((unidadeId) =>
      unidadesDeclaradas.has(unidadeId),
    )

    return unicasPermitidas.length > 0
      ? [{ acaoId: tarefa.acaoId, unidadesConcluidas: unicasPermitidas }]
      : []
  })
}

function serializarProgressoCanonico(
  estado: EstadoProgressaoNoe,
): readonly ProgressoAcaoCheckpointNoe[] {
  if (estado.concluida) return []

  const momentoAtual = momentosNoe.find(
    ({ id }) => id === estado.momentoAtualId,
  )
  if (!momentoAtual) return []

  return momentoAtual.gatilhoConclusao.tarefas.flatMap((tarefa) => {
    const registradas = new Set(
      estado.progressoMomentoAtual.flatMap((progresso) =>
        progresso.acaoId === tarefa.acaoId
          ? progresso.unidadesConcluidas
          : [],
      ),
    )
    const unidadesConcluidas = tarefa.unidadesNecessarias.filter((unidadeId) =>
      registradas.has(unidadeId),
    )

    return unidadesConcluidas.length > 0
      ? [{ acaoId: tarefa.acaoId, unidadesConcluidas }]
      : []
  })
}

/** Serializes only the canonical prefix and task units of the active beat. */
export function criarCheckpointProgressaoNoe(
  estado: EstadoProgressaoNoe,
): CheckpointProgressaoNoe {
  return {
    versao: VERSAO_CHECKPOINT_NOE,
    momentosConcluidos: [...estado.momentosConcluidos],
    progressoMomentoAtual: serializarProgressoCanonico(estado),
  }
}

/**
 * Parses untrusted persisted data, preserving only a contiguous moment prefix
 * and catalogue-declared unit IDs. Replaying those units also canonicalizes an
 * impossible fully-complete action-only beat instead of restoring a deadlock.
 */
export function reconstruirProgressaoNoe(
  checkpoint: unknown,
): EstadoProgressaoNoe {
  if (!ehRegistro(checkpoint) || checkpoint.versao !== VERSAO_CHECKPOINT_NOE) {
    return criarEstadoProgressaoNoe()
  }

  const prefixo = obterPrefixoCanonico(checkpoint.momentosConcluidos)
  if (prefixo.length === momentosNoe.length) {
    return {
      momentoAtualId: momentosNoe[momentosNoe.length - 1].id,
      momentosConcluidos: prefixo,
      progressoMomentoAtual: [],
      concluida: true,
    }
  }

  const momentoAtual = momentosNoe[prefixo.length]
  const progresso = normalizarProgresso(
    checkpoint.progressoMomentoAtual,
    momentoAtual,
  )
  let reconstruido: EstadoProgressaoNoe = {
    momentoAtualId: momentoAtual.id,
    momentosConcluidos: prefixo,
    progressoMomentoAtual: [],
    concluida: false,
  }

  for (const tarefa of momentoAtual.gatilhoConclusao.tarefas) {
    const unidades = progresso.find(
      (item) => item.acaoId === tarefa.acaoId,
    )?.unidadesConcluidas
    for (const unidadeId of unidades ?? []) {
      reconstruido = processarEventoProgressaoNoe(reconstruido, {
        tipo: 'unidade-acao-concluida',
        acaoId: tarefa.acaoId,
        unidadeId,
      })
    }
  }

  return reconstruido
}
