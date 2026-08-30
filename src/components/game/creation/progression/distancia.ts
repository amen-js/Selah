import type { PosicaoJogador } from '../proximidade'

export const SALTO_MAXIMO_CONTABILIZADO = 2

export function distanciaHorizontal(
  anterior: PosicaoJogador,
  atual: PosicaoJogador,
): number {
  return Math.hypot(atual.x - anterior.x, atual.z - anterior.z)
}

/** Ignores teleports and region spawns when accumulating narrative movement. */
export function acumularDistanciaNarrativa(
  acumulada: number,
  anterior: PosicaoJogador | null,
  atual: PosicaoJogador,
  saltoMaximo = SALTO_MAXIMO_CONTABILIZADO,
): number {
  if (!anterior) return acumulada

  const delta = distanciaHorizontal(anterior, atual)
  return delta <= saltoMaximo ? acumulada + delta : acumulada
}
