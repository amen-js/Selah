import type { VersiculoPublico } from '../types/selah'
import type { NarracaoMissaoNoeId } from '../content/narrations'
import { createTtsController, type TtsEstado } from './tts'

const versiculo: VersiculoPublico = {
  passagemId: 'genesis-1-3',
  referencia: 'Gênesis 1:3',
  texto: 'E disse Deus: Haja luz. E houve luz.',
  idioma: 'pt-BR',
  versao: 'Demo',
  atribuicao: 'Texto de teste.',
}

const narracaoVazio = {
  narracaoId: 'criacao.vazio.inicial' as const,
  idioma: 'pt-BR' as const,
  textoFallback:
    'No começo, tudo era escuro e bem silencioso... Não havia nada aqui. Dê alguns passos e vamos descobrir o primeiro caminho juntos!',
}

const narracaoLuz = {
  narracaoId: 'criacao.luz.inicial' as const,
  idioma: 'pt-BR' as const,
  textoFallback:
    'Olhe só! Pontos brilhantes surgiram. Vamos seguir os sinais luminosos e ver a luz aparecer?',
}

const narracaoNoe = {
  narracaoId: 'noe.mission.line1' as NarracaoMissaoNoeId,
  idioma: 'pt-BR' as const,
  textoFallback:
    'Deus nos confiou uma grande missão: preparar um abrigo seguro para a vida.',
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

  it('requests approved narration by ID and language only', async () => {
    const audio = createAudio()
    const audioFactory = vi.fn((src: string) => {
      audio.src = src
      return audio
    })
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
      createObjectURL: () => 'blob:creation-guide',
      revokeObjectURL: vi.fn(),
      baseUrl: 'http://localhost:8787/',
    })

    await tts.narrar(narracaoVazio)

    expect(fetchFn).toHaveBeenCalledOnce()
    expect(fetchFn).toHaveBeenCalledWith(
      'http://localhost:8787/api/tts/narracao',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          narracaoId: narracaoVazio.narracaoId,
          idioma: narracaoVazio.idioma,
        }),
      }),
    )
    expect(JSON.parse(String(fetchFn.mock.calls[0]?.[1]?.body))).toEqual({
      narracaoId: narracaoVazio.narracaoId,
      idioma: narracaoVazio.idioma,
    })
    expect(audioFactory).toHaveBeenCalledWith('blob:creation-guide')
    expect(audio.play).toHaveBeenCalledOnce()
    expect(tts.estado()).toBe('playing')
  })

  it('requests approved NPC narration through the shared narration route', async () => {
    const audio = createAudio()
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([73, 68, 51]), {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      }),
    )
    const tts = createTtsController({
      synth: null,
      fetchFn,
      audioFactory: (src) => ({ ...audio, src }),
      createObjectURL: () => 'blob:noah-dialog',
      revokeObjectURL: vi.fn(),
      baseUrl: 'http://localhost:8787/',
    })

    await tts.narrar(narracaoNoe)

    expect(fetchFn).toHaveBeenCalledWith(
      'http://localhost:8787/api/tts/narracao',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          narracaoId: narracaoNoe.narracaoId,
          idioma: narracaoNoe.idioma,
        }),
      }),
    )
    expect(tts.estado()).toBe('playing')
  })

  it('falls back locally with the exact approved localized narration', async () => {
    const speak = vi.fn()
    const compatibleVoice = { name: 'Luciana Natural', lang: 'pt-BR' } as SpeechSynthesisVoice
    const synth = {
      speak,
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [compatibleVoice],
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

    await tts.narrar(narracaoVazio)

    expect(speak).toHaveBeenCalledWith(utterance)
    expect(utterance).toMatchObject({
      text: narracaoVazio.textoFallback,
      lang: narracaoVazio.idioma,
      voice: compatibleVoice,
    })
    expect(tts.estado()).toBe('fallback')
  })

  it('cancels scripture audio and stale guide requests before replacement narration', async () => {
    let resolveStaleGuide: ((response: Response) => void) | undefined
    let staleGuideSignal: AbortSignal | undefined
    const staleGuideResponse = new Promise<Response>((resolve) => {
      resolveStaleGuide = resolve
    })
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(new Uint8Array([1]), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' },
        }),
      )
      .mockImplementationOnce((_input, init) => {
        staleGuideSignal = init?.signal as AbortSignal | undefined
        return staleGuideResponse
      })
      .mockResolvedValueOnce(
        new Response(new Uint8Array([2]), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' },
        }),
      )
    const verseAudio = createAudio()
    const replacementAudio = createAudio()
    const audioFactory = vi
      .fn<(src: string) => ReturnType<typeof createAudio>>()
      .mockImplementationOnce((src) => {
        verseAudio.src = src
        return verseAudio
      })
      .mockImplementationOnce((src) => {
        replacementAudio.src = src
        return replacementAudio
      })
    const createObjectURL = vi
      .fn<(blob: Blob) => string>()
      .mockReturnValueOnce('blob:verse')
      .mockReturnValueOnce('blob:replacement-guide')
    const revokeObjectURL = vi.fn()
    const tts = createTtsController({
      synth: null,
      fetchFn,
      audioFactory,
      createObjectURL,
      revokeObjectURL,
    })

    await tts.falar(versiculo)
    const staleGuide = tts.narrar(narracaoVazio)

    expect(verseAudio.pause).toHaveBeenCalledOnce()
    expect(verseAudio.load).toHaveBeenCalledOnce()
    expect(verseAudio.src).toBe('')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:verse')
    expect(staleGuideSignal).toBeInstanceOf(AbortSignal)

    await tts.narrar(narracaoLuz)
    expect(staleGuideSignal?.aborted).toBe(true)

    resolveStaleGuide?.(
      new Response(new Uint8Array([3]), {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      }),
    )
    await staleGuide

    expect(audioFactory).toHaveBeenCalledTimes(2)
    expect(createObjectURL).toHaveBeenCalledTimes(2)
    expect(replacementAudio.play).toHaveBeenCalledOnce()
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
