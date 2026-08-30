import type { PosicaoJogador } from '../proximidade'

export const TEMPO_INATIVIDADE_CRIACAO_MS = 12_000
export const DESLOCAMENTO_MINIMO_ATIVIDADE = 0.05

export interface EstadoInatividadeCriacao {
  ultimaAtividadeMs: number
  posicaoAnterior: PosicaoJogador | null
  inativo: boolean
}

export interface EntradaInatividadeCriacao {
  agoraMs: number
  posicao: PosicaoJogador
  enabled: boolean
}

export interface ResultadoInatividadeCriacao {
  estado: EstadoInatividadeCriacao
  mudouPara: boolean | null
}

function houveMovimentoHorizontal(
  anterior: PosicaoJogador,
  atual: PosicaoJogador,
): boolean {
  return (
    Math.hypot(atual.x - anterior.x, atual.z - anterior.z) >=
    DESLOCAMENTO_MINIMO_ATIVIDADE
  )
}

/** Tracks only meaningful ground-plane movement and emits state transitions. */
export function atualizarInatividadeCriacao(
  estado: EstadoInatividadeCriacao,
  entrada: EntradaInatividadeCriacao,
): ResultadoInatividadeCriacao {
  const { agoraMs, posicao, enabled } = entrada

  if (!enabled) {
    return {
      estado: {
        ultimaAtividadeMs: agoraMs,
        posicaoAnterior: null,
        inativo: false,
      },
      mudouPara: estado.inativo ? false : null,
    }
  }

  if (
    !estado.posicaoAnterior ||
    houveMovimentoHorizontal(estado.posicaoAnterior, posicao)
  ) {
    return {
      estado: {
        ultimaAtividadeMs: agoraMs,
        posicaoAnterior: { ...posicao },
        inativo: false,
      },
      mudouPara: estado.inativo ? false : null,
    }
  }

  if (
    !estado.inativo &&
    agoraMs - estado.ultimaAtividadeMs >= TEMPO_INATIVIDADE_CRIACAO_MS
  ) {
    return {
      estado: { ...estado, inativo: true },
      mudouPara: true,
    }
  }

  return { estado, mudouPara: null }
}
