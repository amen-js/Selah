import type { Ponto3D } from '../../../../mapas/types'

export type PersonagemFamiliaNoeId = 'noe' | 'sem' | 'jafe'

export const posicoesFamiliaNoe = [
  { id: 'noe', posicao: [-10.5, 0, 9.5], rotacaoY: 0, escala: 1 },
  { id: 'sem', posicao: [-12.45, 0, 8.2], rotacaoY: 0.22, escala: 0.9 },
  { id: 'jafe', posicao: [-8.55, 0, 8.15], rotacaoY: -0.22, escala: 0.88 },
] as const satisfies readonly {
  id: PersonagemFamiliaNoeId
  posicao: Ponto3D
  rotacaoY: number
  escala: number
}[]

export const instanciasBosqueGoferNoe = [
  [-31, 0, -36, -0.35, 4.8],
  [-25, 0, -29, 0.3, 4.25],
  [-30, 0, -20, -0.8, 4.65],
  [-24, 0, -11, 0.65, 4.2],
  [-29, 0, -1, 0.1, 4.75],
  [-25, 0, 9, -0.45, 4.35],
  [-31, 0, 19, 0.75, 4.9],
  [-26, 0, 30, -0.15, 4.45],
  [31, 0, -36, 0.45, 4.75],
  [25, 0, -28, -0.25, 4.3],
  [30, 0, -19, 0.82, 4.65],
  [24, 0, -9, -0.62, 4.15],
  [29, 0, 1, -0.12, 4.8],
  [25, 0, 11, 0.48, 4.3],
  [31, 0, 21, -0.72, 4.85],
  [26, 0, 31, 0.2, 4.4],
] as const satisfies readonly (readonly [
  x: number,
  y: number,
  z: number,
  rotacaoY: number,
  escala: number,
])[]
