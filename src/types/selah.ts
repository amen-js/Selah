export type Regiao = 'hub' | 'criacao' | 'noe' | 'jose'

export type Idioma = 'pt-BR' | 'en-US' | 'es-ES'

export type FaixaEtaria = 'crianca' | 'geral'

export type AlternativaId = 'A' | 'B' | 'C' | 'D'

export type DificuldadeQuiz = 'facil' | 'medio'

export type OrigemQuiz = 'ia' | 'fallback'

export type FaseSelah = 'carregando' | 'versiculo' | 'quiz' | 'enviando' | 'feedback'

export type PainelAberto = 'diario' | 'configuracoes' | 'metricas' | null

export interface GatilhoSelah {
  historiaId: string
  passagemId: string
}

export interface VersiculoPublico {
  passagemId: string
  referencia: string
  texto: string
  idioma: Idioma
  versao: string
  atribuicao: string
}

export interface AlternativaQuiz {
  id: AlternativaId
  texto: string
}

export interface QuizPublico {
  id: string
  passagemId: string
  pergunta: string
  alternativas: AlternativaQuiz[]
  origem: OrigemQuiz
}

export interface AvaliacaoQuiz {
  acertou: boolean
  explicacao: string
  referencia: string
}

export interface ResultadoQuizLocal {
  quizId: string
  passagemId: string
  alternativaId: AlternativaId
  acertou: boolean
}

export interface SelahAtivo {
  gatilho: GatilhoSelah
  fase: FaseSelah
  versiculo?: VersiculoPublico
  quiz?: QuizPublico
  alternativaSelecionada?: AlternativaId
  avaliacao?: AvaliacaoQuiz
  erro?: string
}

export interface GerarQuizInput extends GatilhoSelah {
  idioma: Idioma
  faixaEtaria: FaixaEtaria
  dificuldade: DificuldadeQuiz
  iaAtiva: boolean
}

export interface ResponderQuizInput {
  quizId: string
  alternativaId: AlternativaId
}

export type EventoMetrica =
  | {
      tipo: 'selah_iniciado' | 'selah_concluido'
      historiaId: string
      versaoApp: string
    }
  | {
      tipo: 'quiz_respondido'
      historiaId: string
      versaoApp: string
      acertou: boolean
    }
