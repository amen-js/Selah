import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { Hud } from './Hud'

describe('Hud', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.setState({
      idioma: 'pt-BR',
      regiao: 'criacao',
      versiculosColetados: ['genesis-1-3'],
    })
  })

  it('shows the current region and collected passage count', () => {
    render(<Hud />)

    expect(screen.getByText('A Criação')).toBeInTheDocument()
    expect(screen.getByText('1 passagem')).toBeInTheDocument()
  })

  it('updates regions, plural copy and accessible actions with the language', () => {
    useGameStore.setState({ idioma: 'en-US', versiculosColetados: [] })
    render(<Hud />)

    expect(screen.getByText('Creation')).toBeInTheDocument()
    expect(screen.getByText('0 passages')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open journal' })).toBeInTheDocument()

    act(() => {
      useGameStore.setState({
        idioma: 'es-ES',
        versiculosColetados: ['one', 'two', 'three'],
      })
    })

    expect(screen.getByText('La Creación')).toBeInTheDocument()
    expect(screen.getByText('3 pasajes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir diario' })).toBeInTheDocument()
  })

  it.each([
    ['pt-BR', ['0 passagens', '1 passagem', '3 passagens']],
    ['en-US', ['0 passages', '1 passage', '3 passages']],
    ['es-ES', ['0 pasajes', '1 pasaje', '3 pasajes']],
  ] as const)('pluralizes zero, one and many passages in %s', (idioma, labels) => {
    useGameStore.setState({ idioma, versiculosColetados: [] })
    render(<Hud />)

    expect(screen.getByText(labels[0])).toBeInTheDocument()

    act(() => useGameStore.setState({ versiculosColetados: ['one'] }))
    expect(screen.getByText(labels[1])).toBeInTheDocument()

    act(() =>
      useGameStore.setState({ versiculosColetados: ['one', 'two', 'three'] }),
    )
    expect(screen.getByText(labels[2])).toBeInTheDocument()
  })

  it('opens each local panel from accessible controls', async () => {
    const user = userEvent.setup()
    render(<Hud />)

    await user.click(screen.getByRole('button', { name: 'Abrir diário' }))
    expect(useGameStore.getState().painelAberto).toBe('diario')

    await user.click(screen.getByRole('button', { name: 'Abrir métricas locais' }))
    expect(useGameStore.getState().painelAberto).toBe('metricas')

    await user.click(
      screen.getByRole('button', { name: 'Abrir configurações parentais' }),
    )
    expect(useGameStore.getState().painelAberto).toBe('configuracoes')
  })
})
