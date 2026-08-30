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
    expect(screen.getByRole('combobox', { name: 'Idioma do jogo' })).toHaveValue('pt-BR')
  })

  it('updates the language in the shared store', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma do jogo' }), 'en-US')

    expect(useGameStore.getState().idioma).toBe('en-US')
  })
})
