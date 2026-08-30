import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createLabGateway } from '../../lab/fixtures'
import { useGameStore } from '../../stores/gameStore'
import { GameOverlay } from './GameOverlay'

describe('GameOverlay', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
  })

  it('renders the HUD and opens composed panels', async () => {
    const user = userEvent.setup()
    render(<GameOverlay gateway={createLabGateway('sucesso')} />)

    expect(screen.getByLabelText('Informações do jogo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Abrir métricas' }))
    expect(screen.getByRole('dialog', { name: 'Medimos Momentos Selah' })).toBeInTheDocument()
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

  it('gives parental pause precedence over the HUD', () => {
    useGameStore.setState({ pausaParentalAtiva: true })
    render(<GameOverlay gateway={createLabGateway('sucesso')} />)

    expect(screen.getByRole('dialog', { name: /agora a pausa acontece/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Informações do jogo')).not.toBeInTheDocument()
  })
})
