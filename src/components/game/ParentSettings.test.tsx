import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GAME_STORAGE_KEY, useGameStore } from '../../stores/gameStore'
import { ParentSettings } from './ParentSettings'

describe('ParentSettings', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setPainelAberto('configuracoes')
  })

  it('explains local data and automated quiz behavior', () => {
    render(<ParentSettings />)

    expect(screen.getByText(/sem cadastro infantil/i)).toBeInTheDocument()
    expect(screen.getByText(/fallback aprovado/i)).toBeInTheDocument()
  })

  it('updates the age group', async () => {
    const user = userEvent.setup()
    render(<ParentSettings />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Faixa etária' }), 'crianca')
    expect(useGameStore.getState().faixaEtaria).toBe('crianca')
  })

  it('updates accessibility, AI, saving, and metrics choices', async () => {
    const user = userEvent.setup()
    render(<ParentSettings />)

    await user.click(screen.getByRole('checkbox', { name: 'Leitura em voz alta' }))
    await user.click(screen.getByRole('checkbox', { name: 'Usar IA para novos quizzes' }))
    await user.click(screen.getByRole('checkbox', { name: 'Salvar progresso neste dispositivo' }))
    await user.click(screen.getByRole('checkbox', { name: 'Compartilhar métricas agregadas' }))

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

    await user.click(screen.getByRole('button', { name: 'Apagar progresso' }))
    expect(useGameStore.getState().versiculosColetados).toEqual(['genesis-1-3'])

    await user.click(screen.getByRole('button', { name: 'Confirmar exclusão do progresso' }))
    expect(useGameStore.getState().versiculosColetados).toEqual([])
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
  })

  it('closes the parental panel', async () => {
    const user = userEvent.setup()
    render(<ParentSettings />)

    await user.click(screen.getByRole('button', { name: 'Fechar configurações' }))
    expect(useGameStore.getState().painelAberto).toBeNull()
  })
})
