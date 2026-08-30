import type { RefObject } from 'react'
import type { Ponto3D } from '../../../../mapas/types'
import type { PosicaoJogador } from '../../creation/proximidade'
import type {
  AcaoNoeId,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from '../progression/types'
import type { AssetNoeId } from './assets'

export type EstadoCandidatoTarefaNoe =
  'disponivel' | 'bloqueada' | 'concluida' | 'fora-do-momento'

/**
 * Candidate published to the region-level interaction arbiter. This module
 * never consumes keyboard input or mutates progression by itself.
 */
export interface CandidatoTarefaNoe {
  id: string
  acaoId: AcaoNoeId
  unidadeId: string
  posicao: Ponto3D
  raio: number
  prioridade: number
  estado: EstadoCandidatoTarefaNoe
}

export type EtapaTarefaCanteiroNoe = 'chamado' | 'madeira' | 'rampa' | 'vedacao'

export interface DescritorTarefaCanteiroNoe extends CandidatoTarefaNoe {
  momentoId: Extract<MomentoNoeId, 'chamado-canteiro' | 'coleta-vedacao'>
  etapa: EtapaTarefaCanteiroNoe
  ordem: number
  assetId?: AssetNoeId
  prerequisitos: readonly string[]
}

export type ChunkCanteiroNoeId = 'canteiro-m1' | 'canteiro-m2'

export interface InstanciaAssetCanteiroNoe {
  id: string
  chunkId: ChunkCanteiroNoeId
  assetId: AssetNoeId
  posicao: Ponto3D
  rotacao?: Ponto3D
  escala?: number
  /** A collected task unit is removed without affecting ambient instances. */
  unidadeId?: string
}

export interface CanteiroNoeProps {
  momentoAtualId: MomentoNoeId
  progressoMomentoAtual: readonly ProgressoAcaoNoe[]
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  onCandidatoChange?: (candidato: CandidatoTarefaNoe | null) => void
}
