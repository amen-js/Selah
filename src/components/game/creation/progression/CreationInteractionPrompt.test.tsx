import { act, render, screen } from '@testing-library/react'
import { useGameStore } from '../../../../stores/gameStore'
import { CreationInteractionPrompt } from './CreationInteractionPrompt'

describe('CreationInteractionPrompt', () => {
  beforeEach(() => useGameStore.getState().setIdioma('pt-BR'))

  it('identifica um Momento Selah e ensina a interação explícita', () => {
    render(<CreationInteractionPrompt tipo="selah" />)

    expect(
      screen.getByRole('status', {
        name: 'Interação disponível: Momento Selah',
      }),
    ).toHaveTextContent('Pressione E ou Enter para continuar')
  })

  it('distingue um Ponto da Criação e acompanha o idioma', () => {
    render(<CreationInteractionPrompt tipo="ponto-criacao" />)

    expect(screen.getByRole('status')).toHaveTextContent('Ponto da Criação')

    act(() => useGameStore.getState().setIdioma('en-US'))
    expect(screen.getByRole('status')).toHaveTextContent('Creation Point')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Press E or Enter to continue',
    )
  })

  it('orienta a confirmação pelo botão touch', () => {
    render(<CreationInteractionPrompt tipo="selah" touch />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Toque em Ação para continuar',
    )
  })

  it('não renderiza fora do raio de interação', () => {
    render(<CreationInteractionPrompt tipo={null} />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})
