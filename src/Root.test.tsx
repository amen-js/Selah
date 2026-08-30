import { render, screen } from '@testing-library/react'

import { Root } from './Root'

vi.mock('./App', () => ({
  default: () => <div>Jogo principal</div>,
}))

describe('Root', () => {
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
