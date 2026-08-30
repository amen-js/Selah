import type { MapaRegiao } from './types'

const MEIA_LARGURA_MUNDO = 48
const MEIA_PROFUNDIDADE_MUNDO = 48

/**
 * Vale navegável de Noé. A arca, a rampa e as tarefas de madeira pertencem ao
 * slice dedicado `noe/world`; mantê-las fora dos props genéricos evita corpos
 * sólidos duplicados e placeholders que bloqueiam a entrada da arca.
 */
export const mapaNoe: MapaRegiao = {
  spawn: [0, 1.2, 32],
  limites: {
    meiaLargura: MEIA_LARGURA_MUNDO,
    meiaProfundidade: MEIA_PROFUNDIDADE_MUNDO,
  },
  props: [
    {
      id: 'prop-noe-agua',
      posicao: [0, -0.1, -42],
      escala: [28, 0.12, 3.5],
      collider: false,
      fallback: { forma: 'cilindro', cor: '#5ea5c4' },
    },
    {
      id: 'prop-noe-cercado',
      posicao: [24, 0, 18],
      escala: [5, 0.7, 3],
      collider: false,
      fallback: { forma: 'caixa', cor: '#9a7047' },
    },
    {
      id: 'prop-noe-animal-claro',
      posicao: [22, 0.5, 20],
      escala: 0.8,
      collider: false,
      fallback: { forma: 'esfera', cor: '#d7c5a2' },
    },
    {
      id: 'prop-noe-animal-escuro',
      posicao: [26, 0.5, 20],
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
      posicao: [8, 1, 1],
      raioAtivacao: 1.5,
      cor: '#d99a58',
    },
    {
      id: 'coletavel-noe-animais',
      historiaId: 'noe',
      passagemId: 'genesis-6-19',
      posicao: [0, 4.72, -20],
      raioAtivacao: 1.5,
      cor: '#e0c78d',
    },
    {
      id: 'coletavel-noe-entrada',
      historiaId: 'noe',
      passagemId: 'genesis-7-1',
      posicao: [0, 1, -6],
      raioAtivacao: 1.5,
      cor: '#f4d77f',
    },
    {
      id: 'coletavel-noe-aguas',
      historiaId: 'noe',
      passagemId: 'genesis-8-1',
      posicao: [0, 2.62, -18.5],
      raioAtivacao: 1.5,
      cor: '#80c8dc',
    },
    {
      id: 'coletavel-noe-alianca',
      historiaId: 'noe',
      passagemId: 'genesis-9-13',
      posicao: [22, 1, -36],
      raioAtivacao: 1.5,
      cor: '#e59c75',
    },
  ],
}

export default mapaNoe
