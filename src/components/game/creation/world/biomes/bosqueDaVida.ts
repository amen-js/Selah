import { noTerrenoBioma } from './posicao'
import type { ComposicaoBiomaCriacao } from './types'

/** A dense west-side canopy with two intentional, discoverable clearings. */
export function criarComposicaoBosqueDaVida(): ComposicaoBiomaCriacao {
  return {
    id: 'bosque-da-vida',
    nome: 'Bosque da Vida',
    descricao:
      'Um bosque alto no lado oeste, com caminhos de flores que unem uma clareira secreta a um mirante tranquilo.',
    marcos: [
      {
        id: 'bosque-clareira-secreta',
        nome: 'Clareira Secreta',
        posicao: noTerrenoBioma(-10, 14),
        raioLeitura: 3.8,
      },
      {
        id: 'bosque-mirante-do-vento',
        nome: 'Mirante do Vento',
        posicao: noTerrenoBioma(-18, 16),
        raioLeitura: 3.6,
      },
    ],
    instancias: [
      ...[
        [-22, 19, 0.25, 4.8],
        [-18, 20, -0.45, 5.1],
        [-14, 19, 0.55, 4.4],
        [-7, 19, -0.2, 4.7],
        [-5, 14, 0.65, 4.2],
        [-7, 9, -0.35, 4.8],
        [-12, 8, 0.4, 4.5],
        [-18, 10, -0.65, 5],
        [-22, 12, 0.2, 4.6],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `bosque-arvore-canopia-${indice + 1}`,
        assetId: 'arvores' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala,
      })),
      ...[
        [-20, 16, 0.1],
        [-16, 12, 0.6],
        [-13, 11, -0.3],
        [-8, 12, 0.8],
        [-9, 17, -0.55],
        [-15, 18, 0.35],
      ].map(([x, z, rotacao], indice) => ({
        id: `bosque-arbusto-caminho-${indice + 1}`,
        assetId: 'arbustos' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala: 2.4,
      })),
      ...[
        [-18, 14],
        [-16, 14],
        [-14, 14],
        [-12, 15],
        [-9, 15],
        [-8, 10],
        [-11, 9],
      ].map(([x, z], indice) => ({
        id: `bosque-flores-trilha-${indice + 1}`,
        assetId: 'flores' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao: -0.3 + indice * 0.38,
        escala: 2.8,
      })),
      ...[
        [-21, 17],
        [-19, 11],
        [-15, 9],
        [-6, 17],
      ].map(([x, z], indice) => ({
        id: `bosque-grama-sombra-${indice + 1}`,
        assetId: 'grama' as const,
        momentoMinimo: 'natureza' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao: indice * 0.58,
        escala: 3.35,
      })),
    ],
  }
}

export const composicaoBosqueDaVida = criarComposicaoBosqueDaVida()
