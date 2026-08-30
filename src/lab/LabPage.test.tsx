import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../stores/gameStore'
import { LabPage } from './LabPage'

describe('LabPage', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
  })

  it('renders the UI laboratory without a 3D canvas', () => {
    const { container } = render(<LabPage />)

    expect(screen.getByText(/nenhum canvas 3D/i)).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('starts a complete mocked Selah from the controls', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.click(screen.getByRole('button', { name: 'Iniciar Momento Selah' }))

    await waitFor(() => expect(screen.getByText(/então Deus disse/i)).toBeInTheDocument())
    expect(useGameStore.getState().regiao).toBe('criacao')
  })

  it('switches to the approved fallback scenario', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Cenário do laboratório' }), 'fallback')
    await user.click(screen.getByRole('button', { name: 'Iniciar Momento Selah' }))
    await user.click(await screen.findByRole('button', { name: 'Continuar para o quiz' }))

    expect(screen.getByText(/quiz local aprovado/i)).toBeInTheDocument()
  })

  it('resets all local laboratory state', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ versiculosColetados: ['genesis-1-3'] })
    render(<LabPage />)

    await user.click(screen.getByRole('button', { name: 'Reiniciar laboratório' }))

    expect(useGameStore.getState().versiculosColetados).toEqual([])
    expect(useGameStore.getState().regiao).toBe('criacao')
  })
})
