import type { MapaRegiao } from './types'

const MEIA_LARGURA_MUNDO = 16
const MEIA_PROFUNDIDADE_MUNDO = 16

/**
 * Recorte único de Noé antes da chuva, sem dependência de modelos externos.
 *
 * Os fallbacks geométricos comunicam a arca, a água, a madeira e os animais
 * até que o Designer possa substituir os elementos por assets aprovados.
 */
export const mapaNoe: MapaRegiao = {
  spawn: [0, 2, 12],
  limites: {
    meiaLargura: MEIA_LARGURA_MUNDO,
    meiaProfundidade: MEIA_PROFUNDIDADE_MUNDO,
  },
  props: [
    {
      id: 'prop-noe-arca',
      posicao: [0, 0, -7],
      escala: [4.8, 1.6, 2.2],
      collider: 'cuboid',
      fallback: { forma: 'caixa', cor: '#8f603d' },
    },
    {
      id: 'prop-noe-rampa',
      posicao: [0, 0.3, -4.3],
      escala: [2.2, 0.55, 1.1],
      collider: 'cuboid',
      fallback: { forma: 'caixa', cor: '#b9824c' },
    },
    {
      id: 'prop-noe-agua',
      posicao: [0, -0.1, -13],
      escala: [8.5, 0.12, 2.6],
      collider: false,
      fallback: { forma: 'cilindro', cor: '#5ea5c4' },
    },
    {
      id: 'prop-noe-madeira-leste',
      posicao: [-10, 0, 7],
      escala: [1.8, 0.7, 0.8],
      collider: 'cuboid',
      fallback: { forma: 'caixa', cor: '#a87545' },
    },
    {
      id: 'prop-noe-madeira-oeste',
      posicao: [-7, 0, 9],
      escala: [1.3, 0.55, 0.65],
      collider: 'cuboid',
      fallback: { forma: 'caixa', cor: '#c08a50' },
    },
    {
      id: 'prop-noe-cercado',
      posicao: [9, 0, 6],
      escala: [3, 0.7, 2],
      collider: false,
      fallback: { forma: 'caixa', cor: '#9a7047' },
    },
    {
      id: 'prop-noe-animal-claro',
      posicao: [8, 0.5, 9],
      escala: 0.8,
      collider: false,
      fallback: { forma: 'esfera', cor: '#d7c5a2' },
    },
    {
      id: 'prop-noe-animal-escuro',
      posicao: [11, 0.5, 9],
      escala: 0.8,
      collider: false,
      fallback: { forma: 'esfera', cor: '#665343' },
    },
  ],
  // IDs públicos aprovados pelo proxy; a referência USFM permanece no backend.
  coletaveis: [
    {
      id: 'coletavel-noe-construcao',
      historiaId: 'noe',
      passagemId: 'genesis-6-14',
      posicao: [-10, 1, 8],
      raioAtivacao: 1.5,
      cor: '#d99a58',
    },
    {
      id: 'coletavel-noe-animais',
      historiaId: 'noe',
      passagemId: 'genesis-6-19',
      posicao: [10, 1, 7],
      raioAtivacao: 1.5,
      cor: '#e0c78d',
    },
    {
      id: 'coletavel-noe-entrada',
      historiaId: 'noe',
      passagemId: 'genesis-7-1',
      posicao: [0, 1, -4],
      raioAtivacao: 1.5,
      cor: '#f4d77f',
    },
    {
      id: 'coletavel-noe-aguas',
      historiaId: 'noe',
      passagemId: 'genesis-8-1',
      posicao: [-10, 1, -12],
      raioAtivacao: 1.5,
      cor: '#80c8dc',
    },
    {
      id: 'coletavel-noe-alianca',
      historiaId: 'noe',
      passagemId: 'genesis-9-13',
      posicao: [10, 1, -12],
      raioAtivacao: 1.5,
      cor: '#e59c75',
    },
  ],
}

export default mapaNoe
