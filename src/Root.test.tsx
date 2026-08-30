import { act, render, screen } from '@testing-library/react'

import { useGameStore } from './stores/gameStore'
import { Root } from './Root'

vi.mock('./App', () => ({
  default: () => <div>Jogo principal</div>,
}))

describe('Root', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
    document.documentElement.lang = ''
    document.title = ''
    document.querySelector('meta[name="description"]')?.remove()
  })

  it('synchronizes document metadata whenever the shared language changes', () => {
    render(<Root pathname="/" isDev={false} />)

    expect(document.documentElement.lang).toBe('pt-BR')
    expect(document.title).toBe('Selah — Jornada bíblica 3D')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Selah — uma jornada bíblica 3D de exploração e reflexão.',
    )

    act(() => useGameStore.getState().setIdioma('es-ES'))

    expect(document.documentElement.lang).toBe('es-ES')
    expect(document.title).toBe('Selah — Aventura bíblica 3D')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Selah — una aventura bíblica 3D de exploración y reflexión.',
    )
  })

  it('renders the laboratory only for the development route', async () => {
    render(<Root pathname="/lab" isDev />)

    expect(await screen.findByText(/nenhum canvas 3D/i)).toBeInTheDocument()
  })

  it('does not expose the laboratory route in production', () => {
    render(<Root pathname="/lab" isDev={false} />)

    expect(screen.queryByText(/nenhum canvas 3D/i)).not.toBeInTheDocument()
    expect(screen.getByText('Jogo principal')).toBeInTheDocument()
  })
})
