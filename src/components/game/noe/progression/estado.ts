import { momentoNoePorId, momentosNoe } from './catalogo'
import type {
  ClimaNoe,
  EstadoProgressaoNoe,
  EventoProgressaoNoe,
  MarcoConclusaoNoe,
  MomentoNoe,
  MomentoNoeId,
} from './types'

const PRIMEIRO_MOMENTO = momentosNoe[0]

export function criarEstadoProgressaoNoe(): EstadoProgressaoNoe {
  return {
    momentoAtualId: PRIMEIRO_MOMENTO.id,
    momentosConcluidos: [],
    marcosMomentoAtualConcluidos: [],
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

export function chaveMarcoNoe(marco: MarcoConclusaoNoe): string {
  return marco.tipo === 'acao-concluida'
    ? `acao:${marco.acaoId}`
    : `selah:${marco.passagemId}`
}

function marcoEstaNoGatilho(
  marco: MarcoConclusaoNoe,
  momento: MomentoNoe,
): boolean {
  const chave = chaveMarcoNoe(marco)
  return momento.gatilhoConclusao.marcos.some(
    (requisito) => chaveMarcoNoe(requisito) === chave,
  )
}

function todosOsMarcosForamConcluidos(
  momento: MomentoNoe,
  marcosConcluidos: readonly MarcoConclusaoNoe[],
): boolean {
  const chavesConcluidas = new Set(marcosConcluidos.map(chaveMarcoNoe))
  return momento.gatilhoConclusao.marcos.every((marco) =>
    chavesConcluidas.has(chaveMarcoNoe(marco)),
  )
}

/**
 * Advances at most one canonical beat. Events from prior or future beats do
 * not accumulate, which prevents a previously completed Selah from skipping
 * a local Noah task after re-entry.
 */
export function processarEventoProgressaoNoe(
  estado: EstadoProgressaoNoe,
  evento: EventoProgressaoNoe,
): EstadoProgressaoNoe {
  if (estado.concluida) return estado

  const momentoAtual = obterMomentoAtualNoe(estado)
  if (!marcoEstaNoGatilho(evento, momentoAtual)) return estado

  const chaveEvento = chaveMarcoNoe(evento)
  if (
    estado.marcosMomentoAtualConcluidos.some(
      (marco) => chaveMarcoNoe(marco) === chaveEvento,
    )
  ) {
    return estado
  }

  const marcosConcluidos = [...estado.marcosMomentoAtualConcluidos, evento]
  if (!todosOsMarcosForamConcluidos(momentoAtual, marcosConcluidos)) {
    return { ...estado, marcosMomentoAtualConcluidos: marcosConcluidos }
  }

  const concluidos = [...estado.momentosConcluidos, momentoAtual.id]
  const proximo = momentosNoe[indiceMomentoNoe(momentoAtual.id) + 1]
  if (!proximo) {
    return {
      momentoAtualId: momentoAtual.id,
      momentosConcluidos: concluidos,
      marcosMomentoAtualConcluidos: [],
      concluida: true,
    }
  }

  return {
    momentoAtualId: proximo.id,
    momentosConcluidos: concluidos,
    marcosMomentoAtualConcluidos: [],
    concluida: false,
  }
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
