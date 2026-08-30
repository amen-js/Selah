import { momentoCriacaoPorId, momentosCriacao } from './catalogo'
import type {
  EstadoProgressaoCriacao,
  EventoProgressaoCriacao,
  GatilhoConclusaoMomentoCriacao,
  MomentoCriacao,
  MomentoCriacaoId,
} from './types'

const PRIMEIRO_MOMENTO = momentosCriacao[0]

export function criarEstadoProgressaoCriacao(): EstadoProgressaoCriacao {
  return {
    momentoAtualId: PRIMEIRO_MOMENTO.id,
    momentosConcluidos: [],
    concluida: false,
  }
}

function gatilhoFoiAtendido(
  gatilho: GatilhoConclusaoMomentoCriacao,
  evento: EventoProgressaoCriacao,
): boolean {
  if (gatilho.tipo !== evento.tipo) return false

  switch (gatilho.tipo) {
    case 'distancia-percorrida':
      return evento.tipo === gatilho.tipo && evento.distancia >= gatilho.distanciaMinima
    case 'zona-narrativa':
      return evento.tipo === gatilho.tipo && evento.zonaId === gatilho.zonaId
    case 'selah-concluido':
      return evento.tipo === gatilho.tipo && evento.passagemId === gatilho.passagemId
  }
}

export function obterMomentoAtualCriacao(
  estado: EstadoProgressaoCriacao,
): MomentoCriacao {
  return momentoCriacaoPorId.get(estado.momentoAtualId) ?? PRIMEIRO_MOMENTO
}

export function indiceMomentoCriacao(id: MomentoCriacaoId): number {
  return momentosCriacao.findIndex((momento) => momento.id === id)
}

/** Advances exactly one beat; unrelated or future events are ignored. */
export function processarEventoProgressaoCriacao(
  estado: EstadoProgressaoCriacao,
  evento: EventoProgressaoCriacao,
): EstadoProgressaoCriacao {
  if (estado.concluida) return estado

  const momentoAtual = obterMomentoAtualCriacao(estado)
  if (!gatilhoFoiAtendido(momentoAtual.gatilhoConclusao, evento)) return estado

  const indiceAtual = indiceMomentoCriacao(momentoAtual.id)
  const proximo = momentosCriacao[indiceAtual + 1]
  const concluidos = estado.momentosConcluidos.includes(momentoAtual.id)
    ? estado.momentosConcluidos
    : [...estado.momentosConcluidos, momentoAtual.id]

  if (!proximo) {
    return {
      momentoAtualId: momentoAtual.id,
      momentosConcluidos: concluidos,
      concluida: true,
    }
  }

  return {
    momentoAtualId: proximo.id,
    momentosConcluidos: concluidos,
    concluida: false,
  }
}

/** Consumes already answered Selahs only when they match the current beat. */
export function aplicarSelahsConcluidos(
  estado: EstadoProgressaoCriacao,
  passagensConcluidas: readonly string[],
): EstadoProgressaoCriacao {
  const concluidas = new Set(passagensConcluidas)
  let atual = estado

  while (!atual.concluida) {
    const gatilho = obterMomentoAtualCriacao(atual).gatilhoConclusao
    if (
      gatilho.tipo !== 'selah-concluido' ||
      !concluidas.has(gatilho.passagemId)
    ) {
      break
    }

    const proximo = processarEventoProgressaoCriacao(atual, {
      tipo: 'selah-concluido',
      passagemId: gatilho.passagemId,
    })
    if (proximo === atual) break
    atual = proximo
  }

  return atual
}

const MARCOS_SELAH = momentosCriacao.flatMap((momento, indice) =>
  momento.gatilhoConclusao.tipo === 'selah-concluido'
    ? [{ passagemId: momento.gatilhoConclusao.passagemId, indice }]
    : [],
)

/** Rebuilds a canonical state from the longest valid completed-moment prefix. */
export function reconstruirProgressaoPorMomentosConcluidos(
  idsConcluidos: readonly string[],
): EstadoProgressaoCriacao | null {
  if (idsConcluidos.length === 0) return null

  const concluidos: MomentoCriacaoId[] = []
  for (const momento of momentosCriacao) {
    if (idsConcluidos[concluidos.length] !== momento.id) break
    concluidos.push(momento.id)
  }

  if (concluidos.length === 0) return null

  const concluida = concluidos.length === momentosCriacao.length
  const momentoAtual = concluida
    ? momentosCriacao[momentosCriacao.length - 1]
    : momentosCriacao[concluidos.length]

  return {
    momentoAtualId: momentoAtual.id,
    momentosConcluidos: concluidos,
    concluida,
  }
}

/**
 * Restores the exact canonical checkpoint when available and otherwise falls
 * back to Selahs that were actually concluded in legacy saved sessions.
 */
export function reconstruirProgressaoCriacao(
  passagensConcluidas: readonly string[],
  momentosConcluidos: readonly string[] = [],
): EstadoProgressaoCriacao {
  const checkpoint = reconstruirProgressaoPorMomentosConcluidos(momentosConcluidos)
  if (checkpoint) return checkpoint

  const concluidas = new Set(passagensConcluidas)
  let maiorIndiceComprovado = -1

  for (const marco of MARCOS_SELAH) {
    if (!concluidas.has(marco.passagemId)) break
    maiorIndiceComprovado = marco.indice
  }

  if (maiorIndiceComprovado < 0) return criarEstadoProgressaoCriacao()

  const proximoIndice = Math.min(maiorIndiceComprovado + 1, momentosCriacao.length - 1)
  return {
    momentoAtualId: momentosCriacao[proximoIndice].id,
    momentosConcluidos: momentosCriacao
      .slice(0, maiorIndiceComprovado + 1)
      .map((momento) => momento.id),
    concluida: false,
  }
}
