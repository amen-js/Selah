import type { Ponto3D } from '../../../../../mapas/types'
import { obterAlturaTerrenoCriacao } from '../terreno'

/** Places a visual prop on the shared deterministic terrain surface. */
export function noTerrenoBioma(
  x: number,
  z: number,
  deslocamentoY = 0,
): Ponto3D {
  return [x, obterAlturaTerrenoCriacao(x, z) + deslocamentoY, z]
}
