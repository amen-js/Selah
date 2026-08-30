import type { Ponto3D } from '../../../mapas/types'

export interface FocoCameraSelah {
  id: string
  alvo: Ponto3D
  distancia: number
  elevacao: number
}

export type EstadoCameraSelah = 'exploracao' | 'aproximando' | 'focada' | 'retornando'
