import type { Ponto3D } from '../../../../mapas/types'
import type { AssetCriacaoId } from '../progression/catalogo'
import { indiceMomentoCriacao } from '../progression/estado'
import type { MomentoCriacaoId } from '../progression/types'
import type { AnimacaoPersonagemCriacao } from './ModeloPersonagemCriacao'
import { obterInstanciasBiomasCriacao } from './biomes'

export type EscalaInstancia = number | Ponto3D

export interface InstanciaAssetCriacao {
  id: string
  assetId: AssetCriacaoId
  momentoMinimo: MomentoCriacaoId
  posicao: Ponto3D
  rotacao?: number
  escala: EscalaInstancia
  animacao?: AnimacaoPersonagemCriacao
  colisor?: {
    meiaExtensao: Ponto3D
    deslocamento?: Ponto3D
  }
}

export const instanciasAssetsCriacao: readonly InstanciaAssetCriacao[] =
  obterInstanciasBiomasCriacao()

export function obterInstanciasAssetsCriacaoVisiveis(
  momentoId: MomentoCriacaoId,
): readonly InstanciaAssetCriacao[] {
  const indiceAtual = indiceMomentoCriacao(momentoId)
  return instanciasAssetsCriacao.filter(
    ({ momentoMinimo }) =>
      indiceMomentoCriacao(momentoMinimo) <= indiceAtual,
  )
}

export function proximoMomentoId(
  momentoId: MomentoCriacaoId,
): MomentoCriacaoId | null {
  const ordem: MomentoCriacaoId[] = [
    'vazio',
    'luz',
    'ceu-terra-aguas',
    'natureza',
    'ceu-ritmo',
    'criaturas',
    'eden',
    'adao-e-eva',
    'fruto-escolha',
  ]
  return ordem[indiceMomentoCriacao(momentoId) + 1] ?? null
}
