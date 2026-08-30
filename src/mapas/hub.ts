import type { MapaRegiao } from './types'

const MEIA_LARGURA_MUNDO = 16
const MEIA_PROFUNDIDADE_MUNDO = 16

/**
 * Vale Central: área curta de orientação que conecta as regiões jogáveis.
 * Todos os elementos usam fallbacks geométricos para não depender de assets.
 */
export const mapaHub: MapaRegiao = {
  spawn: [0, 2, 10],
  limites: {
    meiaLargura: MEIA_LARGURA_MUNDO,
    meiaProfundidade: MEIA_PROFUNDIDADE_MUNDO,
  },
  props: [
    {
      id: 'prop-hub-pedra-central',
      posicao: [0, 0, 3],
      escala: [2.4, 0.8, 1.4],
      collider: 'hull',
      fallback: { forma: 'esfera', cor: '#d9c7a3' },
    },
    {
      id: 'prop-hub-marco-oeste',
      posicao: [-8, 0, -8],
      escala: [1.8, 2.4, 0.7],
      collider: 'cuboid',
      fallback: { forma: 'caixa', cor: '#b9824c' },
    },
    {
      id: 'prop-hub-arvore-leste',
      posicao: [8, 0, -8],
      escala: [1.4, 2.8, 1.4],
      collider: 'hull',
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-hub-caminho',
      posicao: [0, -0.1, 8],
      escala: [5.5, 0.12, 2.4],
      collider: false,
      fallback: { forma: 'cilindro', cor: '#c8b07e' },
    },
  ],
  coletaveis: [],
}

export default mapaHub
