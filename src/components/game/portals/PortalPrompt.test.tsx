import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGameStore } from '../../../stores/gameStore'
import { PortalPrompt } from './PortalPrompt'
import type { PortalMapa } from './types'

const portal: PortalMapa = {
  id: 'portal-criacao',
  destino: 'criacao',
  posicao: [0, 0, 0],
  raioAtivacao: 2,
}

describe('PortalPrompt', () => {
  it('orienta a entrada disponível em português', () => {
    useGameStore.getState().setIdioma('pt-BR')
    render(<PortalPrompt portal={portal} />)

    expect(screen.getByRole('status', { name: 'Portal para A Criação' })).toHaveTextContent(
      'Pressione E ou Enter para entrar',
    )
  })

  it('orienta a entrada pelo botão touch sem citar teclado', () => {
    useGameStore.getState().setIdioma('pt-BR')
    render(<PortalPrompt portal={portal} touch />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Toque em Ação para entrar',
    )
    expect(screen.getByRole('status')).not.toHaveTextContent('E ou Enter')
  })

  it('localiza o prompt e informa quando a região está indisponível', () => {
    useGameStore.getState().setIdioma('en-US')
    render(<PortalPrompt portal={{ ...portal, disponivel: false }} />)

    expect(screen.getByRole('status', { name: 'Portal to Creation' })).toHaveTextContent(
      'Coming soon',
    )
    expect(screen.getByRole('status')).not.toHaveTextContent('Press E or Enter')
  })

  it('não renderiza quando não há portal detectado', () => {
    render(<PortalPrompt portal={null} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
