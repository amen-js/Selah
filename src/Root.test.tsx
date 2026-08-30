import { render, screen } from '@testing-library/react'

import { Root } from './Root'

describe('Root', () => {
  it('renders the laboratory only for the development route', () => {
    render(<Root pathname="/lab" isDev />)

    expect(screen.getByText(/nenhum canvas 3D/i)).toBeInTheDocument()
  })

  it('does not expose the laboratory route in production', () => {
    render(<Root pathname="/lab" isDev={false} />)

    expect(screen.queryByText(/nenhum canvas 3D/i)).not.toBeInTheDocument()
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })
})
