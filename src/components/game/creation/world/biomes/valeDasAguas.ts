import { noTerrenoBioma } from './posicao'
import type { ComposicaoBiomaCriacao } from './types'

/**
 * Water follows a north-west to south-west descent. Rock silhouettes make the
 * spring legible from the route and vegetation becomes denser at its banks.
 */
export function criarComposicaoValeDasAguas(): ComposicaoBiomaCriacao {
  return {
    id: 'vale-das-aguas',
    nome: 'Vale das Águas',
    descricao:
      'Uma nascente entre rochas altas que desce para margens verdes e um pequeno lago de contemplação.',
    marcos: [
      {
        id: 'vale-nascente-dos-rios',
        nome: 'Nascente dos Rios',
        posicao: noTerrenoBioma(-14, 5),
        raioLeitura: 4.5,
      },
      {
        id: 'vale-lago-das-margens',
        nome: 'Lago das Margens',
        posicao: noTerrenoBioma(-16, -5),
        raioLeitura: 4,
      },
    ],
    instancias: [
      ...[
        [-20, 9, 0.35, [6.8, 5.6, 5.2]],
        [-14, 10, -0.25, [8.4, 6.8, 5.8]],
        [-8, 7, -0.7, [5.6, 4.8, 4.5]],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `vale-rocha-nascente-${indice + 1}`,
        assetId: 'montanhas' as const,
        momentoMinimo: 'ceu-terra-aguas' as const,
        posicao: noTerrenoBioma(x as number, z as number, -0.18),
        rotacao: rotacao as number,
        escala: escala as [number, number, number],
      })),
      ...[
        [-14, 5, 0, [3.4, 1, 5.4]],
        [-15, -1, 0.08, [3, 1, 5.7]],
        [-16, -7, -0.06, [3.2, 1, 5]],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `vale-canal-rio-${indice + 1}`,
        assetId: 'rios' as const,
        momentoMinimo: 'ceu-terra-aguas' as const,
        posicao: noTerrenoBioma(x as number, z as number, 0.025),
        rotacao: rotacao as number,
        escala: escala as [number, number, number],
      })),
      ...[
        [-22, 2, 0.55, 4.2],
        [-20, -7, -0.2, 4.6],
        [-10, -8, 0.35, 4.1],
        [-8, 0, -0.45, 3.8],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `vale-arvore-margem-${indice + 1}`,
        assetId: 'arvores' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala,
      })),
      ...[
        [-19, 2],
        [-18, -2],
        [-13, -4],
        [-12, -9],
        [-9, 3],
      ].map(([x, z], indice) => ({
        id: `vale-grama-margem-${indice + 1}`,
        assetId: 'grama' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao: 0.25 + indice * 0.46,
        escala: 3.25,
      })),
      ...[
        [-21, -2, 0.2],
        [-18, 6, -0.35],
        [-11, -4, 0.7],
      ].map(([x, z, rotacao], indice) => ({
        id: `vale-arbusto-margem-${indice + 1}`,
        assetId: 'arbustos' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala: 2.2,
      })),
    ],
  }
}

export const composicaoValeDasAguas = criarComposicaoValeDasAguas()
