import type { Ponto3D } from '../../../mapas/types'
import type { Regiao } from '../../../types/selah'

/** Dados estáticos de um portal pertencente a uma região do mapa. */
export type PortalMapa = Readonly<{
  id: string
  destino: Regiao
  posicao: Ponto3D
  raioAtivacao: number
  /** Portais indisponíveis podem continuar visíveis como conteúdo futuro. */
  disponivel?: boolean
  /** Cor opcional do brilho do portal, sem carregar texto de apresentação. */
  cor?: string
  /** Menor valor vence empates de distância; a ordem do array não é usada. */
  prioridade?: number
}>

/** Posição aceita pelos helpers de portal, sem depender do controller 3D. */
export type PosicaoXZ =
  | Readonly<{ x: number; z: number }>
  | readonly [number, number, number]
