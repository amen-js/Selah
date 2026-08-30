import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useGameStore } from '../../../../stores/gameStore'
import { ehTeclaConfirmacaoPortal } from '../../portals/teclas'
import type { PosicaoJogador } from '../proximidade'
import { estaNoRaio } from '../proximidade'
import { acumularDistanciaNarrativa } from './distancia'
import {
  aplicarSelahsConcluidos,
  obterMomentoAtualCriacao,
  processarEventoProgressaoCriacao,
  reconstruirProgressaoCriacao,
} from './estado'
import {
  atualizarInatividadeCriacao,
  type EstadoInatividadeCriacao,
} from './inatividade'
import {
  obterObjetivoZonaCriacao,
  type ObjetivoZonaCriacao,
} from './interacao'
import type {
  EstadoProgressaoCriacao,
  EventoProgressaoCriacao,
  MomentoCriacao,
} from './types'

const POSICAO_INATIVIDADE_PADRAO: PosicaoJogador = { x: 0, y: 0, z: 0 }

export interface ProgressaoCriacaoRuntimeProps {
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  onMomentoChange?: (
    momento: MomentoCriacao,
    estado: EstadoProgressaoCriacao,
  ) => void
  onInatividadeChange?: (inativo: boolean) => void
  onObjetivoProximo?: (objetivo: ObjetivoZonaCriacao | null) => void
}

