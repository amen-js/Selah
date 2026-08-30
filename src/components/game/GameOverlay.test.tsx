import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createLabGateway, quizIaLab, versiculoLab } from '../../lab/fixtures'
import type { SelahGateway } from '../../services/selahGateway'
import type { TtsController, TtsEstado } from '../../services/tts'
import { useGameStore } from '../../stores/gameStore'
import { momentosCriacao } from './creation/progression'
import type { SnapshotProgressaoCriacao } from './creation/progression'
import { GameOverlay } from './GameOverlay'

const snapshotVazio: SnapshotProgressaoCriacao = {
  momento: momentosCriacao[0],
  estado: {
    momentoAtualId: 'vazio',
    momentosConcluidos: [],
    concluida: false,
  },
}

function criarTtsControlavel() {
  let estado: TtsEstado = 'idle'
  const listeners = new Set<(novoEstado: TtsEstado) => void>()
  const emitir = (novoEstado: TtsEstado) => {
    if (novoEstado === estado) return
    estado = novoEstado
    for (const listener of listeners) listener(novoEstado)
  }
  const tts: TtsController = {
    suportado: true,
    estado: () => estado,
    assinar: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    falar: vi.fn(async () => {
      emitir('loading')
      emitir('playing')
    }),
    narrar: vi.fn(async () => {
      emitir('loading')
      emitir('playing')
    }),
    pausar: vi.fn(() => emitir('paused')),
    retomar: vi.fn(() => emitir('playing')),
    cancelar: vi.fn(() => emitir('idle')),
  }

  return { tts, emitir }
}

describe('GameOverlay', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    useGameStore.getState().setFaixaEtaria('geral')
    useGameStore.getState().setTtsAtivo(false)
  })

  it('renders the HUD and opens composed panels', async () => {
    const user = userEvent.setup()
    render(<GameOverlay gateway={createLabGateway('sucesso')} />)

    expect(screen.getByLabelText('Informações e ações da exploração')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Abrir métricas locais' }))
    expect(screen.getByRole('dialog', { name: 'Métricas locais' })).toBeInTheDocument()
  })

  it('renders the transparent NPC dialog from shared state', () => {
    useGameStore.getState().setDialogoAberto(true)
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        dialogo={{ personagem: 'Lumi', mensagem: 'Vamos refletir juntos.' }}
      />,
    )

    expect(screen.getByLabelText('Diálogo com Lumi')).toBeInTheDocument()
    expect(screen.getByText(/personagem virtual automatizado/i)).toBeInTheDocument()
  })

  it('localizes its default NPC copy without changing provided narrative strings', () => {
    useGameStore.setState({ idioma: 'es-ES', dialogoAberto: true })
    render(<GameOverlay gateway={createLabGateway('sucesso')} />)

    expect(
      screen.getByText(
        'La creación guarda pequeñas señales. Explora con calma y observa lo que florece en el camino.',
      ),
    ).toBeInTheDocument()
  })

  it('gives parental pause precedence over the HUD', () => {
    useGameStore.setState({ pausaParentalAtiva: true })
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    expect(
      screen.getByRole('dialog', { name: /um momento com quem cuida de você/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Informações e ações da exploração'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
  })

  it('renders Creation progress and starts its initial Voice Guide narration', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        tts={controle.tts}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: 'Voz Guia' }),
    ).toHaveTextContent('No começo, tudo era escuro e bem silencioso')
    await waitFor(() => {
      expect(controle.tts.narrar).toHaveBeenCalledWith(
        expect.objectContaining({ narracaoId: 'criacao.vazio.inicial', idioma: 'pt-BR' }),
      )
    })
  })

  it('keeps Creation progress but neither shows nor narrates while exploration is inactive', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        tts={controle.tts}
        progressaoCriacao={snapshotVazio}
      />,
    )

    expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
    })
    expect(controle.tts.narrar).not.toHaveBeenCalled()
  })

  it('narrates support when active Creation exploration becomes inactive', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    const { rerender } = render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        tts={controle.tts}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    await waitFor(() => expect(controle.tts.narrar).toHaveBeenCalledTimes(1))
    await act(async () => {
      controle.emitir('idle')
      await Promise.resolve()
    })

    rerender(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        tts={controle.tts}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
        inatividadeCriacao
      />,
    )

    await waitFor(() => {
      expect(controle.tts.narrar).toHaveBeenCalledTimes(2)
      expect(controle.tts.narrar).toHaveBeenLastCalledWith(
        expect.objectContaining({ narracaoId: 'criacao.vazio.apoio', idioma: 'pt-BR' }),
      )
    })
    expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
      'Siga devagarinho',
    )
  })

  it.each([
    ['dialog', () => useGameStore.getState().setDialogoAberto(true)],
    ['journal', () => useGameStore.getState().setPainelAberto('diario')],
    ['settings', () => useGameStore.getState().setPainelAberto('configuracoes')],
    ['metrics', () => useGameStore.getState().setPainelAberto('metricas')],
    ['parental pause', () => useGameStore.setState({ pausaParentalAtiva: true })],
  ])('cancels and hides the Voice Guide when %s opens', async (_, openOverlay) => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        tts={controle.tts}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    await waitFor(() => expect(controle.tts.narrar).toHaveBeenCalledOnce())
    vi.mocked(controle.tts.cancelar).mockClear()
    act(openOverlay)

    await waitFor(() => expect(controle.tts.cancelar).toHaveBeenCalled())
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
  })

  it('cancels Creation guidance before Selah starts scripture speech', async () => {
    const controle = criarTtsControlavel()
    useGameStore.getState().setFaixaEtaria('crianca')
    let resolverVersiculo: (versiculo: typeof versiculoLab) => void = () => undefined
    let resolverQuiz: (quiz: typeof quizIaLab) => void = () => undefined
    const versiculoPendente = new Promise<typeof versiculoLab>((resolve) => {
      resolverVersiculo = resolve
    })
    const quizPendente = new Promise<typeof quizIaLab>((resolve) => {
      resolverQuiz = resolve
    })
    const gateway: SelahGateway = {
      ...createLabGateway('sucesso'),
      buscarVersiculo: vi.fn(() => versiculoPendente),
      gerarQuiz: vi.fn(() => quizPendente),
    }
    render(
      <GameOverlay
        gateway={gateway}
        tts={controle.tts}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    await waitFor(() => expect(controle.tts.narrar).toHaveBeenCalledOnce())
    vi.mocked(controle.tts.cancelar).mockClear()
    act(() => {
      useGameStore.getState().abrirSelah({
        historiaId: 'criacao',
        passagemId: 'genesis-1-3',
      })
    })

    await waitFor(() => expect(controle.tts.cancelar).toHaveBeenCalled())
    expect(controle.tts.falar).not.toHaveBeenCalled()
    const ultimaOrdemCancelamento = Math.max(
      ...vi.mocked(controle.tts.cancelar).mock.invocationCallOrder,
    )

    await act(async () => {
      resolverVersiculo(versiculoLab)
      resolverQuiz(quizIaLab)
      await Promise.all([versiculoPendente, quizPendente])
    })

    await waitFor(() => expect(controle.tts.falar).toHaveBeenCalledWith(versiculoLab))
    expect(ultimaOrdemCancelamento).toBeLessThan(
      vi.mocked(controle.tts.falar).mock.invocationCallOrder[0]!,
    )
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
  })
})
