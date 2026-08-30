import { render, screen } from '@testing-library/react'
import {
  criarEstadoProgressaoNoe,
  momentosNoe,
  processarEventoProgressaoNoe,
  type EstadoProgressaoNoe,
} from '../progression'
import { NoeObjectiveGuide } from './NoeObjectiveGuide'

describe('NoeObjectiveGuide', () => {
  it('mostra momento e objetivo atual sem revelar etapas futuras', () => {
    render(<NoeObjectiveGuide estado={criarEstadoProgressaoNoe()} visible />)

    expect(screen.getByText(/moment 1 of 9|momento 1 de 9/i)).toBeInTheDocument()
    expect(screen.getByRole('heading')).toHaveTextContent(/call|chamado/i)
    expect(screen.queryByText(/rainbow|arco-íris/i)).not.toBeInTheDocument()
  })

  it('atualiza a contagem de tábuas a partir do estado canônico', () => {
    let estado = processarEventoProgressaoNoe(criarEstadoProgressaoNoe(), {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.chamado.confirmado',
      unidadeId: 'chamado-noe',
    })
    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.madeira.coletada',
      unidadeId: 'tabua-1',
    })
    render(<NoeObjectiveGuide estado={estado} visible />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1')
    expect(screen.getByText(/plank|tábua/i)).toBeInTheDocument()
  })

  it('projeta 100% quando a jornada foi concluída e o progresso ativo foi limpo', () => {
    const estadoConcluido = {
      momentoAtualId: 'nova-terra-arco-iris',
      momentosConcluidos: momentosNoe.map(({ id }) => id),
      progressoMomentoAtual: [],
      concluida: true,
    } satisfies EstadoProgressaoNoe

    render(<NoeObjectiveGuide estado={estadoConcluido} visible />)

    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '5')
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '5')
  })

  it('não renderiza durante bloqueios de interface', () => {
    const { container } = render(
      <NoeObjectiveGuide estado={criarEstadoProgressaoNoe()} visible={false} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
