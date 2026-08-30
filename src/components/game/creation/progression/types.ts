import type { Ponto3D } from '../../../../mapas/types'

export type MomentoCriacaoId =
  | 'vazio'
  | 'luz'
  | 'ceu-terra-aguas'
  | 'natureza'
  | 'ceu-ritmo'
  | 'criaturas'
  | 'eden'
  | 'adao-e-eva'
  | 'fruto-escolha'

export type FaseCenarioCriacao =
  | 'escuro'
  | 'amanhecer'
  | 'mundo-formado'
  | 'mundo-verde'
  | 'ciclo-celeste'
  | 'mundo-vivo'
  | 'jardim'
  | 'humanidade'
  | 'escolha'

export type GatilhoConclusaoMomentoCriacao =
  | { tipo: 'distancia-percorrida'; distanciaMinima: number }
  | { tipo: 'zona-narrativa'; zonaId: string; posicao: Ponto3D; raio: number }
  | { tipo: 'selah-concluido'; passagemId: string }

export interface MomentoCriacao {
  id: MomentoCriacaoId
  ordem: number
  titulo: string
  falaInicial: string
  falaApoio: string
  falaConclusao?: string
  faseCenario: FaseCenarioCriacao
  gatilhoConclusao: GatilhoConclusaoMomentoCriacao
  assets: readonly string[]
}

export type EventoProgressaoCriacao =
  | { tipo: 'distancia-percorrida'; distancia: number }
  | { tipo: 'zona-narrativa'; zonaId: string }
  | { tipo: 'selah-concluido'; passagemId: string }

export interface EstadoProgressaoCriacao {
  momentoAtualId: MomentoCriacaoId
  momentosConcluidos: readonly MomentoCriacaoId[]
  concluida: boolean
}
