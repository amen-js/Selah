import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  selecionarPortalDetectado,
  selecionarPortalProximo,
} from './proximidade'
import { ehTeclaConfirmacaoPortal } from './teclas'
import { PortalVisual } from './PortalVisual'
import type { PortalMapa, PosicaoXZ } from './types'

export interface PortaisRegiaoProps {
  portais: readonly PortalMapa[]
  playerRef: RefObject<PosicaoXZ | null>
  enabled: boolean
  /**
   * Delega E/Enter para um árbitro externo, mantendo visuais e detecção ativos.
   */
  confirmacaoExterna?: boolean
  /** Recebe o mais próximo mesmo quando indisponível, para feedback. */
  onPortalProximo?: (portal: PortalMapa | null) => void
  /** Recebe somente o mais próximo disponível. */
  onPortalAcionavel?: (portal: PortalMapa | null) => void
  /** Chamado por E/Enter somente para um portal disponível. */
  onPortalAcionado?: (portal: PortalMapa) => void
  reducedMotion?: boolean
}

/** Renderiza portais e mantém a detecção desacoplada da navegação global. */
export function PortaisRegiao({
  portais,
  playerRef,
  enabled,
  confirmacaoExterna = false,
  onPortalProximo,
  onPortalAcionavel,
  onPortalAcionado,
  reducedMotion = false,
}: PortaisRegiaoProps) {
  const [portalEmFocoId, setPortalEmFocoId] = useState<string | null>(null)
  const portalAcionavelRef = useRef<PortalMapa | null>(null)
  const portalDetectadoIdRef = useRef<string | null>(null)
  const portalAcionavelIdRef = useRef<string | null>(null)

  useFrame(() => {
    const jogador = playerRef.current
    const detectado = enabled && jogador
      ? selecionarPortalDetectado(jogador, portais)
      : null
    const acionavel = enabled && jogador
      ? selecionarPortalProximo(jogador, portais)
      : null

    portalAcionavelRef.current = acionavel

    if (detectado?.id !== portalDetectadoIdRef.current) {
      portalDetectadoIdRef.current = detectado?.id ?? null
      setPortalEmFocoId(detectado?.id ?? null)
      onPortalProximo?.(detectado)
    }

    if (acionavel?.id !== portalAcionavelIdRef.current) {
      portalAcionavelIdRef.current = acionavel?.id ?? null
      onPortalAcionavel?.(acionavel)
    }
  })

  useEffect(() => {
    if (confirmacaoExterna) return

    const confirmarPortal = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !enabled ||
        !ehTeclaConfirmacaoPortal(event)
      ) return

      const portal = portalAcionavelRef.current
      if (!portal) return

      event.preventDefault()
      event.stopImmediatePropagation()
      onPortalAcionado?.(portal)
    }

    window.addEventListener('keydown', confirmarPortal)
    return () => window.removeEventListener('keydown', confirmarPortal)
  }, [confirmacaoExterna, enabled, onPortalAcionado])

  return (
    <>
      {portais.map((portal, indice) => (
        <PortalVisual
          key={portal.id}
          portal={portal}
          ativo={portal.id === portalEmFocoId}
          indice={indice}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  )
}