/** Bridges the pure Creation state machine to R3F movement and the quiz history. */
export function ProgressaoCriacaoRuntime({
  posicaoJogadorRef,
  enabled,
  onMomentoChange,
  onInatividadeChange,
  onObjetivoProximo,
}: ProgressaoCriacaoRuntimeProps) {
  const selahsConcluidos = useGameStore((state) => state.selahsConcluidos)
  const momentosCriacaoConcluidos = useGameStore(
    (state) => state.momentosCriacaoConcluidos,
  )
  const setMomentosCriacaoConcluidos = useGameStore(
    (state) => state.setMomentosCriacaoConcluidos,
  )
  const [estado, setEstado] = useState(() =>
    reconstruirProgressaoCriacao(
      selahsConcluidos,
      momentosCriacaoConcluidos,
    ),
  )
  const estadoRef = useRef(estado)
  const selahsConcluidosRef = useRef(selahsConcluidos)
  const posicaoAnteriorRef = useRef<PosicaoJogador | null>(null)
  const distanciaPercorridaRef = useRef(0)
  const estadoInatividadeRef = useRef<EstadoInatividadeCriacao>({
    ultimaAtividadeMs: 0,
    posicaoAnterior: null,
    inativo: false,
  })
  const onInatividadeChangeRef = useRef(onInatividadeChange)
  const objetivoProximoRef = useRef<ObjetivoZonaCriacao | null>(null)
  const objetivoNotificadoIdRef = useRef<string | null>(null)

  const atualizarEstado = useCallback((proximo: EstadoProgressaoCriacao) => {
    if (proximo === estadoRef.current) return
    estadoRef.current = proximo
    setEstado(proximo)
  }, [])

  const emitir = useCallback((evento: EventoProgressaoCriacao) => {
    const processado = processarEventoProgressaoCriacao(estadoRef.current, evento)
    const proximo = aplicarSelahsConcluidos(
      processado,
      selahsConcluidosRef.current,
    )
    atualizarEstado(proximo)
  }, [atualizarEstado])

  const publicarObjetivoProximo = useCallback(
    (objetivo: ObjetivoZonaCriacao | null) => {
      objetivoProximoRef.current = objetivo
      const proximoId = objetivo?.id ?? null
      if (proximoId === objetivoNotificadoIdRef.current) return
      objetivoNotificadoIdRef.current = proximoId
      onObjetivoProximo?.(objetivo)
    },
    [onObjetivoProximo],
  )

  useEffect(() => {
    selahsConcluidosRef.current = selahsConcluidos
    if (!enabled) return

    const proximo = aplicarSelahsConcluidos(
      estadoRef.current,
      selahsConcluidos,
    )
    atualizarEstado(proximo)
  }, [atualizarEstado, enabled, selahsConcluidos])

  useEffect(() => {
    const reconstruido = reconstruirProgressaoCriacao(
      selahsConcluidosRef.current,
      momentosCriacaoConcluidos,
    )
    const atual = estadoRef.current
    const equivalente =
      reconstruido.momentoAtualId === atual.momentoAtualId &&
      reconstruido.concluida === atual.concluida &&
      reconstruido.momentosConcluidos.length ===
        atual.momentosConcluidos.length &&
      reconstruido.momentosConcluidos.every(
        (id, indice) => id === atual.momentosConcluidos[indice],
      )

    if (!equivalente) atualizarEstado(reconstruido)
  }, [atualizarEstado, momentosCriacaoConcluidos])

  useEffect(() => {
    setMomentosCriacaoConcluidos(estado.momentosConcluidos)
    onMomentoChange?.(obterMomentoAtualCriacao(estado), estado)
  }, [estado, onMomentoChange, setMomentosCriacaoConcluidos])

  useEffect(() => {
    if (!enabled) {
      publicarObjetivoProximo(null)
      return
    }

    const confirmarObjetivo = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !ehTeclaConfirmacaoPortal(event)) return
      const objetivo = objetivoProximoRef.current
      if (!objetivo) return

      event.preventDefault()
      event.stopImmediatePropagation()
      emitir({ tipo: 'zona-narrativa', zonaId: objetivo.id })
    }

    window.addEventListener('keydown', confirmarObjetivo)
    return () => window.removeEventListener('keydown', confirmarObjetivo)
  }, [emitir, enabled, publicarObjetivoProximo])

  useEffect(
    () => () => onObjetivoProximo?.(null),
    [onObjetivoProximo],
  )

  useEffect(() => {
    onInatividadeChangeRef.current = onInatividadeChange
  }, [onInatividadeChange])

  useEffect(() => {
    const resultado = atualizarInatividadeCriacao(
      estadoInatividadeRef.current,
      {
        agoraMs: performance.now(),
        posicao: posicaoJogadorRef.current ?? POSICAO_INATIVIDADE_PADRAO,
        enabled: false,
      },
    )
    estadoInatividadeRef.current = resultado.estado
    if (resultado.mudouPara !== null) {
      onInatividadeChangeRef.current?.(resultado.mudouPara)
    }
  }, [estado.momentoAtualId, posicaoJogadorRef])

  useFrame(() => {
    const posicaoAtual = posicaoJogadorRef.current
    const resultadoInatividade = atualizarInatividadeCriacao(
      estadoInatividadeRef.current,
      {
        agoraMs: performance.now(),
        posicao: posicaoAtual ?? POSICAO_INATIVIDADE_PADRAO,
        enabled: enabled && posicaoAtual !== null,
      },
    )
    estadoInatividadeRef.current = resultadoInatividade.estado
    if (resultadoInatividade.mudouPara !== null) {
      onInatividadeChangeRef.current?.(resultadoInatividade.mudouPara)
    }

    if (!posicaoAtual) {
      publicarObjetivoProximo(null)
      return
    }

    if (!enabled) {
      posicaoAnteriorRef.current = { ...posicaoAtual }
      publicarObjetivoProximo(null)
      return
    }

    distanciaPercorridaRef.current = acumularDistanciaNarrativa(
      distanciaPercorridaRef.current,
      posicaoAnteriorRef.current,
      posicaoAtual,
    )
    posicaoAnteriorRef.current = { ...posicaoAtual }

    const gatilho = obterMomentoAtualCriacao(estadoRef.current).gatilhoConclusao
    if (gatilho.tipo === 'distancia-percorrida') {
      emitir({
        tipo: 'distancia-percorrida',
        distancia: distanciaPercorridaRef.current,
      })
      publicarObjetivoProximo(null)
      return
    }

    if (gatilho.tipo === 'zona-narrativa') {
      const objetivo = obterObjetivoZonaCriacao(
        estadoRef.current.momentoAtualId,
        estadoRef.current.concluida,
      )
      publicarObjetivoProximo(
        objetivo && estaNoRaio(posicaoAtual, gatilho.posicao, gatilho.raio)
          ? objetivo
          : null,
      )
      return
    }

    publicarObjetivoProximo(null)
  })

  return null
}
