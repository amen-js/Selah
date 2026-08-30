import type { GatilhoSelah } from '../types/selah'

export type Ponto3D = readonly [number, number, number]
export type Escala3D = number | Ponto3D

export type FormaFallback = 'caixa' | 'cone' | 'cilindro' | 'esfera'
export type ColliderMapa = 'cuboid' | 'hull' | 'trimesh' | false

export interface PropMapa {
  id: string
  modelo?: string
  posicao: Ponto3D
  rotacao?: number
  escala?: Escala3D
  collider?: ColliderMapa
  fallback: {
    forma: FormaFallback
    cor: string
  }
}

export interface ColetavelMapa extends GatilhoSelah {
  id: string
  posicao: Ponto3D
  raioAtivacao?: number
  cor?: string
}

export interface MapaRegiao {
  spawn: Ponto3D
  limites: {
    meiaLargura: number
    meiaProfundidade: number
  }
  props: readonly PropMapa[]
  coletaveis: readonly ColetavelMapa[]
}
