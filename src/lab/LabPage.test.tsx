import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../stores/gameStore'
import { LabPage } from './LabPage'

describe('LabPage', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('renders the UI laboratory without a 3D canvas', () => {
    const { container } = render(<LabPage />)

    expect(screen.getByText('Interface sem Canvas')).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('starts a complete mocked Selah from the controls', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.click(screen.getByRole('button', { name: 'Abrir Selah' }))

    await waitFor(() => expect(screen.getByText(/então Deus disse/i)).toBeInTheDocument())
    expect(useGameStore.getState().regiao).toBe('criacao')
  })

  it('switches to the approved fallback scenario', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Cenário' }),
      'fallback',
    )
    await user.click(screen.getByRole('button', { name: 'Abrir Selah' }))
    await user.click(
      await screen.findByRole('button', { name: 'Continuar para a pergunta' }),
    )

    expect(screen.getByText('Pergunta bíblica revisada')).toBeInTheDocument()
  })

  it('resets all local laboratory state', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ versiculosColetados: ['genesis-1-3'] })
    render(<LabPage />)

    await user.click(
      screen.getByRole('button', { name: 'Restaurar estado do laboratório' }),
    )

    expect(useGameStore.getState().versiculosColetados).toEqual([])
    expect(useGameStore.getState().regiao).toBe('criacao')
  })

  it('translates laboratory controls immediately while keeping fixture content intact', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Idioma da interface' }),
      'en-US',
    )
    expect(screen.getByLabelText('Interface laboratory controls')).toBeInTheDocument()
    expect(screen.getByText('Selah Laboratory')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Selah' })).toBeInTheDocument()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Interface language' }),
      'es-ES',
    )
    expect(screen.getByLabelText('Controles del laboratorio de interfaz')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir Selah' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir Selah' }))
    expect(await screen.findByText(/então Deus disse/i)).toBeInTheDocument()
    expect(screen.getByText('Pasaje · Gênesis 1:3')).toBeInTheDocument()
  })
})
