import { act, render, screen } from '@testing-library/react'
import { useGameStore } from '../../../../stores/gameStore'
import { NoeSliceStatus } from './NoeSliceStatus'

describe('NoeSliceStatus', () => {
  beforeEach(() => useGameStore.getState().setIdioma('pt-BR'))

  it('declara o fim do capítulo M1/M2 sem sugerir outra interação', () => {
    render(<NoeSliceStatus visible />)

    const status = screen.getByRole('status', {
      name: 'Capítulo do canteiro concluído',
    })
    expect(status).toHaveTextContent('O canteiro está pronto')
    expect(status).not.toHaveTextContent('E ou Enter')
  })

  it('acompanha o idioma e some fora do fim do slice', () => {
    const { rerender } = render(<NoeSliceStatus visible />)

    act(() => useGameStore.getState().setIdioma('en-US'))
    expect(screen.getByRole('status')).toHaveTextContent('The worksite is ready')

    rerender(<NoeSliceStatus visible={false} />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})
