import { fireEvent, render, screen } from '@testing-library/react'

import { useGameStore } from '../../stores/gameStore'
import { ParentalPause } from './ParentalPause'

describe('ParentalPause', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays hidden while parental pause is inactive', () => {
    render(<ParentalPause />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the pause when the pointer is released early', () => {
    useGameStore.setState({ pausaParentalAtiva: true })
    render(<ParentalPause />)
    const button = screen.getByRole('button', {
      name: 'Manter pressionado para um responsável liberar a exploração',
    })

    fireEvent.pointerDown(button)
    vi.advanceTimersByTime(2_000)
    fireEvent.pointerUp(button)
    vi.advanceTimersByTime(2_000)

    expect(useGameStore.getState().pausaParentalAtiva).toBe(true)
  })

  it('releases after a continuous three-second pointer hold', () => {
    useGameStore.setState({ pausaParentalAtiva: true })
    render(<ParentalPause />)

    fireEvent.pointerDown(
      screen.getByRole('button', {
        name: 'Manter pressionado para um responsável liberar a exploração',
      }),
    )
    vi.advanceTimersByTime(3_000)

    expect(useGameStore.getState().pausaParentalAtiva).toBe(false)
  })

  it('supports holding Enter from the keyboard', () => {
    useGameStore.setState({ pausaParentalAtiva: true })
    render(<ParentalPause />)
    const button = screen.getByRole('button', {
      name: 'Manter pressionado para um responsável liberar a exploração',
    })

    fireEvent.keyDown(button, { key: 'Enter' })
    vi.advanceTimersByTime(3_000)

    expect(useGameStore.getState().pausaParentalAtiva).toBe(false)
  })

  it('renders the safety instructions in the selected language', () => {
    useGameStore.setState({ idioma: 'en-US', pausaParentalAtiva: true })
    render(<ParentalPause />)

    expect(
      screen.getByRole('dialog', {
        name: 'A moment with someone who cares for you',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Hold for a parent or guardian to unlock exploration',
      }),
    ).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Waiting for a parent or guardian',
    )
  })
})
