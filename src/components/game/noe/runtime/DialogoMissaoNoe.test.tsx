import { fireEvent, render, screen } from '@testing-library/react'
import { DialogoMissaoNoe } from './DialogoMissaoNoe'

describe('DialogoMissaoNoe', () => {
  it('só conclui a missão após as três falas', () => {
    const onConcluir = vi.fn()
    render(
      <DialogoMissaoNoe onConcluir={onConcluir} onCancelar={vi.fn()} />,
    )

    const continuar = () =>
      screen.getByRole('button', { name: /continue|continuar/i })

    fireEvent.click(continuar())
    expect(onConcluir).not.toHaveBeenCalled()
    fireEvent.click(continuar())
    expect(onConcluir).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getByRole('button', {
        name: /begin the mission|começar a missão|comenzar la misión/i,
      }),
    )

    expect(onConcluir).toHaveBeenCalledTimes(1)
  })

  it('permite ouvir depois sem concluir o checkpoint', () => {
    const onConcluir = vi.fn()
    const onCancelar = vi.fn()
    render(
      <DialogoMissaoNoe
        onConcluir={onConcluir}
        onCancelar={onCancelar}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /listen later|ouvir depois|escuchar después/i,
      }),
    )
    expect(onCancelar).toHaveBeenCalledTimes(1)
    expect(onConcluir).not.toHaveBeenCalled()
  })
})
