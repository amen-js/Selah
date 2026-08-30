import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { LanguageSelector } from './LanguageSelector'

describe('LanguageSelector', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('shows only the supported languages', () => {
    render(<LanguageSelector />)

    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('combobox', { name: 'Idioma da interface' })).toHaveValue(
      'pt-BR',
    )
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Português',
      'English',
      'Español',
    ])
  })

  it('updates the shared language and its accessible label immediately', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Idioma da interface' }),
      'en-US',
    )

    expect(useGameStore.getState().idioma).toBe('en-US')
    expect(screen.getByRole('combobox', { name: 'Interface language' })).toHaveValue(
      'en-US',
    )
    expect(localStorage.getItem('selah-game-state')).toContain('en-US')
  })
})
