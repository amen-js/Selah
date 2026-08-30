import { fireEvent, render, screen } from '@testing-library/react'
import {
  VedacaoBetume,
} from './VedacaoBetume'
import {
  SEGMENTOS_NECESSARIOS_VEDACAO,
  vedacaoBetumeConcluida,
} from './vedacao'

describe('VedacaoBetume', () => {
  it('só considera a cobertura suficiente após o limite canônico', () => {
    expect(
      vedacaoBetumeConcluida(
        new Set(Array.from({ length: SEGMENTOS_NECESSARIOS_VEDACAO - 1 }, (_, i) => i)),
      ),
    ).toBe(false)
    expect(
      vedacaoBetumeConcluida(
        new Set(Array.from({ length: SEGMENTOS_NECESSARIOS_VEDACAO }, (_, i) => i)),
      ),
    ).toBe(true)
  })

  it('não conclui tentativa parcial e oferece cada trecho ao teclado', () => {
    const onConcluir = vi.fn()
    render(
      <VedacaoBetume
        unidadeId="fenda-casco-1"
        onConcluir={onConcluir}
        onCancelar={vi.fn()}
      />,
    )

    const segmentos = screen.getAllByRole('button', {
      name: /crack section|trecho|tramo/i,
    })
    segmentos.slice(0, SEGMENTOS_NECESSARIOS_VEDACAO - 1).forEach((segmento) =>
      fireEvent.click(segmento),
    )

    const confirmar = screen.getByRole('button', {
      name: /keep brushing|continue pincelando|sigue pincelando/i,
    })
    expect(confirmar).toBeDisabled()
    fireEvent.click(confirmar)
    expect(onConcluir).not.toHaveBeenCalled()
  })

  it('conclui uma vez quando a cobertura necessária é confirmada', () => {
    const onConcluir = vi.fn()
    render(
      <VedacaoBetume
        unidadeId="fenda-casco-2"
        onConcluir={onConcluir}
        onCancelar={vi.fn()}
      />,
    )

    screen
      .getAllByRole('button', { name: /crack section|trecho|tramo/i })
      .slice(0, SEGMENTOS_NECESSARIOS_VEDACAO)
      .forEach((segmento) => fireEvent.click(segmento))

    fireEvent.click(
      screen.getByRole('button', {
        name: /finish sealing|finalizar vedação|terminar sellado/i,
      }),
    )
    expect(onConcluir).toHaveBeenCalledTimes(1)
  })

  it('cancela sem publicar progresso', () => {
    const onConcluir = vi.fn()
    const onCancelar = vi.fn()
    render(
      <VedacaoBetume
        unidadeId="fenda-casco-3"
        onConcluir={onConcluir}
        onCancelar={onCancelar}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /return to the world|voltar ao mundo|volver al mundo/i,
      }),
    )
    expect(onCancelar).toHaveBeenCalledTimes(1)
    expect(onConcluir).not.toHaveBeenCalled()
  })
})
