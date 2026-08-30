import { momentoNoePorId, momentosNoe } from './catalogo'
import { expandirUnidadeCompativelNoe } from './compatibilidade'
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

export function obterMomentoAtualNoe(estado: EstadoProgressaoNoe): MomentoNoe {
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

function etapaTarefaNoe(
  tarefas: readonly TarefaMomentoNoe[],
  indice: number,
): number {
  return tarefas[indice]?.etapa ?? indice + 1
}

function tarefaDisponivelNoe(
  estado: EstadoProgressaoNoe,
  momento: MomentoNoe,
  tarefa: TarefaMomentoNoe,
): boolean {
  const indiceTarefa = momento.gatilhoConclusao.tarefas.indexOf(tarefa)
  const etapaTarefa = etapaTarefaNoe(
    momento.gatilhoConclusao.tarefas,
    indiceTarefa,
  )

  return momento.gatilhoConclusao.tarefas.every((requisito, indice) => {
    if (
      etapaTarefaNoe(momento.gatilhoConclusao.tarefas, indice) >= etapaTarefa
    ) {
      return true
    }

    return (
      quantidadeConcluidaTarefaNoe(estado, requisito.acaoId) >=
      requisito.unidadesNecessarias.length
    )
  })
}

export function quantidadeConcluidaTarefaNoe(
  estado: EstadoProgressaoNoe,
  acaoId: AcaoNoeId,
): number {
  const tarefa = obterMomentoAtualNoe(estado).gatilhoConclusao.tarefas.find(
    (requisito) => requisito.acaoId === acaoId,
  )
  if (!tarefa) return 0

  const unidadesPermitidas = new Set<string>(tarefa.unidadesNecessarias)
  const unidadesRegistradas = obterProgressoAcao(
    estado,
    acaoId,
  )?.unidadesConcluidas
  return new Set(
    (unidadesRegistradas ?? []).filter((unidadeId) =>
      unidadesPermitidas.has(unidadeId),
    ),
  ).size
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
  const permitidas = new Set<string>(tarefa.unidadesNecessarias)
  const unidadesExistentes = [
    ...new Set(
      (progressoExistente?.unidadesConcluidas ?? []).filter((unidade) =>
        permitidas.has(unidade),
      ),
    ),
  ]
  if (
    unidadesExistentes.includes(idNormalizado) ||
    unidadesExistentes.length >= tarefa.unidadesNecessarias.length
  ) {
    return estado
  }

  const progressoAtualizado: ProgressoAcaoNoe = {
    acaoId: tarefa.acaoId,
    unidadesConcluidas: [...unidadesExistentes, idNormalizado],
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
function processarUnidadeCanonicaNoe(
  estado: EstadoProgressaoNoe,
  momentoAtual: MomentoNoe,
  acaoId: AcaoNoeId,
  unidadeId: string,
): EstadoProgressaoNoe {
  const tarefa = momentoAtual.gatilhoConclusao.tarefas.find(
    (requisito) => requisito.acaoId === acaoId,
  )
  if (!tarefa) return estado

  if (!tarefaDisponivelNoe(estado, momentoAtual, tarefa)) return estado

  const atualizado = registrarUnidadeConcluida(estado, tarefa, unidadeId)
  if (atualizado === estado) return estado

  if (
    tarefasLocaisConcluidasNoe(atualizado, momentoAtual) &&
    !momentoAtual.gatilhoConclusao.selahFinal
  ) {
    return avancarMomentoNoe(atualizado, momentoAtual)
  }

  return atualizado
}

/**
 * Advances at most one canonical beat. Unit IDs make task events idempotent,
 * and a Selah is accepted only after every local requirement has finished.
 * Placeholder events emitted by World 2 v1 are expanded only inside their
 * original beat, preserving old checkpoints without weakening new ordering.
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

  const unidades = expandirUnidadeCompativelNoe(
    momentoAtual.id,
    evento.acaoId,
    evento.unidadeId.trim(),
  )
  let atualizado = estado

  for (const unidade of unidades) {
    if (atualizado.concluida || atualizado.momentoAtualId !== momentoAtual.id) {
      break
    }
    atualizado = processarUnidadeCanonicaNoe(
      atualizado,
      momentoAtual,
      unidade.acaoId,
      unidade.unidadeId,
    )
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
  const tarefasPendentes = momento.gatilhoConclusao.tarefas.flatMap(
    (tarefa) => {
      const quantidadeConcluida = quantidadeConcluidaTarefaNoe(
        estado,
        tarefa.acaoId,
      )
      return quantidadeConcluida < tarefa.unidadesNecessarias.length &&
        tarefaDisponivelNoe(estado, momento, tarefa)
        ? [
            {
              tipo: 'tarefa-local' as const,
              acaoId: tarefa.acaoId,
              quantidadeConcluida,
              quantidadeNecessaria: tarefa.unidadesNecessarias.length,
            },
          ]
        : []
    },
  )

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
  const portaFechadaComTodosSeguros =
    concluidos.has('fechamento-porta') ||
    (estado.momentoAtualId === 'fechamento-porta' &&
      tarefasLocaisConcluidasNoe(estado))

  if (estado.concluida) {
    return { percentualPreparacao: 100, fase: 'nova-terra', chuvaAtiva: false }
  }
  if (concluidos.has('retorno-pomba')) {
    return { percentualPreparacao: 100, fase: 'nova-terra', chuvaAtiva: false }
  }
  if (concluidos.has('refugio-tempestade')) {
    return {
      percentualPreparacao: 100,
      fase: 'luz-retornando',
      chuvaAtiva: false,
    }
  }
  if (portaFechadaComTodosSeguros) {
    return {
      percentualPreparacao: 100,
      fase: 'chuva-segura',
      chuvaAtiva: true,
    }
  }
  if (concluidos.has('acomodacao-animais')) {
    return {
      percentualPreparacao: 100,
      fase: 'abrigo-pronto',
      chuvaAtiva: false,
    }
  }
  if (concluidos.has('conducao-animais')) {
    return { percentualPreparacao: 66, fase: 'vento-suave', chuvaAtiva: false }
  }
  if (concluidos.has('coleta-vedacao')) {
    return {
      percentualPreparacao: 33,
      fase: 'nuvens-leves',
      chuvaAtiva: false,
    }
  }

  return { percentualPreparacao: 0, fase: 'calmo', chuvaAtiva: false }
}
