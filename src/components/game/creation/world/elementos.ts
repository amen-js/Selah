import type { Ponto3D } from '../../../../mapas/types'
import type { AssetCriacaoId } from '../progression/catalogo'
import { indiceMomentoCriacao } from '../progression/estado'
import type { MomentoCriacaoId } from '../progression/types'
import type { AnimacaoPersonagemCriacao } from './ModeloPersonagemCriacao'
import { obterAlturaTerrenoCriacao } from './terreno'

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

function noTerreno(x: number, z: number, deslocamentoY = 0): Ponto3D {
  return [x, obterAlturaTerrenoCriacao(x, z) + deslocamentoY, z]
}

export const instanciasAssetsCriacao: readonly InstanciaAssetCriacao[] = [
  {
    id: 'montanha-oeste',
    assetId: 'montanhas',
    momentoMinimo: 'ceu-terra-aguas',
    posicao: noTerreno(-22, -7, -0.2),
    rotacao: 0.35,
    escala: [10, 7, 8],
  },
  {
    id: 'montanha-norte',
    assetId: 'montanhas',
    momentoMinimo: 'ceu-terra-aguas',
    posicao: noTerreno(-8, -21, -0.2),
    rotacao: -0.25,
    escala: [12, 8, 9],
  },
  {
    id: 'montanha-leste',
    assetId: 'montanhas',
    momentoMinimo: 'ceu-terra-aguas',
    posicao: noTerreno(22, -8, -0.2),
    rotacao: -0.45,
    escala: [9, 6, 7],
  },
  ...[
    [-19, 15, 0.15, 4.6],
    [-18, 1, -0.35, 4.2],
    [-15, -11, 0.55, 4.7],
    [-7, 12, -0.15, 3.9],
    [7, 15, 0.7, 4.2],
    [18, 16, -0.55, 4.6],
    [19, 0, 0.25, 4.4],
    [17, -15, -0.65, 4.1],
  ].map(([x, z, rotacao, escala], indice) => ({
    id: `arvore-borda-${indice + 1}`,
    assetId: 'arvores' as const,
    momentoMinimo: 'natureza' as const,
    posicao: noTerreno(x, z),
    rotacao,
    escala,
  })),
  ...[
    [-14, 8],
    [-11, 11],
    [-9, 7],
    [10, 9],
    [16, 6],
    [12, 13],
  ].map(([x, z], indice) => ({
    id: `arbusto-${indice + 1}`,
    assetId: 'arbustos' as const,
    momentoMinimo: 'natureza' as const,
    posicao: noTerreno(x, z),
    rotacao: indice * 0.7,
    escala: 2.3 + (indice % 2) * 0.45,
  })),
  ...[
    [-12, 10],
    [-10, 9],
    [-15, 6],
    [9, 7],
    [12, 8],
    [15, 11],
  ].map(([x, z], indice) => ({
    id: `flores-${indice + 1}`,
    assetId: 'flores' as const,
    momentoMinimo: 'natureza' as const,
    posicao: noTerreno(x, z),
    rotacao: indice * -0.4,
    escala: 3.2,
  })),
  ...[
    [-5, 13],
    [0, 12],
    [5, 14],
    [-9, 4],
    [8, 3],
    [15, 2],
  ].map(([x, z], indice) => ({
    id: `grama-${indice + 1}`,
    assetId: 'grama' as const,
    momentoMinimo: 'natureza' as const,
    posicao: noTerreno(x, z),
    rotacao: indice * 0.55,
    escala: 3.5,
  })),
  ...[
    [12, 6, -0.45],
    [17, 4, 0.7],
    [19, 11, 2.4],
  ].map(([x, z, rotacao], indice) => ({
    id: `ovelha-${indice + 1}`,
    assetId: 'ovelha' as const,
    momentoMinimo: 'criaturas' as const,
    posicao: noTerreno(x, z, 0.02),
    rotacao,
    escala: 0.62,
    animacao: 'ovelha-idle' as const,
  })),
  {
    id: 'plataforma-eden',
    assetId: 'jardim-eden',
    momentoMinimo: 'eden',
    posicao: noTerreno(0, -2, 0.02),
    escala: [9, 2, 9],
  },
  {
    id: 'arvore-central-eden',
    assetId: 'arvore-central',
    momentoMinimo: 'eden',
    posicao: noTerreno(0, -2, 0.08),
    escala: 5.4,
    colisor: {
      meiaExtensao: [0.75, 3.5, 0.75],
      deslocamento: [0, 3.5, 0],
    },
  },
  {
    id: 'adao-jardim',
    assetId: 'adao',
    momentoMinimo: 'adao-e-eva',
    posicao: noTerreno(-2.1, -5, 0.02),
    rotacao: 0.18,
    escala: 1,
    animacao: 'humano-idle',
  },
  {
    id: 'eva-jardim',
    assetId: 'eva',
    momentoMinimo: 'adao-e-eva',
    posicao: noTerreno(2.1, -5, 0.02),
    rotacao: -0.18,
    escala: 1,
    animacao: 'humano-idle',
  },
  {
    id: 'arvore-grande-escolha',
    assetId: 'arvore-conhecimento',
    momentoMinimo: 'fruto-escolha',
    posicao: noTerreno(12, -12, 0.04),
    rotacao: 0.4,
    escala: 6.2,
    colisor: {
      meiaExtensao: [0.8, 3.8, 0.8],
      deslocamento: [0, 3.8, 0],
    },
  },
]

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
