import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useGameStore } from '../../../../stores/gameStore'
import type { ColetaveisRegiaoProps } from '../../region/ColetaveisRegiao'
import type { PortaisRegiaoProps } from '../../portals/PortaisRegiao'
import type { CanteiroNoeProps } from '../world/types'
import type { CampoAnimaisNoeProps } from '../world/CampoAnimaisNoe'
import type { HabitatsArcaNoeProps } from '../world/HabitatsArcaNoe'
import type { MantimentosArcaNoeProps } from '../world/MantimentosArcaNoe'
import type { AbrigoTempestadeNoeProps } from '../world/AbrigoTempestadeNoe'
import type { NovaTerraNoeProps } from '../world/NovaTerraNoe'
import type { PombaEsperancaNoeProps } from '../world/PombaEsperancaNoe'
import { NoeWorldRuntime } from './NoeWorldRuntime'

vi.mock('../world', () => ({
  AbrigoTempestadeNoe: ({
    estado,
    onCandidatoChange,
    onConcluirUnidade,
  }: AbrigoTempestadeNoeProps) =>
    estado.momentoAtualId === 'fechamento-porta' ? (
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            id: 'abrigo-chamado-final-noe',
            momentoId: 'fechamento-porta',
            acaoId: 'noe.abrigo.chamado-ouvido',
            unidadeId: 'chamado-final-noe',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 360,
            etapa: 1,
            ordem: 1,
            tipoVisual: 'chamado',
            distancia: 0,
            estado: 'disponivel',
            acionar: () =>
              onConcluirUnidade(
                'noe.abrigo.chamado-ouvido',
                'chamado-final-noe',
              ),
          })
        }
      >
        ouvir chamado final
      </button>
    ) : null,
  AmbienciaSonoraNoe: () => null,
  AtmosferaNoe: () => null,
  CampoAnimaisNoe: ({
    momentoAtualId,
    onCandidatoChange,
    onConcluirUnidade,
  }: CampoAnimaisNoeProps) =>
    momentoAtualId === 'conducao-animais' ? (
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            tipo: 'tarefa',
            id: 'campo-aves',
            acaoId: 'noe.animais.aves-guiadas',
            unidadeId: 'aves-trilha-sementes',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 340,
            distancia: 0,
            comportamento: 'trilha-sementes',
            acionar: () =>
              onConcluirUnidade(
                'noe.animais.aves-guiadas',
                'aves-trilha-sementes',
              ),
          })
        }
      >
        guiar aves
      </button>
    ) : null,
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
  MantimentosArcaNoe: ({
    momentoAtualId,
    onCandidatoChange,
    onConcluirUnidade,
  }: MantimentosArcaNoeProps) =>
    momentoAtualId === 'estoque-mantimentos' ? (
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            id: 'mantimento-entrega-feno',
            acaoId: 'noe.mantimento.feno-armazenado',
            unidadeId: 'feno-estabulos-inferiores',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 320,
            etapaInteracao: 'entrega',
            mantimentoId: 'feno',
            acionar: () =>
              onConcluirUnidade(
                'noe.mantimento.feno-armazenado',
                'feno-estabulos-inferiores',
              ),
          })
        }
      >
      entregar feno
      </button>
    ) : null,
  HabitatsArcaNoe: ({
    momentoAtualId,
    onCandidatoChange,
    onConcluirUnidade,
  }: HabitatsArcaNoeProps) =>
    momentoAtualId === 'acomodacao-animais' ? (
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            tipo: 'tarefa',
            id: 'habitat-elefantes',
            acaoId: 'noe.habitat.grandes-animais-preparado',
            unidadeId: 'nivel-inferior-elefantes',
            familiaId: 'elefantes',
            etapaInteracao: 'encaixar-habitat',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 350,
            distancia: 0,
            acionar: () =>
              onConcluirUnidade(
                'noe.habitat.grandes-animais-preparado',
                'nivel-inferior-elefantes',
              ),
          })
        }
      >
      acomodar elefantes
      </button>
    ) : null,
  PombaEsperancaNoe: ({
    estado,
    onCandidatoChange,
    onConcluirUnidade,
  }: PombaEsperancaNoeProps) =>
    estado.momentoAtualId === 'retorno-pomba' ? (
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            tipo: 'tarefa',
            id: 'pomba-envio',
            acaoId: 'noe.pomba.enviada',
            unidadeId: 'envio-janela-superior',
            posicao: [0, 0, 0],
            raio: 2,
            prioridade: 380,
            distancia: 0,
            etapa: 1,
            ordem: 1,
            acionar: () =>
              onConcluirUnidade(
                'noe.pomba.enviada',
                'envio-janela-superior',
              ),
          })
        }
      >
        enviar pomba
      </button>
    ) : null,
  NovaTerraNoe: ({
    estado,
    onCandidatoChange,
    onConcluirUnidade,
  }: NovaTerraNoeProps) =>
    estado.momentoAtualId === 'nova-terra-arco-iris' ? (
      <button
        type="button"
        onClick={() =>
          onCandidatoChange?.({
            tipo: 'tarefa',
            id: 'desembarque-aves',
            acaoId: 'noe.desembarque.aves',
            unidadeId: 'aves-desembarcadas-em-grupo',
            posicao: [0, 0, 0],
            posicaoDestino: [0, 0, 1],
            raio: 2,
            prioridade: 390,
            distancia: 0,
            etapa: 1,
            ordem: 1,
            tipoVisual: 'aves',
            acionar: () =>
              onConcluirUnidade(
                'noe.desembarque.aves',
                'aves-desembarcadas-em-grupo',
              ),
          })
        }
      >
        desembarcar aves
      </button>
    ) : null,
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
  onVedacaoSolicitada = vi.fn(),
} = {}) {
  return {
    onPortalAcionado,
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
    renderRuntime()

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
    expect(screen.getByTestId('coletaveis-noe')).toHaveTextContent('')
    expect(useGameStore.getState().selahAtivo).toBeNull()
  })

  it('encaminha uma entrega de M3 pelo mesmo árbitro de confirmação', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: ['chamado-canteiro', 'coleta-vedacao'],
        progressoMomentoAtual: [],
      },
    })
    renderRuntime()

    fireEvent.click(screen.getByRole('button', { name: 'entregar feno' }))
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        [
          {
            acaoId: 'noe.mantimento.feno-armazenado',
            unidadesConcluidas: ['feno-estabulos-inferiores'],
          },
        ],
      ),
    )
  })

  it('encaminha uma família inteira em M4 pelo árbitro único', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: [
          'chamado-canteiro',
          'coleta-vedacao',
          'estoque-mantimentos',
        ],
        progressoMomentoAtual: [],
      },
    })
    renderRuntime()

    fireEvent.click(screen.getByRole('button', { name: 'guiar aves' }))
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        [
          {
            acaoId: 'noe.animais.aves-guiadas',
            unidadesConcluidas: ['aves-trilha-sementes'],
          },
        ],
      ),
    )
  })

  it('encaminha o encaixe de habitat em M5 pelo árbitro único', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: [
          'chamado-canteiro',
          'coleta-vedacao',
          'estoque-mantimentos',
          'conducao-animais',
        ],
        progressoMomentoAtual: [],
      },
    })
    renderRuntime()

    fireEvent.click(
      screen.getByRole('button', { name: 'acomodar elefantes' }),
    )
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        [
          {
            acaoId: 'noe.habitat.grandes-animais-preparado',
            unidadesConcluidas: ['nivel-inferior-elefantes'],
          },
        ],
      ),
    )
  })

  it('encaminha a sequência segura de M6 pelo árbitro único', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: [
          'chamado-canteiro',
          'coleta-vedacao',
          'estoque-mantimentos',
          'conducao-animais',
          'acomodacao-animais',
        ],
        progressoMomentoAtual: [],
      },
    })
    renderRuntime()

    fireEvent.click(screen.getByRole('button', { name: 'ouvir chamado final' }))
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        [
          {
            acaoId: 'noe.abrigo.chamado-ouvido',
            unidadesConcluidas: ['chamado-final-noe'],
          },
        ],
      ),
    )
  })

  it('encaminha o envio da pomba em M8 pelo árbitro único', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: [
          'chamado-canteiro',
          'coleta-vedacao',
          'estoque-mantimentos',
          'conducao-animais',
          'acomodacao-animais',
          'fechamento-porta',
          'refugio-tempestade',
        ],
        progressoMomentoAtual: [],
      },
    })
    renderRuntime()

    fireEvent.click(screen.getByRole('button', { name: 'enviar pomba' }))
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        [
          {
            acaoId: 'noe.pomba.enviada',
            unidadesConcluidas: ['envio-janela-superior'],
          },
        ],
      ),
    )
  })

  it('encaminha o desembarque em M9 pelo árbitro único', async () => {
    useGameStore.setState({
      checkpointNoe: {
        versao: 1,
        momentosConcluidos: [
          'chamado-canteiro',
          'coleta-vedacao',
          'estoque-mantimentos',
          'conducao-animais',
          'acomodacao-animais',
          'fechamento-porta',
          'refugio-tempestade',
          'retorno-pomba',
        ],
        progressoMomentoAtual: [],
      },
    })
    renderRuntime()

    fireEvent.click(
      screen.getByRole('button', { name: 'desembarcar aves' }),
    )
    fireEvent.keyDown(window, { code: 'KeyE' })

    await waitFor(() =>
      expect(useGameStore.getState().checkpointNoe?.progressoMomentoAtual).toEqual(
        [
          {
            acaoId: 'noe.desembarque.aves',
            unidadesConcluidas: ['aves-desembarcadas-em-grupo'],
          },
        ],
      ),
    )
  })
})
