import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type {
  AlternativaId,
  AvaliacaoQuiz,
  FaixaEtaria,
  GatilhoSelah,
  Idioma,
  PainelAberto,
  QuizPublico,
  Regiao,
  ResultadoQuizLocal,
  SelahAtivo,
  VersiculoPublico,
} from '../types/selah'

export const GAME_STORAGE_KEY = 'selah-game-state'

const IDIOMAS_SUPORTADOS: Idioma[] = ['pt-BR', 'en-US', 'es-ES']

const detectarIdioma = (): Idioma => {
  if (typeof navigator === 'undefined') return 'pt-BR'

  const idiomas = navigator.languages.length > 0 ? navigator.languages : [navigator.language]
  for (const idioma of idiomas) {
    const normalizado = IDIOMAS_SUPORTADOS.find(
      (suportado) => suportado.toLowerCase() === idioma.toLowerCase(),
    )
    if (normalizado) return normalizado

    const peloIdiomaBase = IDIOMAS_SUPORTADOS.find(
      (suportado) => suportado.split('-')[0] === idioma.split('-')[0],
    )
    if (peloIdiomaBase) return peloIdiomaBase
  }

  return 'pt-BR'
}

interface EstadoBase {
  regiao: Regiao
  idioma: Idioma
  faixaEtaria: FaixaEtaria
  ttsAtivo: boolean
  iaAtiva: boolean
  salvarProgresso: boolean
  compartilharMetricas: boolean
  versiculosColetados: string[]
  selahsIniciados: number
  selahsCompletados: number
  historico: ResultadoQuizLocal[]
  selahAtivo: SelahAtivo | null
  pausaParentalAtiva: boolean
  dialogoAberto: boolean
  painelAberto: PainelAberto
}

interface EstadoPersistido {
  idioma: Idioma
  faixaEtaria: FaixaEtaria
  ttsAtivo: boolean
  iaAtiva: boolean
  salvarProgresso: boolean
  compartilharMetricas: boolean
  pausaParentalAtiva: boolean
  regiao?: Regiao
  versiculosColetados?: string[]
  selahsIniciados?: number
  selahsCompletados?: number
  historico?: ResultadoQuizLocal[]
}

export interface EstadoJogo extends EstadoBase {
  setRegiao: (regiao: Regiao) => void
  setIdioma: (idioma: Idioma) => void
  setFaixaEtaria: (faixaEtaria: FaixaEtaria) => void
  setTtsAtivo: (ttsAtivo: boolean) => void
  setIaAtiva: (iaAtiva: boolean) => void
  setSalvarProgresso: (salvarProgresso: boolean) => void
  setCompartilharMetricas: (compartilharMetricas: boolean) => void
  setDialogoAberto: (dialogoAberto: boolean) => void
  setPainelAberto: (painelAberto: PainelAberto) => void
  abrirSelah: (gatilho: GatilhoSelah) => void
  carregarVersiculo: (versiculo: VersiculoPublico) => void
  carregarQuiz: (quiz: QuizPublico) => void
  mostrarQuiz: () => void
  iniciarEnvioResposta: (alternativaId: AlternativaId) => void
  registrarResultado: (avaliacao: AvaliacaoQuiz) => void
  definirErroSelah: (erro: string) => void
  cancelarSelah: () => void
  concluirSelah: () => void
  liberarPausaParental: () => void
  apagarProgresso: () => void
}

const criarEstadoInicial = (): EstadoBase => ({
  regiao: 'hub',
  idioma: detectarIdioma(),
  faixaEtaria: 'geral',
  ttsAtivo: false,
  iaAtiva: true,
  salvarProgresso: false,
  compartilharMetricas: false,
  versiculosColetados: [],
  selahsIniciados: 0,
  selahsCompletados: 0,
  historico: [],
  selahAtivo: null,
  pausaParentalAtiva: false,
  dialogoAberto: false,
  painelAberto: null,
})

const projetarEstadoPersistido = (state: EstadoJogo): EstadoPersistido => {
  const preferencias: EstadoPersistido = {
    idioma: state.idioma,
    faixaEtaria: state.faixaEtaria,
    ttsAtivo: state.ttsAtivo,
    iaAtiva: state.iaAtiva,
    salvarProgresso: state.salvarProgresso,
    compartilharMetricas: state.compartilharMetricas,
    pausaParentalAtiva: state.pausaParentalAtiva,
  }

  if (!state.salvarProgresso) return preferencias

  return {
    ...preferencias,
    regiao: state.regiao,
    versiculosColetados: state.versiculosColetados,
    selahsIniciados: state.selahsIniciados,
    selahsCompletados: state.selahsCompletados,
    historico: state.historico,
  }
}

