import { createTtsController } from './tts'

describe('createTtsController', () => {
  it('speaks, pauses and cancels through the Web Speech API', () => {
    const speak = vi.fn()
    const pause = vi.fn()
    const cancel = vi.fn()
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      function SpeechSynthesisUtterance(this: { text: string; lang: string }, text: string) {
        this.text = text
        this.lang = ''
      },
    )

    const tts = createTtsController({ speak, pause, cancel })
    expect(tts.suportado).toBe(true)

    tts.falar('Haja luz.', 'pt-BR')
    expect(cancel).toHaveBeenCalledOnce()
    expect(speak).toHaveBeenCalledOnce()
    expect(speak.mock.calls[0]?.[0]).toMatchObject({ text: 'Haja luz.', lang: 'pt-BR' })

    tts.pausar()
    tts.cancelar()
    expect(pause).toHaveBeenCalledOnce()
    expect(cancel).toHaveBeenCalledTimes(2)
  })

  it('is a no-op when speech synthesis is missing', () => {
    const tts = createTtsController(null)
    expect(tts.suportado).toBe(false)
    expect(() => tts.falar('oi', 'pt-BR')).not.toThrow()
  })
})
