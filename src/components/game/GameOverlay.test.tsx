import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createLabGateway } from '../../lab/fixtures'
import { useGameStore } from '../../stores/gameStore'
import { GameOverlay } from './GameOverlay'

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
    render(<GameOverlay gateway={createLabGateway('sucesso')} />)

    expect(screen.getByRole('dialog', { name: /agora a pausa acontece/i })).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Informações e ações da exploração'),
    ).not.toBeInTheDocument()
  })
})