export const useGameStore = create<EstadoJogo>()(
  persist<EstadoJogo, [], [], EstadoPersistido>(
    (set) => ({
      ...criarEstadoInicial(),
      setRegiao: (regiao) => set({ regiao }),
      setIdioma: (idioma) => set({ idioma }),
      setFaixaEtaria: (faixaEtaria) => set({ faixaEtaria }),
      setTtsAtivo: (ttsAtivo) => set({ ttsAtivo }),
      setIaAtiva: (iaAtiva) => set({ iaAtiva }),
      setSalvarProgresso: (salvarProgresso) => set({ salvarProgresso }),
      setCompartilharMetricas: (compartilharMetricas) => set({ compartilharMetricas }),
      setDialogoAberto: (dialogoAberto) => set({ dialogoAberto }),
      setPainelAberto: (painelAberto) => set({ painelAberto }),
      abrirSelah: (gatilho) =>
        set((state) => {
          if (state.selahAtivo || state.pausaParentalAtiva) return state

          return {
            selahAtivo: { gatilho, fase: 'carregando' },
            selahsIniciados: state.selahsIniciados + 1,
            versiculosColetados: state.versiculosColetados.includes(gatilho.passagemId)
              ? state.versiculosColetados
              : [...state.versiculosColetados, gatilho.passagemId],
            dialogoAberto: false,
            painelAberto: null,
          }
        }),
      carregarVersiculo: (versiculo) =>
        set((state) => {
          if (!state.selahAtivo || state.selahAtivo.gatilho.passagemId !== versiculo.passagemId) {
            return state
          }

          return {
            selahAtivo: {
              ...state.selahAtivo,
              fase: 'versiculo',
              versiculo,
              erro: undefined,
            },
          }
        }),
      carregarQuiz: (quiz) =>
        set((state) => {
          if (!state.selahAtivo || state.selahAtivo.gatilho.passagemId !== quiz.passagemId) {
            return state
          }

          return { selahAtivo: { ...state.selahAtivo, quiz } }
        }),
      mostrarQuiz: () =>
        set((state) => {
          if (!state.selahAtivo?.quiz) return state
          return { selahAtivo: { ...state.selahAtivo, fase: 'quiz' } }
        }),
      iniciarEnvioResposta: (alternativaSelecionada) =>
        set((state) => {
          if (state.selahAtivo?.fase !== 'quiz') return state
          return {
            selahAtivo: {
              ...state.selahAtivo,
              fase: 'enviando',
              alternativaSelecionada,
            },
          }
        }),
      registrarResultado: (avaliacao) =>
        set((state) => {
          const ativo = state.selahAtivo
          if (!ativo?.quiz || !ativo.alternativaSelecionada || ativo.fase !== 'enviando') return state

          const resultado: ResultadoQuizLocal = {
            quizId: ativo.quiz.id,
            passagemId: ativo.quiz.passagemId,
            alternativaId: ativo.alternativaSelecionada,
            acertou: avaliacao.acertou,
          }
          const jaRegistrado = state.historico.some((item) => item.quizId === resultado.quizId)

          return {
            selahAtivo: { ...ativo, fase: 'feedback', avaliacao },
            historico: jaRegistrado ? state.historico : [...state.historico, resultado],
          }
        }),
      definirErroSelah: (erro) =>
        set((state) =>
          state.selahAtivo
            ? {
                selahAtivo: {
                  ...state.selahAtivo,
                  fase: state.selahAtivo.fase === 'enviando' ? 'quiz' : state.selahAtivo.fase,
                  erro,
                },
              }
            : state,
        ),
      cancelarSelah: () => set({ selahAtivo: null }),
      concluirSelah: () =>
        set((state) => {
          if (state.selahAtivo?.fase !== 'feedback') return state
          return {
            selahAtivo: null,
            selahsCompletados: state.selahsCompletados + 1,
            pausaParentalAtiva: true,
          }
        }),
      liberarPausaParental: () => set({ pausaParentalAtiva: false }),
      apagarProgresso: () => {
        set(criarEstadoInicial())
        localStorage.removeItem(GAME_STORAGE_KEY)
      },
    }),
    {
      name: GAME_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage<EstadoPersistido>(() => localStorage),
      partialize: projetarEstadoPersistido,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as EstadoPersistido),
        selahAtivo: null,
        dialogoAberto: false,
        painelAberto: null,
      }),
    },
  ),
)

export const selectExploracaoBloqueada = (state: EstadoJogo): boolean =>
  Boolean(state.selahAtivo || state.pausaParentalAtiva || state.dialogoAberto || state.painelAberto)

export const selectTaxaConclusao = (state: EstadoJogo): number =>
  state.selahsIniciados === 0
    ? 0
    : Math.round((state.selahsCompletados / state.selahsIniciados) * 100)

export const selectTaxaAcertos = (state: EstadoJogo): number =>
  state.historico.length === 0
    ? 0
    : Math.round((state.historico.filter((resultado) => resultado.acertou).length / state.historico.length) * 100)
