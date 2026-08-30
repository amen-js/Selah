import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SelahGateway } from '../../services/selahGateway'
import { useGameStore } from '../../stores/gameStore'
import type { QuizPublico, VersiculoPublico } from '../../types/selah'
import { SelahOverlay, type TtsController } from './SelahOverlay'

const versiculo: VersiculoPublico = {
  passagemId: 'genesis-1-3',
  referencia: 'Gênesis 1:3',
  texto: 'Haja luz.',
  idioma: 'pt-BR',
  versao: 'Demo',
  atribuicao: 'Texto de teste.',
}

const createQuiz = (origem: QuizPublico['origem'] = 'ia'): QuizPublico => ({
  id: `quiz-${origem}`,
  passagemId: versiculo.passagemId,
  pergunta: 'O que surgiu?',
  alternativas: [
    { id: 'A', texto: 'A luz' },
    { id: 'B', texto: 'A arca' },
    { id: 'C', texto: 'A cidade' },
    { id: 'D', texto: 'O palácio' },
  ],
  origem,
})

const gateway: SelahGateway = {
  buscarVersiculo: vi.fn().mockResolvedValue(versiculo),
  gerarQuiz: vi.fn().mockResolvedValue(createQuiz()),
  responderQuiz: vi.fn().mockResolvedValue({
    acertou: true,
    explicacao: 'A passagem apresenta a luz.',
    referencia: versiculo.referencia,
  }),
  enviarMetricas: vi.fn().mockResolvedValue(undefined),
}

const tts: TtsController = {
  suportado: true,
  falar: vi.fn(),
  pausar: vi.fn(),
  cancelar: vi.fn(),
}

const prepareVerse = (origem: QuizPublico['origem'] = 'ia') => {
  useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
  useGameStore.getState().carregarVersiculo(versiculo)
  useGameStore.getState().carregarQuiz(createQuiz(origem))
}

describe('SelahOverlay', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    vi.clearAllMocks()
  })

  it('announces the loading state', () => {
    const pendingGateway: SelahGateway = {
      ...gateway,
      buscarVersiculo: vi.fn(() => new Promise<VersiculoPublico>(() => undefined)),
      gerarQuiz: vi.fn(() => new Promise<QuizPublico>(() => undefined)),
    }
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })

    render(<SelahOverlay gateway={pendingGateway} tts={tts} />)

    expect(screen.getByText(/preparando este momento/i)).toBeInTheDocument()
    expect(screen.getByRole('dialog').parentElement).toHaveClass('selah-backdrop')
  })

  it('shows the verse and exposes the injected TTS control', async () => {
    const user = userEvent.setup()
    prepareVerse()
    render(<SelahOverlay gateway={gateway} tts={tts} />)

    expect(screen.getByText('Haja luz.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ouvir versículo' }))
    expect(tts.falar).toHaveBeenCalledWith(versiculo.texto, 'pt-BR')

    await user.click(screen.getByRole('button', { name: 'Continuar para o quiz' }))
    expect(useGameStore.getState().selahAtivo?.fase).toBe('quiz')
  })

  it('renders exactly four alternatives and displays evaluated feedback', async () => {
    const user = userEvent.setup()
    prepareVerse()
    useGameStore.getState().mostrarQuiz()
    render(<SelahOverlay gateway={gateway} tts={tts} />)

    expect(screen.getAllByRole('button', { name: /^Alternativa/ })).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: 'Alternativa A: A luz' }))

    await waitFor(() => expect(screen.getByText('Você acertou')).toBeInTheDocument())
    expect(screen.getByText('A passagem apresenta a luz.')).toBeInTheDocument()
  })

  it('identifies fallback content and enters parental pause after feedback', async () => {
    const user = userEvent.setup()
    prepareVerse('fallback')
    useGameStore.getState().mostrarQuiz()
    render(<SelahOverlay gateway={gateway} tts={tts} />)

    expect(screen.getByText(/quiz local aprovado/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Alternativa A: A luz' }))
    await user.click(await screen.findByRole('button', { name: 'Iniciar Pausa Selah' }))

    expect(useGameStore.getState().pausaParentalAtiva).toBe(true)
  })

  it('shows a safe error and lets the player leave the reflection', async () => {
    const user = userEvent.setup()
    useGameStore.getState().abrirSelah({ historiaId: 'criacao', passagemId: versiculo.passagemId })
    useGameStore.getState().definirErroSelah('Não foi possível carregar este Momento Selah.')
    render(<SelahOverlay gateway={gateway} tts={tts} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar')
    await user.click(screen.getByRole('button', { name: 'Sair do Momento Selah' }))
    expect(useGameStore.getState().selahAtivo).toBeNull()
  })
})
