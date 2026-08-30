import type { MapaRegiao } from './types'

const MEIA_LARGURA_MUNDO = 24
const MEIA_PROFUNDIDADE_MUNDO = 21

/**
 * Vale Central: área curta de orientação que conecta as regiões jogáveis.
 * O Hub usa uma cena 3D completa como ambiente visual e colisão estática.
 * Portais continuam dados próprios do jogo e independentes da malha pesada.
 */
export const mapaHub: MapaRegiao = {
  spawn: [0, 3, 10],
  limites: {
    meiaLargura: MEIA_LARGURA_MUNDO,
    meiaProfundidade: MEIA_PROFUNDIDADE_MUNDO,
  },
  props: [],
  coletaveis: [],
  cenario3D: {
    arquivo: '/models/3donimus/nature/nature.glb',
    posicao: [0, 1, 3],
    escala: 10,
    colisor: 'trimesh',
  },
  chaoColisor: false,
  chaoVisivel: false,
  artes2D: [
    {
      id: 'arte-hub-portal-criacao',
      arquivo: '/art/creation/light/light-portal.svg',
      posicao: [-7, 1.65, 0],
      escala: [2.8, 2.8],
      opacidade: 0.92,
    },
  ],
}

export default mapaHub
