import { act, render, screen } from '@testing-library/react'

import {
  buscarNarracaoCriacao,
  type NarracaoCriacaoId,
} from '../../content/creationNarrations'
import { useGameStore } from '../../stores/gameStore'
import type { Idioma } from '../../types/selah'
import { momentosCriacao } from './creation/progression'
import type { SnapshotProgressaoCriacao } from './creation/progression'
import { CreationGuide } from './CreationGuide'

const snapshotVazio: SnapshotProgressaoCriacao = {
  momento: momentosCriacao[0],
  estado: {
    momentoAtualId: 'vazio',
    momentosConcluidos: [],
    concluida: false,
  },
}

const casosNarrativos: Array<{
  narracaoId: NarracaoCriacaoId
  idioma: Idioma
}> = [
  { narracaoId: 'criacao.vazio.inicial', idioma: 'pt-BR' },
  { narracaoId: 'criacao.vazio.apoio', idioma: 'pt-BR' },
  { narracaoId: 'criacao.vazio.transicao', idioma: 'en-US' },
]

const snapshotConcluido: SnapshotProgressaoCriacao = {
  momento: momentosCriacao[momentosCriacao.length - 1],
  estado: {
    momentoAtualId: 'fruto-escolha',
    momentosConcluidos: momentosCriacao.map(({ id }) => id),
    concluida: true,
  },
}

describe('CreationGuide', () => {
  beforeEach(() => {
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('renders the localized objective as an accessible polite status', () => {
    render(
      <CreationGuide snapshot={snapshotVazio} exploracaoAtiva />,
    )

    const guide = screen.getByRole('status', { name: 'Voz Guia' })
    expect(guide).toHaveAttribute('aria-live', 'polite')
    expect(guide).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getByText('O vazio')).toBeInTheDocument()
    expect(
      screen.getByText('Dê alguns passos e descubra o primeiro caminho.'),
    ).toBeInTheDocument()
  })

  it.each(casosNarrativos)(
    'renders the resolved $narracaoId line in $idioma without controls',
    ({ narracaoId, idioma }) => {
      useGameStore.getState().setIdioma(idioma)
      const linha = buscarNarracaoCriacao(narracaoId, idioma)
      expect(linha).toBeDefined()
      if (!linha) throw new Error('A narração aprovada deveria existir')

      const { container } = render(
        <CreationGuide
          snapshot={snapshotVazio}
          exploracaoAtiva
          linha={linha}
        />,
      )

      expect(screen.getByRole('status')).toHaveTextContent(linha.texto)
      expect(
        screen.queryByText('Dê alguns passos e descubra o primeiro caminho.'),
      ).not.toBeInTheDocument()
      expect(
        container.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]',
        ),
      ).toHaveLength(0)
    },
  )

  it('renders nothing while exploration is inactive, even with a narrative line', () => {
    const linha = buscarNarracaoCriacao('criacao.vazio.inicial', 'pt-BR')
    expect(linha).toBeDefined()

    render(
      <CreationGuide
        snapshot={snapshotVazio}
        exploracaoAtiva={false}
        linha={linha}
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('replaces the stale tree instruction with the journey conclusion', () => {
    render(
      <CreationGuide snapshot={snapshotConcluido} exploracaoAtiva />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'A Criação foi revelada',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Tudo ficou cheio de vida.',
    )
    expect(screen.queryByText(/Caminhe até a árvore especial/i)).toBeNull()
  })

  it('has no interactive controls and reacts immediately to language changes', () => {
    const { container } = render(
      <CreationGuide snapshot={snapshotVazio} exploracaoAtiva />,
    )

    expect(
      container.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]',
      ),
    ).toHaveLength(0)

    act(() => useGameStore.getState().setIdioma('en-US'))
    expect(
      screen.getByRole('status', { name: 'Voice Guide' }),
    ).toHaveTextContent('Take a few steps and discover the first path.')

    act(() => useGameStore.getState().setIdioma('es-ES'))
    expect(
      screen.getByRole('status', { name: 'Voz Guía' }),
    ).toHaveTextContent('Da unos pasos y descubre el primer camino.')
  })
})
