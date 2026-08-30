import type { MapaRegiao } from './types'
import { modelosNatureza } from './assets'

const MEIA_LARGURA_MUNDO = 24
const MEIA_PROFUNDIDADE_MUNDO = 22

/**
 * Mapa inicial da região da criação, sem dependência de modelos externos.
 *
 * Os props mantêm corredores livres entre os pontos de interesse para que a
 * exploração continue navegável mesmo quando os fallbacks forem renderizados.
 */
export const mapaCriacao: MapaRegiao = {
  spawn: [0, 2, 19],
  limites: {
    meiaLargura: MEIA_LARGURA_MUNDO,
    meiaProfundidade: MEIA_PROFUNDIDADE_MUNDO,
  },
  props: [
    {
      id: 'prop-pedra-luz',
      ...modelosNatureza.pedra4,
      posicao: [9, 0, 13],
      escala: [1.5, 0.9, 1.5],
      colisor: {
        forma: 'cuboid',
        meiaExtensao: [0.72, 0.72, 0.72],
        deslocamento: [0, 0.72, 0],
      },
      fallback: { forma: 'esfera', cor: '#d9c7a3' },
    },
    {
      id: 'prop-campo-sul',
      ...modelosNatureza.gramaAlta,
      posicao: [0, 0, 11],
      escala: [3.2, 0.82, 3.2],
      collider: false,
      fallback: { forma: 'caixa', cor: '#a3c96b' },
    },
    {
      id: 'prop-criacao-arvore-noroeste',
      ...modelosNatureza.arvore2,
      posicao: [-20, 0.4, -16],
      rotacao: 0.5,
      escala: 0.44,
      collider: false,
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-criacao-arvore-nordeste',
      ...modelosNatureza.arvore3,
      posicao: [20, 0.4, -17],
      rotacao: -0.6,
      escala: 0.5,
      collider: false,
      fallback: { forma: 'cone', cor: '#5a965d' },
    },
    {
      id: 'prop-criacao-arvore-oeste',
      ...modelosNatureza.arvore4,
      posicao: [-21, 0.15, 2],
      rotacao: -0.35,
      escala: 0.5,
      collider: false,
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-criacao-arvore-leste',
      ...modelosNatureza.arvore5,
      posicao: [21, 0.05, 1],
      rotacao: 0.8,
      escala: 0.68,
      collider: false,
      fallback: { forma: 'cone', cor: '#5a965d' },
    },
    {
      id: 'prop-criacao-arvore-sudoeste',
      ...modelosNatureza.arvore3,
      posicao: [-20, 0, 18],
      rotacao: 0.2,
      escala: 0.46,
      collider: false,
      fallback: { forma: 'cone', cor: '#5a965d' },
    },
    {
      id: 'prop-criacao-arvore-sudeste',
      ...modelosNatureza.arvore2,
      posicao: [20, 0, 18],
      rotacao: -0.75,
      escala: 0.44,
      collider: false,
      fallback: { forma: 'cone', cor: '#4f8f5b' },
    },
    {
      id: 'prop-criacao-grama-vegetacao',
      ...modelosNatureza.gramaBaixa,
      posicao: [-13, 0.7, 8.5],
      rotacao: 0.3,
      escala: [6.5, 1.8, 6.5],
      collider: false,
      fallback: { forma: 'cone', cor: '#75a85f' },
    },
    {
      id: 'prop-criacao-flor-vegetacao-a',
      ...modelosNatureza.arbustoFlorido,
      posicao: [-10.5, 0.55, 11],
      rotacao: -0.4,
      escala: 1.15,
      collider: false,
      fallback: { forma: 'esfera', cor: '#8abf68' },
    },
    {
      id: 'prop-criacao-flor-vegetacao-b',
      ...modelosNatureza.folhagem,
      posicao: [-17, 0.6, 7],
      rotacao: 0.55,
      escala: 1.2,
      collider: false,
      fallback: { forma: 'esfera', cor: '#77a95f' },
    },
    {
      id: 'prop-criacao-pedra-lago',
      ...modelosNatureza.pedra5,
      posicao: [16.5, 0, 2.5],
      rotacao: 0.45,
      escala: 1.05,
      collider: false,
      fallback: { forma: 'esfera', cor: '#c8b58e' },
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
      posicao: [-18, 1, -15],
      raioAtivacao: 1.5,
      cor: '#f5d76e',
    },
    {
      id: 'coletavel-luz',
      historiaId: 'criacao',
      passagemId: 'genesis-1-3',
      posicao: [10, 1, 13],
      raioAtivacao: 1.5,
      cor: '#ffe9a6',
    },
    {
      id: 'coletavel-vegetacao',
      historiaId: 'criacao',
      passagemId: 'genesis-1-11',
      // Separado do mirante para a descoberta espacial não emendar no Selah.
      posicao: [-12, 1, 11],
      raioAtivacao: 1.5,
      cor: '#8dc76b',
    },
    {
      id: 'coletavel-animais',
      historiaId: 'criacao',
      passagemId: 'genesis-1-24',
      posicao: [15, 1, 9],
      raioAtivacao: 1.5,
      cor: '#83c9d8',
    },
    {
      id: 'coletavel-humanidade',
      historiaId: 'criacao',
      passagemId: 'genesis-1-27',
      // Fora do raio do coração do Éden para não abrir dois gatilhos em sequência.
      posicao: [5, 1, -2],
      raioAtivacao: 1.5,
      cor: '#d8a36e',
    },
  ],
}

export default mapaCriacao
