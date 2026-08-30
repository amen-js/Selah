import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GAME_STORAGE_KEY, useGameStore } from '../../stores/gameStore'
import { ParentSettings } from './ParentSettings'

describe('ParentSettings', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    useGameStore.getState().setPainelAberto('configuracoes')
  })

  it('explains local data and automated quiz behavior', () => {
    render(<ParentSettings />)

    expect(screen.getByText(/preferências ficam neste dispositivo/i)).toBeInTheDocument()
    expect(screen.getByText(/perguntas bíblicas revisadas/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Fechar configurações parentais' }),
    ).toHaveFocus()
  })

  it('updates the age group', async () => {
    const user = userEvent.setup()
    render(<ParentSettings />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Selecionar faixa etária' }),
      'crianca',
    )
    expect(useGameStore.getState().faixaEtaria).toBe('crianca')
  })

  it('updates accessibility, AI, saving, and metrics choices', async () => {
    const user = userEvent.setup()
    render(<ParentSettings />)

    expect(screen.getAllByRole('switch')).toHaveLength(4)

    await user.click(screen.getByRole('switch', { name: 'Leitura em voz alta' }))
    await user.click(screen.getByRole('switch', { name: 'Reflexões com IA' }))
    await user.click(screen.getByRole('switch', { name: 'Salvar progresso' }))
    await user.click(
      screen.getByRole('switch', { name: 'Compartilhar métricas anônimas' }),
    )

    expect(useGameStore.getState()).toMatchObject({
      ttsAtivo: true,
      iaAtiva: false,
      salvarProgresso: true,
      compartilharMetricas: true,
    })
  })

  it('requires confirmation before clearing all local progress', async () => {
    const user = userEvent.setup()
    useGameStore.getState().setSalvarProgresso(true)
    useGameStore.setState({ versiculosColetados: ['genesis-1-3'] })
    render(<ParentSettings />)

    await user.click(
      screen.getByRole('button', { name: 'Apagar todo o progresso local' }),
    )
    expect(useGameStore.getState().versiculosColetados).toEqual(['genesis-1-3'])

    await user.click(
      screen.getByRole('button', { name: 'Confirmar exclusão do progresso local' }),
    )
    expect(useGameStore.getState().versiculosColetados).toEqual([])
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
  })

  it('closes the parental panel', async () => {
    const user = userEvent.setup()
    render(<ParentSettings />)

    await user.click(
      screen.getByRole('button', { name: 'Fechar configurações parentais' }),
    )
    expect(useGameStore.getState().painelAberto).toBeNull()
  })

  it('translates an open panel through the shared language selector', async () => {
    const user = userEvent.setup()
    useGameStore.getState().setIdioma('en-US')
    render(<ParentSettings />)

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Interface language' }),
      'es-ES',
    )

    expect(screen.getByRole('dialog', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.getByText('Grupo de edad')).toBeInTheDocument()
    expect(useGameStore.getState().idioma).toBe('es-ES')
  })
})
