import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGameStore } from '../../stores/gameStore'
import { DialogBox } from './DialogBox'

describe('DialogBox', () => {
  it('discloses automation and closes the shared dialog state', async () => {
    const user = userEvent.setup()
    useGameStore.getState().setDialogoAberto(true)

    render(<DialogBox personagem="Lumi" mensagem="Vamos descobrir esta passagem juntos." />)

    expect(screen.getByText('Lumi')).toBeInTheDocument()
    expect(screen.getByText(/personagem virtual automatizado/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuar exploração' }))
    expect(useGameStore.getState().dialogoAberto).toBe(false)
  })
})
