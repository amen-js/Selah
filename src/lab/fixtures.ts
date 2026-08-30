import type { SelahGateway } from '../services/selahGateway'
import type { AvaliacaoQuiz, QuizPublico, VersiculoPublico } from '../types/selah'

export type CenarioLab = 'sucesso' | 'fallback' | 'erro'

export const versiculoLab: VersiculoPublico = {
  passagemId: 'genesis-1-3',
  referencia: 'Gênesis 1:3',
  texto: 'Então Deus disse: “Haja luz”, e houve luz.',
  idioma: 'pt-BR',
  versao: 'Texto demonstrativo',
  atribuicao: 'Conteúdo simulado exclusivamente para o laboratório de interface.',
}

const alternativas: QuizPublico['alternativas'] = [
  { id: 'A', texto: 'A luz' },
  { id: 'B', texto: 'Uma grande cidade' },
  { id: 'C', texto: 'A arca de Noé' },
  { id: 'D', texto: 'O palácio do Egito' },
]

export const quizIaLab: QuizPublico = {
  id: 'lab-quiz-ia',
  passagemId: versiculoLab.passagemId,
  pergunta: 'O que passou a existir depois que Deus falou?',
  alternativas,
  origem: 'ia',
}

export const quizFallbackLab: QuizPublico = {
  ...quizIaLab,
  id: 'lab-quiz-fallback',
  origem: 'fallback',
}

export const avaliacaoCorretaLab: AvaliacaoQuiz = {
  acertou: true,
  explicacao: 'A passagem diz que a luz apareceu depois que Deus falou.',
  referencia: versiculoLab.referencia,
}

export const avaliacaoIncorretaLab: AvaliacaoQuiz = {
  acertou: false,
  explicacao: 'A passagem fala sobre a criação da luz. Você pode reler o versículo antes de seguir.',
  referencia: versiculoLab.referencia,
}

export const createLabGateway = (cenario: CenarioLab): SelahGateway => ({
  buscarVersiculo: async () => {
    if (cenario === 'erro') throw new Error('Falha simulada de rede.')
    return versiculoLab
  },
  gerarQuiz: async () => {
    if (cenario === 'erro') throw new Error('Falha simulada de rede.')
    return cenario === 'fallback' ? quizFallbackLab : quizIaLab
  },
  responderQuiz: async ({ alternativaId }) =>
    alternativaId === 'A' ? avaliacaoCorretaLab : avaliacaoIncorretaLab,
  enviarMetricas: async () => undefined,
})
