import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { LocalDashboard } from './LocalDashboard'

describe('LocalDashboard', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    useGameStore.getState().setPainelAberto('metricas')
  })

  it('shows safe zero rates before any reflection', () => {
    render(<LocalDashboard />)

    expect(screen.getByTestId('completion-rate')).toHaveTextContent('0%')
    expect(screen.getByTestId('accuracy-rate')).toHaveTextContent('0%')
    expect(screen.getByRole('button', { name: 'Fechar métricas locais' })).toHaveFocus()
  })

  it('calculates local aggregate rates and closes the panel', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      selahsIniciados: 4,
      selahsCompletados: 3,
      historico: [
        { quizId: '1', passagemId: 'a', alternativaId: 'A', acertou: true },
        { quizId: '2', passagemId: 'b', alternativaId: 'B', acertou: false },
      ],
    })
    render(<LocalDashboard />)

    expect(screen.getByTestId('completion-rate')).toHaveTextContent('75%')
    expect(screen.getByTestId('accuracy-rate')).toHaveTextContent('50%')
    await user.click(screen.getByRole('button', { name: 'Fechar métricas locais' }))
    expect(useGameStore.getState().painelAberto).toBeNull()
  })

  it('updates dashboard copy while the panel remains open', () => {
    useGameStore.setState({
      historico: [
        { quizId: '1', passagemId: 'a', alternativaId: 'A', acertou: true },
      ],
    })
    render(<LocalDashboard />)

    act(() => useGameStore.getState().setIdioma('en-US'))

    expect(screen.getByRole('dialog', { name: 'Local metrics' })).toBeInTheDocument()
    expect(screen.getByText('Correct answer in 1 quiz')).toBeInTheDocument()
    expect(screen.getByText(/do not identify who is playing/i)).toBeInTheDocument()
  })
})
