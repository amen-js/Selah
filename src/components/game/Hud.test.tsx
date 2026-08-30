import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { Hud } from './Hud'

describe('Hud', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.setState({ regiao: 'criacao', versiculosColetados: ['genesis-1-3'] })
  })

  it('shows the current region and collected passage count', () => {
    render(<Hud />)

    expect(screen.getByText('A Criação')).toBeInTheDocument()
    expect(screen.getByText('1 passagem')).toBeInTheDocument()
  })

  it('opens each local panel from accessible controls', async () => {
    const user = userEvent.setup()
    render(<Hud />)

    await user.click(screen.getByRole('button', { name: 'Abrir diário' }))
    expect(useGameStore.getState().painelAberto).toBe('diario')

    await user.click(screen.getByRole('button', { name: 'Abrir métricas' }))
    expect(useGameStore.getState().painelAberto).toBe('metricas')

    await user.click(screen.getByRole('button', { name: 'Abrir configurações' }))
    expect(useGameStore.getState().painelAberto).toBe('configuracoes')
  })
})
