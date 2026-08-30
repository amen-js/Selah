import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGameStore } from '../../../stores/gameStore'
import {
  PortalTransitionOverlay,
  type FasePortalTransicao,
} from './PortalTransitionOverlay'

describe('PortalTransitionOverlay', () => {
  it.each([
    ['saindo', 'Preparing your passage…'],
    ['trocando', 'Entering Creation…'],
    ['entrando', 'Welcome to Creation'],
  ] satisfies [FasePortalTransicao, string][])('exibe a fase %s traduzida', (fase, texto) => {
    useGameStore.getState().setIdioma('en-US')
    render(<PortalTransitionOverlay fase={fase} destino="criacao" />)

    expect(screen.getByRole('status', { name: 'Region transition' })).toHaveTextContent(texto)
  })

  it('não renderiza a fase inativa', () => {
    render(<PortalTransitionOverlay fase="inativo" />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
