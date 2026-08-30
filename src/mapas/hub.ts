import type { MapaRegiao } from './types'
import { modelosNatureza } from './assets'

const MEIA_LARGURA_MUNDO = 16
const MEIA_PROFUNDIDADE_MUNDO = 16

/**
 * Vale Central: área curta de orientação que conecta as regiões jogáveis.
 * A geometria continua independente de assets; a sinalização 2.5D apenas
 * antecipa a linguagem visual da primeira jornada disponível.
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
      ...modelosNatureza.pedra2,
      posicao: [0, 0, 3],
      escala: [2.4, 0.8, 1.4],
      colisor: {
        forma: 'cuboid',
        meiaExtensao: [0.9, 0.45, 0.7],
        deslocamento: [0, 0.45, 0],
      },
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
      ...modelosNatureza.arvore4,
      posicao: [8, 0, -8],
      escala: 0.58,
      colisor: {
        forma: 'cuboid',
        meiaExtensao: [0.3, 1.45, 0.3],
        deslocamento: [0, 1.45, 0],
      },
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-hub-caminho',
      posicao: [0, -0.1, 8],
      escala: [5.5, 0.12, 2.4],
      collider: false,
      fallback: { forma: 'cilindro', cor: '#c8b07e' },
    },
    {
      id: 'prop-hub-arvore-sudoeste',
      ...modelosNatureza.arvore1,
      posicao: [-13, 0, 12],
      rotacao: 0.45,
      escala: 0.42,
      collider: false,
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-hub-arvore-sudeste',
      ...modelosNatureza.arvore3,
      posicao: [13, 0, 12],
      rotacao: -0.35,
      escala: 0.46,
      collider: false,
      fallback: { forma: 'cone', cor: '#5c985d' },
    },
    {
      id: 'prop-hub-arvore-noroeste',
      ...modelosNatureza.arvore2,
      posicao: [-13, 0, -13],
      rotacao: -0.6,
      escala: 0.48,
      collider: false,
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-hub-arvore-nordeste',
      ...modelosNatureza.arvore5,
      posicao: [13, 0, -13],
      rotacao: 0.75,
      escala: 0.6,
      collider: false,
      fallback: { forma: 'cone', cor: '#5c985d' },
    },
    {
      id: 'prop-hub-pedra-oeste',
      ...modelosNatureza.pedra1,
      posicao: [-11.5, 0, 5],
      rotacao: 0.4,
      escala: 1.25,
      collider: false,
      fallback: { forma: 'esfera', cor: '#c8b58e' },
    },
    {
      id: 'prop-hub-pedra-leste',
      ...modelosNatureza.pedra3,
      posicao: [11.5, 0, 4],
      rotacao: -0.25,
      escala: 1.2,
      collider: false,
      fallback: { forma: 'esfera', cor: '#c8b58e' },
    },
  ],
  coletaveis: [],
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
