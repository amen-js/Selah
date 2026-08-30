import { render, screen } from '@testing-library/react'
import {
  criarEstadoProgressaoNoe,
  processarEventoProgressaoNoe,
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

  it('não renderiza durante bloqueios de interface', () => {
    const { container } = render(
      <NoeObjectiveGuide estado={criarEstadoProgressaoNoe()} visible={false} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
