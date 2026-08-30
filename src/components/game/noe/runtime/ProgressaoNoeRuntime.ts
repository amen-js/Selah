import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useGameStore } from '../../../../stores/gameStore'
import {
  criarCheckpointProgressaoNoe,
  reconstruirProgressaoNoe,
} from '../progression/checkpoint'
import {
  criarEstadoProgressaoNoe,
  obterRequisitosPendentesNoe,
  processarEventoProgressaoNoe,
} from '../progression/estado'
import type {
  EstadoProgressaoNoe,
  EventoProgressaoNoe,
} from '../progression/types'
import { obterRequisitoSelahFinalNoe } from './interacao'

function estadosNoeIguais(
  atual: EstadoProgressaoNoe,
  proximo: EstadoProgressaoNoe,
): boolean {
  return (
    atual.momentoAtualId === proximo.momentoAtualId &&
    atual.concluida === proximo.concluida &&
    JSON.stringify(criarCheckpointProgressaoNoe(atual)) ===
      JSON.stringify(criarCheckpointProgressaoNoe(proximo))
  )
}

export interface ProgressaoNoeRuntime {
  estado: EstadoProgressaoNoe
  emitir: (evento: EventoProgressaoNoe) => void
}

type AcaoProgressaoNoeRuntime =
  | { tipo: 'evento'; evento: EventoProgressaoNoe }
  | {
      tipo: 'hidratar'
      checkpoint: ReturnType<typeof criarCheckpointProgressaoNoe> | null
    }

function reduzirProgressaoNoeRuntime(
  estado: EstadoProgressaoNoe,
  acao: AcaoProgressaoNoeRuntime,
): EstadoProgressaoNoe {
  if (acao.tipo === 'evento') {
    return processarEventoProgressaoNoe(estado, acao.evento)
  }

  const reconstruido = acao.checkpoint
    ? reconstruirProgressaoNoe(acao.checkpoint)
    : criarEstadoProgressaoNoe()
  return estadosNoeIguais(estado, reconstruido) ? estado : reconstruido
}

/**
 * Owns Noah's local state and bridges it to the privacy-aware global
 * checkpoint. Selahs are consumed only while exploration is active again,
 * which necessarily happens after the parental pause has been released.
 */
export function useProgressaoNoeRuntime(
  enabled: boolean,
): ProgressaoNoeRuntime {
  const checkpointNoe = useGameStore((state) => state.checkpointNoe)
  const setCheckpointNoe = useGameStore((state) => state.setCheckpointNoe)
  const selahsConcluidos = useGameStore((state) => state.selahsConcluidos)
  const [estado, dispatch] = useReducer(
    reduzirProgressaoNoeRuntime,
    checkpointNoe,
    (checkpoint) =>
      checkpoint
        ? reconstruirProgressaoNoe(checkpoint)
        : criarEstadoProgressaoNoe(),
  )
  const ultimoCheckpointPublicadoRef = useRef(checkpointNoe)

  const emitir = useCallback((evento: EventoProgressaoNoe) => {
    dispatch({ tipo: 'evento', evento })
  }, [])

  useEffect(() => {
    const checkpoint = criarCheckpointProgressaoNoe(estado)
    ultimoCheckpointPublicadoRef.current = checkpoint
    setCheckpointNoe(checkpoint)
  }, [estado, setCheckpointNoe])

  useEffect(() => {
    if (checkpointNoe === ultimoCheckpointPublicadoRef.current) return

    dispatch({ tipo: 'hidratar', checkpoint: checkpointNoe })
  }, [checkpointNoe])

  useEffect(() => {
    if (!enabled) return

    const selahFinal = obterRequisitoSelahFinalNoe(
      obterRequisitosPendentesNoe(estado),
    )
    if (!selahFinal || !selahsConcluidos.includes(selahFinal.passagemId)) {
      return
    }

    dispatch({
      tipo: 'evento',
      evento: {
        tipo: 'selah-concluido',
        passagemId: selahFinal.passagemId,
      },
    })
  }, [enabled, estado, selahsConcluidos])

  return { estado, emitir }
}
