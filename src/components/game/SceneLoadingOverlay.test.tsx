import { fireEvent, render, screen } from '@testing-library/react'

import { useGameStore } from '../../stores/gameStore'
import { SceneLoadingOverlay } from './SceneLoadingOverlay'

describe('SceneLoadingOverlay', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('presents bounded accessible progress without exposing asset paths', () => {
    render(<SceneLoadingOverlay state="loading" progress={46.7} />)

    expect(
      screen.getByRole('heading', { name: 'O mundo está despertando' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Preparação do mundo' })).toHaveAttribute(
      'aria-valuenow',
      '47',
    )
    expect(screen.getByText('47%')).toBeInTheDocument()
    expect(screen.queryByText(/\.glb|\/models\//i)).not.toBeInTheDocument()
  })

  it('clamps invalid progress values to a safe percentage', () => {
    const { rerender } = render(<SceneLoadingOverlay state="loading" progress={-20} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

    rerender(<SceneLoadingOverlay state="loading" progress={180} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('offers a translated recovery action after an error', () => {
    const onRetry = vi.fn()
    useGameStore.getState().setIdioma('en-US')

    render(<SceneLoadingOverlay state="error" progress={0} onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'The garden needs another moment' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})

