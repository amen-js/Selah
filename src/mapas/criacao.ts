import type { MapaRegiao } from './types'

const MEIA_LARGURA_MUNDO = 16
const MEIA_PROFUNDIDADE_MUNDO = 16

/**
 * Mapa inicial da região da criação, sem dependência de modelos externos.
 *
 * Os props mantêm corredores livres entre os pontos de interesse para que a
 * exploração continue navegável mesmo quando os fallbacks forem renderizados.
 */
export const mapaCriacao: MapaRegiao = {
  spawn: [4, 2, 12],
  limites: {
    meiaLargura: MEIA_LARGURA_MUNDO,
    meiaProfundidade: MEIA_PROFUNDIDADE_MUNDO,
  },
  props: [
    {
      id: 'prop-pedra-luz',
      posicao: [-7, 0, -6],
      escala: [1.4, 0.8, 1.4],
      collider: 'hull',
      fallback: { forma: 'esfera', cor: '#d9c7a3' },
    },
    {
      id: 'prop-arvore-vida',
      posicao: [7, 0, -7],
      escala: [1.2, 2.8, 1.2],
      collider: 'hull',
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-lago-sereno',
      posicao: [8, 0, 4],
      escala: [3.2, 0.12, 2.2],
      collider: false,
      fallback: { forma: 'cilindro', cor: '#65a9c7' },
    },
    {
      id: 'prop-colina-verde',
      posicao: [-8, 0, 5],
      escala: [3, 1.8, 2.6],
      collider: 'hull',
      fallback: { forma: 'esfera', cor: '#73a65b' },
    },
    {
      id: 'prop-arco-do-jardim',
      posicao: [0, 0, -12],
      escala: [2.8, 2.6, 0.7],
      collider: 'cuboid',
      fallback: { forma: 'caixa', cor: '#c28b52' },
    },
    {
      id: 'prop-campo-aberto',
      posicao: [0, 0, 7],
      escala: [3.8, 0.18, 2.4],
      collider: false,
      fallback: { forma: 'caixa', cor: '#a3c96b' },
    },
  ],
  artes2D: [
    {
      id: 'arte-criacao-caminho-luz',
      arquivo: '/art/creation/light/light-path-unlocked.svg',
      posicao: [5.5, 0.015, 7],
      escala: [10, 3.2],
      modo: 'chao',
      rotacao: -0.2,
      opacidade: 0.78,
    },
    {
      id: 'arte-criacao-primeiro-brilho',
      arquivo: '/art/creation/light/first-glow.svg',
      posicao: [7.5, 3.8, -13.8],
      escala: [12, 5.2],
      opacidade: 0.72,
    },
    {
      id: 'arte-criacao-nucleo-luz',
      arquivo: '/art/creation/light/divine-light-core.svg',
      posicao: [10, 2.15, -10.35],
      escala: [3.8, 3.8],
      opacidade: 0.86,
    },
    {
      id: 'arte-criacao-rochas-iluminadas',
      arquivo: '/art/creation/light/illuminated-rocks.svg',
      posicao: [-7, 1.15, -6.4],
      escala: [5.4, 2.3],
      opacidade: 0.9,
    },
    {
      id: 'arte-criacao-particulas-luz',
      arquivo: '/art/creation/light/light-particles.svg',
      posicao: [9.2, 3.1, -9.8],
      escala: [5, 3.9],
      opacidade: 0.62,
    },
  ],
  // IDs públicos aprovados pelo proxy; a referência USFM permanece no backend.
  coletaveis: [
    {
      id: 'coletavel-primeiro-dia',
      historiaId: 'criacao',
      passagemId: 'genesis-1-1',
      posicao: [-11, 1, -11],
      raioAtivacao: 1.5,
      cor: '#f5d76e',
    },
    {
      id: 'coletavel-luz',
      historiaId: 'criacao',
      passagemId: 'genesis-1-3',
      posicao: [10, 1, -10],
      raioAtivacao: 1.5,
      cor: '#ffe9a6',
    },
    {
      id: 'coletavel-vegetacao',
      historiaId: 'criacao',
      passagemId: 'genesis-1-11',
      posicao: [-11, 1, 9],
      raioAtivacao: 1.5,
      cor: '#8dc76b',
    },
    {
      id: 'coletavel-animais',
      historiaId: 'criacao',
      passagemId: 'genesis-1-24',
      posicao: [11, 1, 8],
      raioAtivacao: 1.5,
      cor: '#83c9d8',
    },
    {
      id: 'coletavel-humanidade',
      historiaId: 'criacao',
      passagemId: 'genesis-1-27',
      posicao: [0, 1, 0],
      raioAtivacao: 1.5,
      cor: '#d8a36e',
    },
  ],
}

export default mapaCriacao
