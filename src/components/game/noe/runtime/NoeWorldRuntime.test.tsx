import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useGameStore } from '../../../../stores/gameStore'
import type { ColetaveisRegiaoProps } from '../../region/ColetaveisRegiao'
import type { PortaisRegiaoProps } from '../../portals/PortaisRegiao'
import type { CanteiroNoeProps } from '../world/types'
import { NoeWorldRuntime } from './NoeWorldRuntime'

vi.mock('../world', () => ({
  CanteiroNoe: ({ momentoAtualId, onCandidatoChange }: CanteiroNoeProps) => (
    <section>
      <output data-testid="momento-noe">{momentoAtualId}</output>
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            id: 'tarefa-noe-chamado',
            acaoId: 'noe.chamado.confirmado',
            unidadeId: 'chamado-noe',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 300,
            estado: 'disponivel',
          })
        }
      >
        aproximar tarefa
      </button>
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            id: 'tarefa-noe-fenda-casco-1',
            acaoId: 'noe.betume.aplicado',
            unidadeId: 'fenda-casco-1',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 300,
            estado: 'disponivel',
          })
        }
      >
        aproximar vedação
      </button>
    </section>
  ),
}))

vi.mock('../../region', () => ({
  ColetaveisRegiao: ({
    coletaveis,
    onColetavelProximo,
  }: ColetaveisRegiaoProps) => (
    <section>
      <output data-testid="coletaveis-noe">
        {coletaveis.map(({ passagemId }) => passagemId).join(',')}
      </output>
      <button
        type="button"
        onClick={() => onColetavelProximo?.(coletaveis[0] ?? null)}
      >
        aproximar Selah
      </button>
    </section>
  ),
}))

vi.mock('../../portals', () => ({
  PortaisRegiao: ({
    portais,
    onPortalProximo,
    onPortalAcionavel,
  }: PortaisRegiaoProps) => (
    <button
      type="button"
      onClick={() => {
        onPortalProximo?.(portais[0] ?? null)
        onPortalAcionavel?.(portais[0] ?? null)
      }}
    >
      aproximar portal
    </button>
  ),
}))

const coletaveis = [
  {
    id: 'selah-m2',
    historiaId: 'noe',
    passagemId: 'genesis-6-14',
    posicao: [8, 1, 1] as const,
  },
  {
    id: 'selah-m5',
    historiaId: 'noe',
    passagemId: 'genesis-6-19',
    posicao: [24, 1, 14] as const,
  },
]

const portais = [
  {
    id: 'portal-noe-hub',
    destino: 'hub' as const,
    posicao: [30, 0, 42] as const,
    raioAtivacao: 1.5,
  },
]

function renderRuntime({
  onPortalAcionado = vi.fn(),
  onBlocoConcluido = vi.fn(),
  onVedacaoSolicitada = vi.fn(),
} = {}) {
  return {
    onPortalAcionado,
    onBlocoConcluido,
    onVedacaoSolicitada,
    ...render(
      <NoeWorldRuntime
        coletaveis={coletaveis}
        portais={portais}
        posicaoJogadorRef={{ current: { x: 0, y: 0, z: 0 } }}
        enabled
        reducedMotion={false}
        onPortalProximo={vi.fn()}
        onPortalAcionado={onPortalAcionado}
        onInteracaoProxima={vi.fn()}
        onBlocoConcluido={onBlocoConcluido}
        onVedacaoSolicitada={onVedacaoSolicitada}
      />,
    ),
  }
}

describe('NoeWorldRuntime', () => {
  beforeEach(() => useGameStore.getState().apagarProgresso())

  it('mantém Selahs futuros invisíveis e prioriza tarefa sobre portal', async () => {
    const { onPortalAcionado } = renderRuntime()

    expect(screen.getByTestId('coletaveis-noe')).toHaveTextContent('')
    fireEvent.click(screen.getByRole('button', { name: 'aproximar portal' }))
    fireEvent.click(screen.getByRole('button', { name: 'aproximar tarefa' }))
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(screen.getByTestId('momento-noe')).toHaveTextContent(
        'coleta-vedacao',
      ),
    )
    expect(onPortalAcionado).not.toHaveBeenCalled()
  })

  it('só registra uma fenda depois que a atividade tátil confirma a cobertura', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: ['chamado-canteiro'],
        progressoMomentoAtual: [
          {
            acaoId: 'noe.madeira.coletada',
            unidadesConcluidas: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
          },
          {
            acaoId: 'noe.rampa.reparada',
            unidadesConcluidas: ['rampa-principal'],
          },
        ],
      },
    })
    const { onVedacaoSolicitada } = renderRuntime()

    fireEvent.click(screen.getByRole('button', { name: 'aproximar vedação' }))
    fireEvent.keyDown(window, { code: 'KeyE' })

    expect(onVedacaoSolicitada).toHaveBeenCalledTimes(1)
    expect(
      useGameStore
        .getState()
        .checkpointNoe?.progressoMomentoAtual.some(
          ({ acaoId }) => acaoId === 'noe.betume.aplicado',
        ),
    ).toBe(false)

    act(() => onVedacaoSolicitada.mock.calls[0][0].concluir())

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        expect.arrayContaining([
          {
            acaoId: 'noe.betume.aplicado',
            unidadesConcluidas: ['fenda-casco-1'],
          },
        ]),
      ),
    )
  })

  it('expõe só o Selah final de M2 e publica o handoff canônico para M3', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: ['chamado-canteiro'],
        progressoMomentoAtual: [
          {
            acaoId: 'noe.madeira.coletada',
            unidadesConcluidas: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
          },
          {
            acaoId: 'noe.rampa.reparada',
            unidadesConcluidas: ['rampa-principal'],
          },
          {
            acaoId: 'noe.betume.aplicado',
            unidadesConcluidas: [
              'fenda-casco-1',
              'fenda-casco-2',
              'fenda-casco-3',
            ],
          },
        ],
      },
    })
    const { onBlocoConcluido } = renderRuntime()

    expect(screen.getByTestId('coletaveis-noe')).toHaveTextContent(
      'genesis-6-14',
    )
    expect(screen.getByTestId('coletaveis-noe')).not.toHaveTextContent(
      'genesis-6-19',
    )
    fireEvent.click(screen.getByRole('button', { name: 'aproximar Selah' }))

    act(() =>
      useGameStore.setState({ selahsConcluidos: ['genesis-6-14'] }),
    )
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(screen.getByTestId('momento-noe')).toHaveTextContent(
        'estoque-mantimentos',
      ),
    )
    expect(onBlocoConcluido).toHaveBeenLastCalledWith(true)
    expect(screen.getByTestId('coletaveis-noe')).toHaveTextContent('')
    expect(useGameStore.getState().selahAtivo).toBeNull()
  })
})
