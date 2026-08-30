import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { Journal } from './Journal'

describe('Journal', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setPainelAberto('diario')
  })

  it('shows a calm empty state without inventing content', () => {
    render(<Journal />)

    expect(screen.getByText(/ainda não há passagens/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar diário' })).toHaveFocus()
  })

  it('lists minimal local progress and closes the panel', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      versiculosColetados: ['genesis-1-3'],
      historico: [
        {
          quizId: 'quiz-1',
          passagemId: 'genesis-1-3',
          alternativaId: 'A',
          acertou: true,
        },
      ],
    })

    render(<Journal />)

    expect(screen.getAllByText('genesis-1-3')).toHaveLength(2)
    expect(screen.getByText(/alternativa A · acertou/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fechar diário' }))
    expect(useGameStore.getState().painelAberto).toBeNull()
  })
})
