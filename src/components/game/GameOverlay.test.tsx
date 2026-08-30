import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createLabGateway } from '../../lab/fixtures'
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

describe('GameOverlay', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
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

  it('renders Creation progress and Voice Guide together during active exploration', () => {
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: 'Voz Guia' }),
    ).toHaveTextContent('Dê alguns passos e descubra o primeiro caminho.')
  })

  it('keeps Creation progress but hides the guide while exploration is inactive', () => {
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        progressaoCriacao={snapshotVazio}
      />,
    )

    expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
  })

  it.each([
    ['dialog', () => useGameStore.getState().setDialogoAberto(true)],
    ['journal', () => useGameStore.getState().setPainelAberto('diario')],
    ['settings', () => useGameStore.getState().setPainelAberto('configuracoes')],
    ['metrics', () => useGameStore.getState().setPainelAberto('metricas')],
  ])('hides the Voice Guide while %s is open', (_, openOverlay) => {
    openOverlay()
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
  })

  it('gives an active Selah precedence over Creation guidance', () => {
    useGameStore.getState().abrirSelah({
      historiaId: 'criacao',
      passagemId: 'genesis-1-3',
    })
    render(
      <GameOverlay
        gateway={createLabGateway('sucesso')}
        progressaoCriacao={snapshotVazio}
        exploracaoAtiva
      />,
    )

    expect(
      screen.queryByLabelText('Informações e ações da exploração'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Voz Guia' }),
    ).not.toBeInTheDocument()
  })
})
