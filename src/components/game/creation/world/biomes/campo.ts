import { noTerrenoBioma } from './posicao'
import type { ComposicaoBiomaCriacao } from './types'

/**
 * An open, readable pasture in the north-east. Trees frame the space instead
 * of filling it, leaving a long sight line for animal discoveries.
 */
export function criarComposicaoCampoCriacao(): ComposicaoBiomaCriacao {
  return {
    id: 'campo',
    nome: 'Campo da Criação',
    descricao:
      'Uma clareira ampla entre colinas, com um pomar baixo e espaço para observar as criaturas.',
    marcos: [
      {
        id: 'campo-clareira-das-criaturas',
        nome: 'Clareira das Criaturas',
        posicao: noTerrenoBioma(14, 9),
        raioLeitura: 6.5,
      },
      {
        id: 'campo-pomar-do-amanhecer',
        nome: 'Pomar do Amanhecer',
        posicao: noTerrenoBioma(18, 15),
        raioLeitura: 4,
      },
    ],
    instancias: [
      ...[
        [8, 16, -0.4, 4.2],
        [13, 18, 0.35, 4.9],
        [20, 17, -0.15, 4.4],
        [22, 10, 0.7, 4.6],
        [20, 2, -0.55, 4.1],
        [9, 2, 0.2, 3.8],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `campo-arvore-margem-${indice + 1}`,
        assetId: 'arvores' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala,
      })),
      ...[
        [10, 14, 0.5],
        [12, 12, 1.1],
        [18, 12, -0.2],
        [19, 7, 0.85],
      ].map(([x, z, rotacao], indice) => ({
        id: `campo-arbusto-pomar-${indice + 1}`,
        assetId: 'arbustos' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala: 2.35,
      })),
      ...[
        [9, 9, -0.2],
        [11, 7, 0.35],
        [13, 15, 0.8],
        [16, 17, -0.5],
        [19, 14, 0.45],
        [21, 5, 0.15],
      ].map(([x, z, rotacao], indice) => ({
        id: `campo-flores-${indice + 1}`,
        assetId: 'flores' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala: 2.7,
      })),
      ...[
        [10, 5],
        [13, 4],
        [15, 6],
        [17, 4],
        [17, 10],
        [21, 13],
      ].map(([x, z], indice) => ({
        id: `campo-grama-${indice + 1}`,
        assetId: 'grama' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao: indice * 0.42,
        escala: 3.1,
      })),
      ...[
        [13, 8, 0.25],
        [16, 9, -0.45],
        [15, 12, 2.6],
      ].map(([x, z, rotacao], indice) => ({
        id: `campo-ovelha-${indice + 1}`,
        assetId: 'ovelha' as const,
        momentoMinimo: 'criaturas' as const,
        posicao: noTerrenoBioma(x, z, 0.02),
        rotacao,
        escala: 0.62,
        animacao: 'ovelha-idle' as const,
      })),
    ],
  }
}

export const composicaoCampoCriacao = criarComposicaoCampoCriacao()
