import type { Ponto3D } from '../../../../mapas/types'
import { reconstruirProgressaoNoe } from '../progression'
import type { CheckpointProgressaoNoe } from '../progression'
import { obterEstadoVisualAbrigoNoe } from '../world'

/** Safe lower-deck position used only while the Ark door is durably closed. */
export const SPAWN_INTERIOR_ARCA_NOE: Ponto3D = [0, 1.2, -8]

/**
 * Restores the child on the same safe side of the door as the checkpoint.
 * M9 opens the door again, so its default spawn remains on the new land.
 */
export function obterSpawnNoe(
  checkpoint: CheckpointProgressaoNoe | null,
  spawnPadrao: Ponto3D,
): Ponto3D {
  if (!checkpoint) return spawnPadrao

  const estado = reconstruirProgressaoNoe(checkpoint)
  return obterEstadoVisualAbrigoNoe(estado).porta === 'fechada'
    ? SPAWN_INTERIOR_ARCA_NOE
    : spawnPadrao
}
