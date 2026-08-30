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
  spawn: [0, 2, 12],
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
  // Referências OSIS provisórias; aguardam aprovação da P.O. Não há texto bíblico neste mapa.
  coletaveis: [
    {
      id: 'coletavel-primeiro-dia',
      historiaId: 'criacao',
      passagemId: 'GEN.1.1',
      posicao: [-11, 1, -11],
      raioAtivacao: 1.5,
      cor: '#f5d76e',
    },
    {
      id: 'coletavel-luz',
      historiaId: 'criacao',
      passagemId: 'GEN.1.3',
      posicao: [10, 1, -10],
      raioAtivacao: 1.5,
      cor: '#ffe9a6',
    },
    {
      id: 'coletavel-vegetacao',
      historiaId: 'criacao',
      passagemId: 'GEN.1.11',
      posicao: [-11, 1, 9],
      raioAtivacao: 1.5,
      cor: '#8dc76b',
    },
    {
      id: 'coletavel-animais',
      historiaId: 'criacao',
      passagemId: 'GEN.1.20',
      posicao: [11, 1, 8],
      raioAtivacao: 1.5,
      cor: '#83c9d8',
    },
    {
      id: 'coletavel-humanidade',
      historiaId: 'criacao',
      passagemId: 'GEN.1.27',
      posicao: [0, 1, 0],
      raioAtivacao: 1.5,
      cor: '#d8a36e',
    },
  ],
}

export default mapaCriacao
