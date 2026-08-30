import type { Escala3D, Ponto3D, PropMapa } from '../../../mapas/types'

export type EscalaRenderizacao = [number, number, number]

/**
 * Converts the compact map scale into a tuple understood by Three.js.
 * The returned tuple is new so map data remains readonly and safe to share.
 */
export function normalizarEscala(escala?: Escala3D): EscalaRenderizacao {
  if (typeof escala === 'number') return [escala, escala, escala]
  if (escala) return [escala[0], escala[1], escala[2]]
  return [1, 1, 1]
}

export interface TransformacaoProp {
  position: Ponto3D
  rotation: [number, number, number]
  scale: EscalaRenderizacao
}

/** Produces the complete render transform for a map prop. */
export function obterTransformacaoProp(prop: Pick<PropMapa, 'posicao' | 'rotacao' | 'escala'>): TransformacaoProp {
  return {
    position: prop.posicao,
    rotation: [0, prop.rotacao ?? 0, 0],
    scale: normalizarEscala(prop.escala),
  }
}
