import { momentoNoePorId, momentosNoe } from './catalogo'
import type {
  AcaoNoeId,
  ClimaNoe,
  EstadoProgressaoNoe,
  EventoProgressaoNoe,
  MomentoNoe,
  MomentoNoeId,
  ProgressoAcaoNoe,
  TarefaMomentoNoe,
} from './types'

const PRIMEIRO_MOMENTO = momentosNoe[0]

export function criarEstadoProgressaoNoe(): EstadoProgressaoNoe {
  return {
    momentoAtualId: PRIMEIRO_MOMENTO.id,
    momentosConcluidos: [],
    progressoMomentoAtual: [],
    concluida: false,
  }
}

export function obterMomentoAtualNoe(
  estado: EstadoProgressaoNoe,
): MomentoNoe {
  return momentoNoePorId.get(estado.momentoAtualId) ?? PRIMEIRO_MOMENTO
}

export function indiceMomentoNoe(id: MomentoNoeId): number {
  return momentosNoe.findIndex((momento) => momento.id === id)
}

function obterProgressoAcao(
  estado: EstadoProgressaoNoe,
  acaoId: AcaoNoeId,
): ProgressoAcaoNoe | undefined {
  return estado.progressoMomentoAtual.find(
    (progresso) => progresso.acaoId === acaoId,
  )
}

export function quantidadeConcluidaTarefaNoe(
  estado: EstadoProgressaoNoe,
  acaoId: AcaoNoeId,
): number {
  return obterProgressoAcao(estado, acaoId)?.unidadesConcluidas.length ?? 0
}

export function tarefasLocaisConcluidasNoe(
  estado: EstadoProgressaoNoe,
  momento = obterMomentoAtualNoe(estado),
): boolean {
  return momento.gatilhoConclusao.tarefas.every(
    (tarefa) =>
      quantidadeConcluidaTarefaNoe(estado, tarefa.acaoId) >=
      tarefa.unidadesNecessarias.length,
  )
}

function avancarMomentoNoe(
  estado: EstadoProgressaoNoe,
  momentoAtual: MomentoNoe,
): EstadoProgressaoNoe {
  const concluidos = [...estado.momentosConcluidos, momentoAtual.id]
  const proximo = momentosNoe[indiceMomentoNoe(momentoAtual.id) + 1]

  if (!proximo) {
    return {
      momentoAtualId: momentoAtual.id,
      momentosConcluidos: concluidos,
      progressoMomentoAtual: [],
      concluida: true,
    }
  }

  return {
    momentoAtualId: proximo.id,
    momentosConcluidos: concluidos,
    progressoMomentoAtual: [],
    concluida: false,
  }
}

function registrarUnidadeConcluida(
  estado: EstadoProgressaoNoe,
  tarefa: TarefaMomentoNoe,
  unidadeId: string,
): EstadoProgressaoNoe {
  const idNormalizado = unidadeId.trim()
  if (!idNormalizado || !tarefa.unidadesNecessarias.includes(idNormalizado)) {
    return estado
  }

  const progressoExistente = obterProgressoAcao(estado, tarefa.acaoId)
  if (
    progressoExistente?.unidadesConcluidas.includes(idNormalizado) ||
    (progressoExistente?.unidadesConcluidas.length ?? 0) >=
      tarefa.unidadesNecessarias.length
  ) {
    return estado
  }

  const progressoAtualizado: ProgressoAcaoNoe = {
    acaoId: tarefa.acaoId,
    unidadesConcluidas: [
      ...(progressoExistente?.unidadesConcluidas ?? []),
      idNormalizado,
    ],
  }
  const progressoMomentoAtual = progressoExistente
    ? estado.progressoMomentoAtual.map((progresso) =>
        progresso.acaoId === tarefa.acaoId ? progressoAtualizado : progresso,
      )
    : [...estado.progressoMomentoAtual, progressoAtualizado]

  return { ...estado, progressoMomentoAtual }
}

/**
 * Advances at most one canonical beat. Unit IDs make task events idempotent,
 * and a Selah is accepted only after every local requirement has finished.
 */
