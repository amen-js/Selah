import type { VersiculoPublico } from '../types/selah'
import { createTtsController, type TtsEstado } from './tts'

const versiculo: VersiculoPublico = {
  passagemId: 'genesis-1-3',
  referencia: 'Gênesis 1:3',
  texto: 'E disse Deus: Haja luz. E houve luz.',
  idioma: 'pt-BR',
  versao: 'Demo',
  atribuicao: 'Texto de teste.',
}

const createAudio = () => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  src: '',
  onended: null as (() => void) | null,
  onerror: null as (() => void) | null,
})

describe('createTtsController', () => {
  it('plays, pauses, resumes and releases neural MP3 audio', async () => {
    const audio = createAudio()
    const audioFactory = vi.fn((src: string) => {
      audio.src = src
      return audio
    })
    const createObjectURL = vi.fn(() => 'blob:selah-tts')
    const revokeObjectURL = vi.fn()
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([73, 68, 51]), {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      }),
    )
    const tts = createTtsController({
      synth: null,
      fetchFn,
      audioFactory,
      createObjectURL,
      revokeObjectURL,
      baseUrl: 'http://localhost:8787/',
    })
    const estados: TtsEstado[] = []
    tts.assinar((estado) => estados.push(estado))

    await tts.falar(versiculo)

    expect(fetchFn).toHaveBeenCalledWith(
      'http://localhost:8787/api/tts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ passagemId: versiculo.passagemId, idioma: 'pt-BR' }),
      }),
    )
    expect(audioFactory).toHaveBeenCalledWith('blob:selah-tts')
    expect(audio.play).toHaveBeenCalledOnce()
    expect(tts.estado()).toBe('playing')

    tts.pausar()
    expect(audio.pause).toHaveBeenCalledOnce()
    expect(tts.estado()).toBe('paused')

    tts.retomar()
    await vi.waitFor(() => expect(tts.estado()).toBe('playing'))
    expect(audio.play).toHaveBeenCalledTimes(2)

    tts.cancelar()
    expect(tts.estado()).toBe('idle')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:selah-tts')
    expect(estados).toEqual(expect.arrayContaining(['loading', 'playing', 'paused', 'idle']))
  })

  it('falls back to the best local voice in the verse language', async () => {
    const speak = vi.fn()
    const pause = vi.fn()
    const resume = vi.fn()
    const cancel = vi.fn()
    const premiumVoice = { name: 'Luciana Natural', lang: 'pt-BR' } as SpeechSynthesisVoice
    const synth = {
      speak,
      pause,
      resume,
      cancel,
      getVoices: () => [
        { name: 'System English', lang: 'en-US' } as SpeechSynthesisVoice,
        { name: 'Maria', lang: 'pt-BR' } as SpeechSynthesisVoice,
        premiumVoice,
      ],
    }
    let utterance: SpeechSynthesisUtterance | null = null
    const tts = createTtsController({
      synth,
      fetchFn: vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 })),
      audioFactory: (src) => ({ ...createAudio(), src }),
      createObjectURL: () => 'blob:unused',
      revokeObjectURL: vi.fn(),
      utteranceFactory: (texto) => {
        utterance = {
          text: texto,
          lang: '',
          rate: 1,
          pitch: 1,
          voice: null,
          onend: null,
          onerror: null,
        } as unknown as SpeechSynthesisUtterance
        return utterance
      },
    })

    await tts.falar(versiculo)

    expect(tts.estado()).toBe('fallback')
    expect(speak).toHaveBeenCalledWith(utterance)
    expect(utterance).toMatchObject({
      text: versiculo.texto,
      lang: 'pt-BR',
      rate: 1.02,
      pitch: 1.05,
      voice: premiumVoice,
    })

    tts.pausar()
    expect(pause).toHaveBeenCalledOnce()
    expect(tts.estado()).toBe('paused')
    tts.retomar()
    expect(resume).toHaveBeenCalledOnce()
    expect(tts.estado()).toBe('fallback')

    const falaAtiva = speak.mock.calls[0]?.[0] as SpeechSynthesisUtterance
    falaAtiva.onend?.({} as SpeechSynthesisEvent)
    expect(tts.estado()).toBe('idle')
  })

  it('ignores a stale response after the passage language changes', async () => {
    let resolveFirst: ((response: Response) => void) | undefined
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve
    })
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(() => firstResponse)
      .mockResolvedValueOnce(
        new Response(new Uint8Array([2]), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' },
        }),
      )
    const audio = createAudio()
    const audioFactory = vi.fn((src: string) => ({ ...audio, src }))
    const tts = createTtsController({
      synth: null,
      fetchFn,
      audioFactory,
      createObjectURL: () => 'blob:current',
      revokeObjectURL: vi.fn(),
    })
    const englishVerse = { ...versiculo, texto: 'Let there be light.', idioma: 'en-US' as const }

    const first = tts.falar(versiculo)
    await tts.falar(englishVerse)
    resolveFirst?.(
      new Response(new Uint8Array([1]), {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      }),
    )
    await first

    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(audioFactory).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(fetchFn.mock.calls[1]?.[1]?.body))).toEqual({
      passagemId: versiculo.passagemId,
      idioma: 'en-US',
    })
    expect(tts.estado()).toBe('playing')
  })

  it('reports unsupported when neither neural nor local playback exists', async () => {
    const tts = createTtsController({
      synth: null,
      fetchFn: null,
      audioFactory: null,
      createObjectURL: null,
      revokeObjectURL: null,
      utteranceFactory: null,
    })

    expect(tts.suportado).toBe(false)
    await expect(tts.falar(versiculo)).resolves.toBeUndefined()
    expect(tts.estado()).toBe('error')
  })
})
