import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { Group } from 'three'
import type { ColetavelMapa } from '../../../mapas/types'
import { useGameStore } from '../../../stores/gameStore'
import type { PosicaoJogador } from '../creation/proximidade'
import { ehTeclaConfirmacaoPortal } from '../portals/teclas'
import {
  obterColetaveisAindaAcionados,
  RAIO_ATIVACAO_PADRAO,
  selecionarColetavelAcionavel,
} from './coletaveisInteracao'

export { RAIO_ATIVACAO_PADRAO }

export type ColetaveisRegiaoProps = {
  coletaveis: readonly ColetavelMapa[]
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  /** Mantém proximidade automática por padrão; quando true exige E ou Enter. */
  interacaoExplicita?: boolean
  /**
   * Delega a confirmação para um árbitro externo sem desativar a detecção nem
   * os visuais. Esse modo nunca abre o Selah ou consome E/Enter internamente.
   */
  confirmacaoExterna?: boolean
  /**
   * Compatibilidade das regiões existentes: por padrão, uma resposta no
   * histórico já bloqueia o cristal. Creation desliga isto porque resposta e
   * conclusão de Selah são marcos distintos no seu roteiro.
   */
  bloquearPassagensRespondidas?: boolean
  /** Notifica somente o coletável acionável mais próximo para um prompt externo. */
  onColetavelProximo?: (coletavel: ColetavelMapa | null) => void
  /** Substitui a abertura padrão do Selah quando o componente aciona o item. */
  onAcionarColetavel?: (coletavel: ColetavelMapa) => void
  reducedMotion?: boolean
}

type ColetavelRegiaoProps = {
  coletavel: ColetavelMapa
  enabled: boolean
  indice: number
  reducedMotion: boolean
}

function ColetavelRegiao({
  coletavel,
  enabled,
  indice,
  reducedMotion,
}: ColetavelRegiaoProps) {
  const grupoRef = useRef<Group>(null)
  const tempoAnimadoRef = useRef(0)
  const cor = coletavel.cor ?? '#fff0a8'
  const posicao: [number, number, number] = [
    coletavel.posicao[0],
    coletavel.posicao[1],
    coletavel.posicao[2],
  ]

  useFrame((_, delta) => {
    const grupo = grupoRef.current
    if (grupo && enabled) {
      if (reducedMotion) {
        grupo.rotation.y = 0
        grupo.position.y = posicao[1]
        return
      }
      tempoAnimadoRef.current += delta
      grupo.rotation.y += delta * 1.8
      grupo.position.y =
        posicao[1] + Math.sin(tempoAnimadoRef.current * 2 + indice * 0.9) * 0.16
    }
  })

  return (
    <group ref={grupoRef} position={posicao}>
      <pointLight color={cor} intensity={1.6} distance={4} />
      <mesh castShadow>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={2.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.025, 8, 32]} />
        <meshBasicMaterial color={cor} transparent opacity={0.72} />
      </mesh>
    </group>
  )
}

/** Renders animated collectible triggers for any region map. */
export function ColetaveisRegiao({
  coletaveis,
  posicaoJogadorRef,
  enabled,
  interacaoExplicita = false,
  confirmacaoExterna = false,
  bloquearPassagensRespondidas = true,
  onColetavelProximo,
  onAcionarColetavel,
  reducedMotion = false,
}: ColetaveisRegiaoProps) {
  const coletaveisAcionadosRef = useRef<Set<string>>(new Set())
  const proximoNotificadoIdRef = useRef<string | null>(null)

  const notificarColetavelProximo = useCallback(
    (coletavel: ColetavelMapa | null) => {
      if (!onColetavelProximo) {
        proximoNotificadoIdRef.current = null
        return
      }

      const proximoId = coletavel?.id ?? null
      if (proximoId === proximoNotificadoIdRef.current) return
      proximoNotificadoIdRef.current = proximoId
      onColetavelProximo(coletavel)
    },
    [onColetavelProximo],
  )

  const obterProximoAcionavel = useCallback(() => {
    const estado = useGameStore.getState()
    const posicaoJogador = posicaoJogadorRef.current
    const passagensBloqueadas = bloquearPassagensRespondidas
      ? [
          ...estado.selahsConcluidos,
          ...estado.historico.map(({ passagemId }) => passagemId),
        ]
      : estado.selahsConcluidos

    coletaveisAcionadosRef.current = obterColetaveisAindaAcionados(
      coletaveis,
      posicaoJogador,
      coletaveisAcionadosRef.current,
      passagensBloqueadas,
    )

    return selecionarColetavelAcionavel(coletaveis, posicaoJogador, {
      enabled,
      selahAtivo: estado.selahAtivo !== null,
      pausaParentalAtiva: estado.pausaParentalAtiva,
      selahsConcluidos: passagensBloqueadas,
      coletaveisAcionados: coletaveisAcionadosRef.current,
    })
  }, [
    bloquearPassagensRespondidas,
    coletaveis,
    enabled,
    posicaoJogadorRef,
  ])

  const acionarColetavel = useCallback(
    (coletavel: ColetavelMapa) => {
      coletaveisAcionadosRef.current.add(coletavel.id)

      if (onAcionarColetavel) {
        onAcionarColetavel(coletavel)
        return
      }

      useGameStore.getState().abrirSelah({
        historiaId: coletavel.historiaId,
        passagemId: coletavel.passagemId,
      })
    },
    [onAcionarColetavel],
  )

  useFrame(() => {
    const proximo = obterProximoAcionavel()

    if (interacaoExplicita || confirmacaoExterna) {
      notificarColetavelProximo(proximo)
      return
    }

    notificarColetavelProximo(null)
    if (proximo) acionarColetavel(proximo)
  })

  useEffect(() => {
    if (!interacaoExplicita || confirmacaoExterna) return

    const confirmarColetavel = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !enabled ||
        !ehTeclaConfirmacaoPortal(event)
      ) return

      const proximo = obterProximoAcionavel()
      if (!proximo) return

      event.preventDefault()
      event.stopImmediatePropagation()
      acionarColetavel(proximo)
      notificarColetavelProximo(null)
    }

    window.addEventListener('keydown', confirmarColetavel)
    return () => window.removeEventListener('keydown', confirmarColetavel)
  }, [
    acionarColetavel,
    confirmacaoExterna,
    enabled,
    interacaoExplicita,
    notificarColetavelProximo,
    obterProximoAcionavel,
  ])

  useEffect(() => {
    proximoNotificadoIdRef.current = null
    return () => onColetavelProximo?.(null)
  }, [onColetavelProximo])

  return (
    <>
      {coletaveis.map((coletavel, indice) => (
        <ColetavelRegiao
          key={coletavel.id}
          coletavel={coletavel}
          enabled={enabled}
          indice={indice}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  )
}
