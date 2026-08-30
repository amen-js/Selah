import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useGameStore } from '../../../../stores/gameStore'
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
}

/** Bridges the pure Creation state machine to R3F movement and the quiz history. */
export function ProgressaoCriacaoRuntime({
  posicaoJogadorRef,
  enabled,
  onMomentoChange,
  onInatividadeChange,
}: ProgressaoCriacaoRuntimeProps) {
  const historico = useGameStore((state) => state.historico)
  const passagensRespondidas = useMemo(
    () => [...new Set(historico.map(({ passagemId }) => passagemId))],
    [historico],
  )
  const chavePassagens = passagensRespondidas.slice().sort().join('|')
  const [estado, setEstado] = useState(() =>
    reconstruirProgressaoCriacao(passagensRespondidas),
  )
  const estadoRef = useRef(estado)
  const posicaoAnteriorRef = useRef<PosicaoJogador | null>(null)
  const distanciaPercorridaRef = useRef(0)
  const estadoInatividadeRef = useRef<EstadoInatividadeCriacao>({
    ultimaAtividadeMs: 0,
    posicaoAnterior: null,
    inativo: false,
  })
  const onInatividadeChangeRef = useRef(onInatividadeChange)

  const emitir = (evento: EventoProgressaoCriacao) => {
    const processado = processarEventoProgressaoCriacao(estadoRef.current, evento)
    const proximo = aplicarSelahsConcluidos(processado, passagensRespondidas)
    if (proximo === estadoRef.current) return
    estadoRef.current = proximo
    setEstado(proximo)
  }

  useEffect(() => {
    const proximo = aplicarSelahsConcluidos(
      estadoRef.current,
      passagensRespondidas,
    )
    if (proximo === estadoRef.current) return
    estadoRef.current = proximo
    setEstado(proximo)
  }, [chavePassagens, passagensRespondidas])

  useEffect(() => {
    onMomentoChange?.(obterMomentoAtualCriacao(estado), estado)
  }, [estado, onMomentoChange])

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

    if (!posicaoAtual) return

    if (!enabled) {
      posicaoAnteriorRef.current = { ...posicaoAtual }
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
      return
    }

    if (
      gatilho.tipo === 'zona-narrativa' &&
      estaNoRaio(posicaoAtual, gatilho.posicao, gatilho.raio)
    ) {
      emitir({ tipo: 'zona-narrativa', zonaId: gatilho.zonaId })
    }
  })

  return null
}
