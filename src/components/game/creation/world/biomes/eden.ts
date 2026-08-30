import { noTerrenoBioma } from './posicao'
import type { ComposicaoBiomaCriacao } from './types'

/**
 * Eden is a nested garden: four river arms point toward the central tree,
 * while the knowledge tree remains distinctly separate at the southern edge.
 */
export function criarComposicaoEden(): ComposicaoBiomaCriacao {
  return {
    id: 'eden',
    nome: 'Jardim do Éden',
    descricao:
      'Um jardim circular banhado por quatro braços de rio, com a Árvore da Vida no coração e a árvore da escolha à distância.',
    marcos: [
      {
        id: 'eden-coracao-da-vida',
        nome: 'Coração do Éden',
        posicao: noTerrenoBioma(0, -2),
        raioLeitura: 4.5,
      },
      {
        id: 'eden-arvore-do-conhecimento',
        nome: 'Árvore do Conhecimento',
        posicao: noTerrenoBioma(12, -12),
        raioLeitura: 3.8,
      },
    ],
    instancias: [
      {
        id: 'eden-plataforma-do-jardim',
        assetId: 'jardim-eden',
        momentoMinimo: 'eden',
        posicao: noTerrenoBioma(0, -2, 0.02),
        escala: [10.5, 2, 10.5],
      },
      ...[
        [0, 5, 0, [2.35, 1, 5]],
        [5, -2, Math.PI / 2, [2.35, 1, 5]],
        [0, -9, 0, [2.35, 1, 5]],
        [-5, -2, Math.PI / 2, [2.35, 1, 5]],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `eden-rio-radial-${indice + 1}`,
        assetId: 'rios-eden' as const,
        momentoMinimo: 'eden' as const,
        posicao: noTerrenoBioma(x as number, z as number, 0.035),
        rotacao: rotacao as number,
        escala: escala as [number, number, number],
      })),
      {
        id: 'eden-arvore-da-vida',
        assetId: 'arvore-central',
        momentoMinimo: 'eden',
        posicao: noTerrenoBioma(0, -2, 0.08),
        escala: 5.8,
        colisor: {
          meiaExtensao: [0.78, 3.7, 0.78],
          deslocamento: [0, 3.7, 0],
        },
      },
      ...[
        [-8, 3, -0.4, 4.5],
        [-7, -8, 0.3, 4.3],
        [7, 3, 0.55, 4.7],
        [8, -7, -0.35, 4.4],
      ].map(([x, z, rotacao, escala], indice) => ({
        id: `eden-arvore-perimetro-${indice + 1}`,
        assetId: 'arvores' as const,
        momentoMinimo: 'eden' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala,
      })),
      ...[
        [-4, 2, 0.3],
        [-3, -6, -0.2],
        [3, 2, 0.7],
        [4, -6, -0.55],
      ].map(([x, z, rotacao], indice) => ({
        id: `eden-arbusto-rio-${indice + 1}`,
        assetId: 'arbustos' as const,
        momentoMinimo: 'eden' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao,
        escala: 2.4,
      })),
      ...[
        [-2, 4],
        [-5, -4],
        [2, 4],
        [5, -4],
        [-3, -9],
        [3, -9],
      ].map(([x, z], indice) => ({
        id: `eden-flores-margem-${indice + 1}`,
        assetId: 'flores' as const,
        momentoMinimo: 'eden' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao: indice * 0.5,
        escala: 3.05,
      })),
      ...[
        [-6, 0],
        [-4, -8],
        [6, 0],
        [5, -8],
      ].map(([x, z], indice) => ({
        id: `eden-grama-margem-${indice + 1}`,
        assetId: 'grama' as const,
        momentoMinimo: 'eden' as const,
        posicao: noTerrenoBioma(x, z),
        rotacao: 0.2 + indice * 0.65,
        escala: 3.3,
      })),
      {
        id: 'eden-adao-jardim',
        assetId: 'adao',
        momentoMinimo: 'adao-e-eva',
        posicao: noTerrenoBioma(-2.2, -5, 0.02),
        rotacao: 0.18,
        escala: 0.82,
        animacao: 'adao-idle',
      },
      {
        id: 'eden-eva-jardim',
        assetId: 'eva',
        momentoMinimo: 'adao-e-eva',
        posicao: noTerrenoBioma(2.2, -5, 0.02),
        rotacao: -0.18,
        escala: 0.8,
        animacao: 'eva-idle',
      },
      {
        id: 'eden-arvore-da-escolha',
        assetId: 'arvore-conhecimento',
        momentoMinimo: 'fruto-escolha',
        posicao: noTerrenoBioma(12, -12, 0.04),
        rotacao: 0.4,
        escala: 6.4,
        colisor: {
          meiaExtensao: [0.82, 3.9, 0.82],
          deslocamento: [0, 3.9, 0],
        },
      },
    ],
  }
}

export const composicaoEden = criarComposicaoEden()
