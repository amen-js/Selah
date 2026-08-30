import { act, render, screen } from '@testing-library/react'
import { useGameStore } from '../../../../stores/gameStore'
import { NoeInteractionPrompt } from './NoeInteractionPrompt'

describe('NoeInteractionPrompt', () => {
  beforeEach(() => useGameStore.getState().setIdioma('pt-BR'))

  it('explica a confirmação de uma tarefa local', () => {
    render(<NoeInteractionPrompt tipo="tarefa" />)

    expect(
      screen.getByRole('status', {
        name: 'Interação disponível: Tarefa de Noé',
      }),
    ).toHaveTextContent('Pressione E ou Enter para interagir')
  })

  it('distingue Selah e acompanha o idioma', () => {
    render(<NoeInteractionPrompt tipo="selah" />)
    expect(screen.getByRole('status')).toHaveTextContent('Momento Selah')

    act(() => useGameStore.getState().setIdioma('en-US'))
    expect(screen.getByRole('status')).toHaveTextContent('Selah Moment')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Press E or Enter to interact',
    )
  })

  it('não renderiza sem candidato acionável', () => {
    render(<NoeInteractionPrompt tipo={null} />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})
