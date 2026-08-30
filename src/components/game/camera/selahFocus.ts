import type { ColetavelMapa } from '../../../mapas/types'
import type { GatilhoSelah } from '../../../types/selah'
import type { FocoCameraSelah } from './types'

/** Pequeno deslocamento para enquadrar o centro luminoso do cristal. */
export const OFFSET_VERTICAL_CRISTAL = 0.35

/** Distância curta o bastante para destacar o colecionável sem cortar a cena. */
export const DISTANCIA_FOCO_SELAH = 5

/** Elevação positiva para manter o cristal e o terreno no enquadramento. */
export const ELEVACAO_FOCO_SELAH = 1.8

/**
 * Resolve o alvo cinematográfico do Momento Selah a partir de um gatilho do
 * mapa. A passagem só identifica um foco quando pertence à mesma história.
 */
export function resolverFocoCameraSelah(
  gatilho: GatilhoSelah | null | undefined,
  coletaveis: readonly ColetavelMapa[],
): FocoCameraSelah | null {
  if (!gatilho) return null

  const coletavel = coletaveis.find(
    (item) =>
      item.historiaId === gatilho.historiaId && item.passagemId === gatilho.passagemId,
  )

  if (!coletavel) return null

  return {
    id: coletavel.id,
    alvo: [
      coletavel.posicao[0],
      coletavel.posicao[1] + OFFSET_VERTICAL_CRISTAL,
      coletavel.posicao[2],
    ],
    distancia: DISTANCIA_FOCO_SELAH,
    elevacao: ELEVACAO_FOCO_SELAH,
  }
}
