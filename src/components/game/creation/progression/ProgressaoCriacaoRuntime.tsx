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
import type {
  EstadoProgressaoCriacao,
  EventoProgressaoCriacao,
  MomentoCriacao,
} from './types'

export interface ProgressaoCriacaoRuntimeProps {
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  onMomentoChange?: (
    momento: MomentoCriacao,
    estado: EstadoProgressaoCriacao,
  ) => void
}

/** Bridges the pure Creation state machine to R3F movement and the quiz history. */
export function ProgressaoCriacaoRuntime({
  posicaoJogadorRef,
  enabled,
  onMomentoChange,
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

  useFrame(() => {
    const posicaoAtual = posicaoJogadorRef.current
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