export function processarEventoProgressaoNoe(
  estado: EstadoProgressaoNoe,
  evento: EventoProgressaoNoe,
): EstadoProgressaoNoe {
  if (estado.concluida) return estado

  const momentoAtual = obterMomentoAtualNoe(estado)

  if (evento.tipo === 'selah-concluido') {
    if (
      momentoAtual.gatilhoConclusao.selahFinal !== evento.passagemId ||
      !tarefasLocaisConcluidasNoe(estado, momentoAtual)
    ) {
      return estado
    }

    return avancarMomentoNoe(estado, momentoAtual)
  }

  const tarefa = momentoAtual.gatilhoConclusao.tarefas.find(
    (requisito) => requisito.acaoId === evento.acaoId,
  )
  if (!tarefa) return estado

  const atualizado = registrarUnidadeConcluida(
    estado,
    tarefa,
    evento.unidadeId,
  )
  if (atualizado === estado) return estado

  if (
    tarefasLocaisConcluidasNoe(atualizado, momentoAtual) &&
    !momentoAtual.gatilhoConclusao.selahFinal
  ) {
    return avancarMomentoNoe(atualizado, momentoAtual)
  }

  return atualizado
}

export type RequisitoPendenteNoe =
  | {
      tipo: 'tarefa-local'
      acaoId: AcaoNoeId
      quantidadeConcluida: number
      quantidadeNecessaria: number
    }
  | { tipo: 'selah-final'; passagemId: string }

/** Returns only actionable requirements, never a premature final Selah. */
export function obterRequisitosPendentesNoe(
  estado: EstadoProgressaoNoe,
): readonly RequisitoPendenteNoe[] {
  if (estado.concluida) return []

  const momento = obterMomentoAtualNoe(estado)
  const tarefasPendentes = momento.gatilhoConclusao.tarefas.flatMap((tarefa) => {
    const quantidadeConcluida = quantidadeConcluidaTarefaNoe(
      estado,
      tarefa.acaoId,
    )
    return quantidadeConcluida < tarefa.unidadesNecessarias.length
      ? [
          {
            tipo: 'tarefa-local' as const,
            acaoId: tarefa.acaoId,
            quantidadeConcluida,
            quantidadeNecessaria: tarefa.unidadesNecessarias.length,
          },
        ]
      : []
  })

  if (tarefasPendentes.length > 0) return tarefasPendentes
  return momento.gatilhoConclusao.selahFinal
    ? [
        {
          tipo: 'selah-final',
          passagemId: momento.gatilhoConclusao.selahFinal,
        },
      ]
    : []
}

/**
 * Weather is a deterministic projection of confirmed journey beats. It keeps
 * preparation calm until every task is complete and never starts rain before
 * the safe entrance/door beat (M6).
 */
export function obterClimaNoe(estado: EstadoProgressaoNoe): ClimaNoe {
  const concluidos = new Set(estado.momentosConcluidos)

  if (estado.concluida) {
    return { percentualPreparacao: 100, fase: 'nova-terra', chuvaAtiva: false }
  }
  if (concluidos.has('retorno-pomba')) {
    return {
      percentualPreparacao: 100,
      fase: 'luz-retornando',
      chuvaAtiva: false,
    }
  }
  if (concluidos.has('fechamento-porta')) {
    return { percentualPreparacao: 100, fase: 'chuva-segura', chuvaAtiva: true }
  }
  if (concluidos.has('acomodacao-animais')) {
    return { percentualPreparacao: 100, fase: 'abrigo-pronto', chuvaAtiva: false }
  }
  if (concluidos.has('conducao-animais')) {
    return { percentualPreparacao: 66, fase: 'vento-suave', chuvaAtiva: false }
  }
  if (concluidos.has('coleta-vedacao')) {
    return { percentualPreparacao: 33, fase: 'nuvens-leves', chuvaAtiva: false }
  }

  return { percentualPreparacao: 0, fase: 'calmo', chuvaAtiva: false }
}
