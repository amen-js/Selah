import type { Ponto3D } from '../../../../../mapas/types'
import type { AssetCriacaoId } from '../../progression/catalogo'
import type { MomentoCriacaoId } from '../../progression/types'
import type { AnimacaoPersonagemCriacao } from '../ModeloPersonagemCriacao'

export type EscalaBiomaCriacao = number | Ponto3D

/**
 * Declarative world prop consumed by the Creation asset renderer. It mirrors
 * the renderer contract without making a biome depend on scene mounting.
 */
export interface InstanciaBiomaCriacao {
  id: string
  assetId: AssetCriacaoId
  momentoMinimo: MomentoCriacaoId
  posicao: Ponto3D
  rotacao?: number
  escala: EscalaBiomaCriacao
  animacao?: AnimacaoPersonagemCriacao
  colisor?: {
    meiaExtensao: Ponto3D
    deslocamento?: Ponto3D
  }
}

/** A spatial focal point; it does not by itself create a gameplay trigger. */
export interface MarcoBiomaCriacao {
  id: string
  nome: string
  posicao: Ponto3D
  raioLeitura: number
}

export interface ComposicaoBiomaCriacao {
  id: 'campo' | 'vale-das-aguas' | 'bosque-da-vida' | 'eden'
  nome: string
  descricao: string
  marcos: readonly MarcoBiomaCriacao[]
  instancias: readonly InstanciaBiomaCriacao[]
}
