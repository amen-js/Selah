import type { Ponto3D } from '../../../mapas/types'

export type PosicaoJogador = Readonly<{
  x: number
  y: number
  z: number
}>

/** Distância euclidiana entre duas posições no espaço 3D. */
export function distancia3D(a: PosicaoJogador, b: PosicaoJogador): number {
  const deltaX = a.x - b.x
  const deltaY = a.y - b.y
  const deltaZ = a.z - b.z

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ)
}

/**
 * Retorna true quando o jogador está dentro ou exatamente no limite do raio.
 * A comparação inclusiva evita que um gatilho falhe no frame de entrada.
 */
export function estaNoRaio(
  jogador: PosicaoJogador,
  centro: Ponto3D,
  raio: number,
): boolean {
  return distancia3D(jogador, { x: centro[0], y: centro[1], z: centro[2] }) <= raio
}
