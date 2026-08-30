import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { ResponsibleOnboarding } from './ResponsibleOnboarding'

describe('ResponsibleOnboarding', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('explains the first journey with privacy-first defaults', () => {
    render(<ResponsibleOnboarding />)

    expect(
      screen.getByRole('dialog', { name: 'Configuração do responsável' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Configuração do responsável' })).toHaveFocus()
    expect(screen.getByText(/depois de cada reflexão/i)).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Reflexões com IA' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Salvar progresso' })).not.toBeChecked()
    expect(
      screen.getByRole('switch', { name: 'Compartilhar métricas anônimas' }),
    ).not.toBeChecked()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Jogar sem salvar' })).toBeInTheDocument()
  })

  it('updates the shared choices and completes setup explicitly', async () => {
    const user = userEvent.setup()
    render(<ResponsibleOnboarding />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Selecionar faixa etária' }),
      'crianca',
    )
    await user.click(screen.getByRole('switch', { name: 'Reflexões com IA' }))
    await user.click(screen.getByRole('switch', { name: 'Salvar progresso' }))
    await user.click(
      screen.getByRole('switch', { name: 'Compartilhar métricas anônimas' }),
    )
    await user.click(screen.getByRole('button', { name: 'Salvar e continuar' }))

    expect(useGameStore.getState()).toMatchObject({
      faixaEtaria: 'crianca',
      iaAtiva: false,
      salvarProgresso: true,
      compartilharMetricas: true,
      configuracaoInicialConcluida: true,
    })
  })

  it('translates the open onboarding immediately', async () => {
    const user = userEvent.setup()
    render(<ResponsibleOnboarding />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Idioma da interface' }),
      'en-US',
    )

    expect(
      screen.getByRole('dialog', { name: 'Responsible adult setup' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play without saving' })).toBeInTheDocument()
    expect(screen.getByText(/after each reflection/i)).toBeInTheDocument()
  })
})
