import type { AvaliacaoQuiz, QuizPublico, VersiculoPublico } from '../types/selah'
import type { CheckpointProgressaoNoe } from '../components/game/noe/progression'
import {
  GAME_STORAGE_KEY,
  selectExploracaoBloqueada,
  selectTaxaConclusao,
  useGameStore,
} from './gameStore'

const versiculo: VersiculoPublico = {
  passagemId: 'genesis-1-3',
  referencia: 'Gênesis 1:3',
  texto: 'Haja luz.',
  idioma: 'pt-BR',
  versao: 'NVI',
  atribuicao: 'Texto bíblico licenciado para a demo.',
}

const quiz: QuizPublico = {
  id: 'quiz-light',
  passagemId: 'genesis-1-3',
  pergunta: 'O que Deus criou?',
  alternativas: [
    { id: 'A', texto: 'A luz' },
    { id: 'B', texto: 'Uma cidade' },
    { id: 'C', texto: 'Uma arca' },
    { id: 'D', texto: 'Um palácio' },
  ],
  origem: 'ia',
}

const avaliacao: AvaliacaoQuiz = {
  acertou: true,
  explicacao: 'A passagem apresenta a criação da luz.',
  referencia: 'Gênesis 1:3',
}

const checkpointNoe: CheckpointProgressaoNoe = {
  versao: 1,
  momentosConcluidos: ['chamado-canteiro'],
  progressoMomentoAtual: [
    {
      acaoId: 'noe.madeira.coletada',
      unidadesConcluidas: ['tabua-1'],
    },
  ],
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
  })

  it('starts with privacy-first defaults', () => {
    const state = useGameStore.getState()

    expect(['pt-BR', 'en-US', 'es-ES']).toContain(state.idioma)
    expect(state.faixaEtaria).toBe('geral')
    expect(state.iaAtiva).toBe(true)
    expect(state.salvarProgresso).toBe(false)
    expect(state.compartilharMetricas).toBe(false)
    expect(state.ttsAtivo).toBe(false)
    expect(state.configuracaoInicialConcluida).toBe(false)
    expect(state.selahsConcluidos).toEqual([])
    expect(state.momentosCriacaoConcluidos).toEqual([])
    expect(state.checkpointNoe).toBeNull()
  })

  it('persists responsible onboarding completion without enabling progress saving', () => {
    useGameStore.getState().concluirConfiguracaoInicial()

    expect(useGameStore.getState()).toMatchObject({
      configuracaoInicialConcluida: true,
      salvarProgresso: false,
      compartilharMetricas: false,
    })
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toContain(
      '"configuracaoInicialConcluida":true',
    )
  })

  it('opens one Selah at a time and blocks exploration', () => {
    const trigger = { historiaId: 'criacao', passagemId: 'genesis-1-3' }

    useGameStore.getState().abrirSelah(trigger)
    useGameStore.getState().abrirSelah(trigger)

    const state = useGameStore.getState()
    expect(state.selahsIniciados).toBe(1)
    expect(state.selahAtivo).toMatchObject({ gatilho: trigger, fase: 'carregando' })
    expect(selectExploracaoBloqueada(state)).toBe(true)
  })

  it('moves through verse, quiz, evaluation, and parental pause', () => {
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    useGameStore.getState().carregarVersiculo(versiculo)
    useGameStore.getState().carregarQuiz(quiz)
    useGameStore.getState().mostrarQuiz()
    useGameStore.getState().iniciarEnvioResposta('A')
    useGameStore.getState().registrarResultado(avaliacao)

    expect(useGameStore.getState().selahAtivo).toMatchObject({
      fase: 'feedback',
      alternativaSelecionada: 'A',
      avaliacao,
    })
    expect(useGameStore.getState().historico).toEqual([
      {
        quizId: quiz.id,
        passagemId: quiz.passagemId,
        alternativaId: 'A',
        acertou: true,
      },
    ])

    useGameStore.getState().concluirSelah()
    expect(useGameStore.getState().selahsCompletados).toBe(1)
    expect(useGameStore.getState().selahsConcluidos).toEqual([versiculo.passagemId])
    expect(useGameStore.getState().pausaParentalAtiva).toBe(true)
    expect(useGameStore.getState().selahAtivo).toBeNull()

    useGameStore.getState().liberarPausaParental()
    expect(selectExploracaoBloqueada(useGameStore.getState())).toBe(false)
  })

  it('persists only safe progress fields when saving is enabled', () => {
    useGameStore.getState().setSalvarProgresso(true)
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    useGameStore.getState().carregarVersiculo(versiculo)
    useGameStore.getState().carregarQuiz(quiz)
    useGameStore.getState().mostrarQuiz()
    useGameStore.getState().iniciarEnvioResposta('A')
    useGameStore.getState().registrarResultado(avaliacao)

    const persisted = localStorage.getItem(GAME_STORAGE_KEY) ?? ''
    expect(persisted).toContain(versiculo.passagemId)
    expect(persisted).toContain(quiz.id)
    expect(persisted).not.toContain(versiculo.texto)
    expect(persisted).not.toContain(quiz.pergunta)
    expect(persisted).not.toContain(avaliacao.explicacao)
  })

  it('does not mark a Selah as concluded when only the response is registered', () => {
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    useGameStore.getState().carregarQuiz(quiz)
    useGameStore.getState().mostrarQuiz()
    useGameStore.getState().iniciarEnvioResposta('A')
    useGameStore.getState().registrarResultado(avaliacao)

    expect(useGameStore.getState().historico).toHaveLength(1)
    expect(useGameStore.getState().selahsConcluidos).toEqual([])
  })

  it('keeps the passage checkpoint unique while counting completed sessions', () => {
    const store = useGameStore.getState()
    store.abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    store.carregarQuiz(quiz)
    store.mostrarQuiz()
    store.iniciarEnvioResposta('A')
    store.registrarResultado(avaliacao)
    store.concluirSelah()
    store.liberarPausaParental()

    store.abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    store.carregarQuiz(quiz)
    store.mostrarQuiz()
    store.iniciarEnvioResposta('A')
    store.registrarResultado(avaliacao)
    store.concluirSelah()

    expect(useGameStore.getState().selahsConcluidos).toEqual([versiculo.passagemId])
    expect(useGameStore.getState().selahsCompletados).toBe(2)
  })

  it('stores Creation milestones idempotently and preserves their first-seen order', () => {
    const store = useGameStore.getState()
    store.setMomentosCriacaoConcluidos(['vazio', 'luz', 'vazio', 'natureza'])

    expect(useGameStore.getState().momentosCriacaoConcluidos).toEqual([
      'vazio',
      'luz',
      'natureza',
    ])

    const antes = useGameStore.getState()
    store.setMomentosCriacaoConcluidos(['vazio', 'luz', 'vazio', 'natureza'])
    expect(useGameStore.getState()).toBe(antes)
  })

  it('persists Creation milestones only when progress saving is enabled', () => {
    const store = useGameStore.getState()
    store.setMomentosCriacaoConcluidos(['vazio', 'luz'])

    expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toContain(
      'momentosCriacaoConcluidos',
    )

    store.setSalvarProgresso(true)
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toContain(
      '"momentosCriacaoConcluidos":["vazio","luz"]',
    )
  })

  it('keeps the Noah checkpoint in memory without persisting it when saving is disabled', () => {
    useGameStore.getState().setCheckpointNoe(checkpointNoe)

    expect(useGameStore.getState().checkpointNoe).toEqual(checkpointNoe)
    expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toContain('checkpointNoe')
  })

  it('persists the Noah checkpoint when progress saving is enabled', () => {
    const store = useGameStore.getState()
    store.setCheckpointNoe(checkpointNoe)
    store.setSalvarProgresso(true)

    const persistido = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY) ?? '{}')
    expect(persistido.state.checkpointNoe).toEqual(checkpointNoe)
  })

  it('does not publish a redundant update for an equivalent Noah checkpoint', () => {
    const store = useGameStore.getState()
    store.setCheckpointNoe(checkpointNoe)
    const antes = useGameStore.getState()

    store.setCheckpointNoe({
      versao: 1,
      momentosConcluidos: ['chamado-canteiro'],
      progressoMomentoAtual: [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesConcluidas: ['tabua-1'],
        },
      ],
    })

    expect(useGameStore.getState()).toBe(antes)
  })

  it('persists concluded passages only when progress saving is enabled', () => {
    const store = useGameStore.getState()
    store.abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    store.carregarQuiz(quiz)
    store.mostrarQuiz()
    store.iniciarEnvioResposta('A')
    store.registrarResultado(avaliacao)
    store.concluirSelah()

    expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toContain('selahsConcluidos')

    store.setSalvarProgresso(true)
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toContain(
      `"selahsConcluidos":["${versiculo.passagemId}"]`,
    )
  })

  it('hydrates legacy snapshots without a concluded Selah list', async () => {
    localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        state: {
          idioma: 'pt-BR',
          faixaEtaria: 'geral',
          ttsAtivo: false,
          iaAtiva: true,
          salvarProgresso: true,
          compartilharMetricas: false,
          configuracaoInicialConcluida: true,
          pausaParentalAtiva: false,
          regiao: 'criacao',
          versiculosColetados: [versiculo.passagemId],
          historico: [],
        },
        version: 1,
      }),
    )

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().selahsConcluidos).toEqual([])
    expect(useGameStore.getState().versiculosColetados).toEqual([versiculo.passagemId])
    expect(useGameStore.getState().checkpointNoe).toBeNull()
  })

  it('excludes gameplay history while playing without save', () => {
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    useGameStore.getState().carregarQuiz(quiz)
    useGameStore.getState().mostrarQuiz()
    useGameStore.getState().iniciarEnvioResposta('A')
    useGameStore.getState().registrarResultado(avaliacao)

    const persisted = localStorage.getItem(GAME_STORAGE_KEY) ?? ''
    expect(persisted).not.toContain('historico')
    expect(persisted).not.toContain(quiz.id)
    expect(persisted).not.toContain(versiculo.passagemId)
  })

  it('clears persisted data and derives aggregate rates', () => {
    useGameStore.getState().setSalvarProgresso(true)
    useGameStore.getState().setCheckpointNoe(checkpointNoe)
    useGameStore.setState({ selahsIniciados: 4, selahsCompletados: 3 })

    expect(selectTaxaConclusao(useGameStore.getState())).toBe(75)
    expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toBeNull()

    useGameStore.getState().apagarProgresso()
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
    expect(useGameStore.getState().selahsIniciados).toBe(0)
    expect(useGameStore.getState().selahsConcluidos).toEqual([])
    expect(useGameStore.getState().momentosCriacaoConcluidos).toEqual([])
    expect(useGameStore.getState().checkpointNoe).toBeNull()
    expect(useGameStore.getState().configuracaoInicialConcluida).toBe(false)
  })

  it('keeps narration state transient and clears it with the Selah', () => {
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    useGameStore.getState().setNarracaoAtiva(true)

    expect(useGameStore.getState().narracaoAtiva).toBe(true)
    expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toContain('narracaoAtiva')

    useGameStore.getState().cancelarSelah()
    expect(useGameStore.getState().narracaoAtiva).toBe(false)
  })
})
