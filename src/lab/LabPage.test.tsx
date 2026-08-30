import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { TtsController } from '../services/tts'
import { useGameStore } from '../stores/gameStore'
import { LabPage } from './LabPage'

const criarTtsSemRede = (): TtsController => ({
  suportado: false,
  estado: () => 'idle',
  assinar: () => () => undefined,
  falar: vi.fn(),
  narrar: vi.fn(),
  pausar: vi.fn(),
  retomar: vi.fn(),
  cancelar: vi.fn(),
})

const avancarTempo = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('LabPage', () => {
  beforeEach(() => {
    useGameStore.getState().apagarProgresso()
    useGameStore.getState().setIdioma('pt-BR')
  })

  it('renders the UI laboratory without a 3D canvas', () => {
    const { container } = render(<LabPage />)

    expect(screen.getByText('Interface sem Canvas')).toBeInTheDocument()
    expect(screen.getByText('A Criação')).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('starts a complete mocked Selah from the controls', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.click(screen.getByRole('button', { name: 'Abrir Selah' }))

    await waitFor(() => expect(screen.getByText(/então Deus disse/i)).toBeInTheDocument())
    expect(useGameStore.getState().regiao).toBe('criacao')
  })

  it('switches to the approved fallback scenario', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Cenário' }),
      'fallback',
    )
    await user.click(screen.getByRole('button', { name: 'Abrir Selah' }))
    await user.click(
      await screen.findByRole('button', { name: 'Continuar para a pergunta' }),
    )

    expect(screen.getByText('Pergunta bíblica revisada')).toBeInTheDocument()
  })

  it('resets all local laboratory state', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ versiculosColetados: ['genesis-1-3'] })
    render(<LabPage />)

    await user.click(
      screen.getByRole('button', { name: 'Restaurar estado do laboratório' }),
    )

    expect(useGameStore.getState().versiculosColetados).toEqual([])
    expect(useGameStore.getState().regiao).toBe('criacao')
  })

  it('translates laboratory controls immediately while keeping fixture content intact', async () => {
    const user = userEvent.setup()
    render(<LabPage />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Idioma da interface' }),
      'en-US',
    )
    expect(screen.getByLabelText('Interface laboratory controls')).toBeInTheDocument()
    expect(screen.getByText('Selah Laboratory')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Selah' })).toBeInTheDocument()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Interface language' }),
      'es-ES',
    )
    expect(screen.getByLabelText('Controles del laboratorio de interfaz')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir Selah' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir Selah' }))
    expect(await screen.findByText(/então Deus disse/i)).toBeInTheDocument()
    expect(screen.getByText('Pasaje · Gênesis 1:3')).toBeInTheDocument()
  })

  it('switches Creation moments without mounting Canvas', async () => {
    vi.useFakeTimers()
    const tts = criarTtsSemRede()
    const { container } = render(<LabPage tts={tts} />)

    try {
      expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'No começo, tudo era escuro e bem silencioso',
      )
      await avancarTempo(4_000)
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Dê alguns passos e descubra o primeiro caminho.',
      )

      fireEvent.change(screen.getByRole('combobox', { name: 'Momento da Criação' }), {
        target: { value: 'luz' },
      })

      expect(screen.getByText('Momento 2 de 9')).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Você ouve isso? Algo maravilhoso está prestes a acontecer...',
      )
      await avancarTempo(3_999)
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Você ouve isso?',
      )
      expect(
        screen.getByRole('button', { name: 'Simular inatividade' }),
      ).toBeInTheDocument()
      await avancarTempo(1)
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Olhe só! Pontos brilhantes surgiram.',
      )
      await avancarTempo(4_000)
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Siga os sinais luminosos e aproxime-se da luz.',
      )
      expect(tts.narrar).not.toHaveBeenCalled()
      expect(container.querySelector('canvas')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('translates the current narrative line immediately in all three locales', async () => {
    vi.useFakeTimers()
    render(<LabPage tts={criarTtsSemRede()} />)

    try {
      fireEvent.change(screen.getByRole('combobox', { name: 'Momento da Criação' }), {
        target: { value: 'luz' },
      })
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Você ouve isso?',
      )

      fireEvent.change(screen.getByRole('combobox', { name: 'Idioma da interface' }), {
        target: { value: 'en-US' },
      })

      expect(screen.getByRole('combobox', { name: 'Creation moment' })).toHaveValue('luz')
      expect(screen.getByText('Moment 2 of 9')).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Voice Guide' })).toHaveTextContent(
        'Do you hear that? Something wonderful is about to happen...',
      )
      expect(
        screen.getByRole('button', { name: 'Simulate inactivity' }),
      ).toBeInTheDocument()

      fireEvent.change(screen.getByRole('combobox', { name: 'Interface language' }), {
        target: { value: 'es-ES' },
      })
      expect(screen.getByRole('status', { name: 'Voz Guía' })).toHaveTextContent(
        '¿Oyes eso? Algo maravilloso está a punto de suceder...',
      )
      expect(
        screen.getByRole('button', { name: 'Simular inactividad' }),
      ).toBeInTheDocument()
      await avancarTempo(4_000)
      expect(screen.getByRole('status', { name: 'Voz Guía' })).toHaveTextContent(
        '¡Mira! Aparecieron puntos brillantes.',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('resets the Creation moment and activity simulator to the void', async () => {
    vi.useFakeTimers()
    render(<LabPage tts={criarTtsSemRede()} />)

    try {
      const momentSelector = screen.getByRole('combobox', {
        name: 'Momento da Criação',
      })
      await avancarTempo(4_000)
      fireEvent.change(momentSelector, { target: { value: 'luz' } })
      await avancarTempo(8_000)
      fireEvent.click(screen.getByRole('button', { name: 'Simular inatividade' }))
      expect(screen.getByRole('button', { name: 'Retomar atividade' })).toBeInTheDocument()
      fireEvent.click(
        screen.getByRole('button', { name: 'Restaurar estado do laboratório' }),
      )

      expect(momentSelector).toHaveValue('vazio')
      expect(screen.getByText('Momento 1 de 9')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Simular inatividade' })).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        "E Deus disse: 'Haja luz!'",
      )
      await avancarTempo(4_000)
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'No começo, tudo era escuro e bem silencioso',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('resets inactivity and allows support to repeat in a new episode', async () => {
    vi.useFakeTimers()
    render(<LabPage tts={criarTtsSemRede()} />)

    try {
      await avancarTempo(4_000)
      fireEvent.click(screen.getByRole('button', { name: 'Simular inatividade' }))
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Siga devagarinho.',
      )

      await avancarTempo(4_000)
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Dê alguns passos e descubra o primeiro caminho.',
      )

      fireEvent.click(screen.getByRole('button', { name: 'Retomar atividade' }))
      fireEvent.click(screen.getByRole('button', { name: 'Simular inatividade' }))
      expect(screen.getByRole('status', { name: 'Voz Guia' })).toHaveTextContent(
        'Siga devagarinho.',
      )

      fireEvent.change(
        screen.getByRole('combobox', { name: 'Momento da Criação' }),
        { target: { value: 'luz' } },
      )
      expect(
        screen.getByRole('button', { name: 'Simular inatividade' }),
      ).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
