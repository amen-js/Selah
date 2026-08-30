import { render, screen } from '@testing-library/react'

describe('frontend test harness', () => {
  it('renders React content in jsdom', () => {
    render(<p>Selah test ready</p>)

    expect(screen.getByText('Selah test ready')).toBeInTheDocument()
  })
})
