import type { VersiculoPublico } from '../types/selah'

export type TtsEstado =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'fallback'
  | 'error'

type TtsListener = (estado: TtsEstado) => void

type LocalSpeech = Pick<
  SpeechSynthesis,
  'speak' | 'pause' | 'resume' | 'cancel' | 'getVoices'
>

type AudioPlayer = Pick<
  HTMLAudioElement,
  'play' | 'pause' | 'load' | 'currentTime' | 'src' | 'onended' | 'onerror'
>

export interface TtsController {
  suportado: boolean
  estado: () => TtsEstado
  assinar: (listener: TtsListener) => () => void
  falar: (versiculo: VersiculoPublico) => Promise<void>
  pausar: () => void
  retomar: () => void
  cancelar: () => void
}

interface TtsControllerOptions {
  synth?: LocalSpeech | null
  fetchFn?: typeof fetch | null
  audioFactory?: ((src: string) => AudioPlayer) | null
  createObjectURL?: ((blob: Blob) => string) | null
  revokeObjectURL?: ((url: string) => void) | null
  utteranceFactory?: ((texto: string) => SpeechSynthesisUtterance) | null
  baseUrl?: string
}

const vozScore = (voz: SpeechSynthesisVoice, idioma: string): number => {
  const lang = voz.lang.toLowerCase()
  const alvo = idioma.toLowerCase()
  const base = alvo.split('-')[0]
  const qualidade = /natural|neural|enhanced|premium/i.test(voz.name) ? 100 : 0
  const correspondencia = lang === alvo ? 20 : lang.split('-')[0] === base ? 10 : 0
  return qualidade + correspondencia
}

const selecionarVoz = (
  synth: LocalSpeech,
  idioma: string,
): SpeechSynthesisVoice | null => {
  const base = idioma.toLowerCase().split('-')[0]
  try {
    return (
      synth
        .getVoices()
        .filter((voz) => voz.lang.toLowerCase().split('-')[0] === base)
        .sort((a, b) => vozScore(b, idioma) - vozScore(a, idioma))[0] ?? null
    )
  } catch {
    return null
  }
}

export const createTtsController = (options: TtsControllerOptions = {}): TtsController => {
  const synth =
    options.synth === undefined
      ? typeof window !== 'undefined' && 'speechSynthesis' in window
        ? window.speechSynthesis
        : null
      : options.synth
  const fetchFn =
    options.fetchFn === undefined
      ? typeof fetch === 'function'
        ? fetch
        : null
      : options.fetchFn
  const audioFactory =
    options.audioFactory === undefined
      ? typeof Audio === 'function'
        ? (src: string) => new Audio(src)
        : null
      : options.audioFactory
  const createObjectURL =
    options.createObjectURL === undefined
      ? typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? (blob: Blob) => URL.createObjectURL(blob)
        : null
      : options.createObjectURL
  const revokeObjectURL =
    options.revokeObjectURL === undefined
      ? typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function'
        ? (url: string) => URL.revokeObjectURL(url)
        : null
      : options.revokeObjectURL
  const utteranceFactory =
    options.utteranceFactory === undefined
      ? typeof SpeechSynthesisUtterance === 'function'
        ? (texto: string) => new SpeechSynthesisUtterance(texto)
        : null
      : options.utteranceFactory
  const baseUrl = (options.baseUrl ?? import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  const neuralDisponivel = Boolean(
    fetchFn && audioFactory && createObjectURL && revokeObjectURL,
  )
  const localDisponivel = Boolean(synth && utteranceFactory)
  const suportado = neuralDisponivel || localDisponivel
  const listeners = new Set<TtsListener>()

  let estadoAtual: TtsEstado = 'idle'
  let operacao = 0
  let modo: 'neural' | 'local' | null = null
  let versiculoAtual: VersiculoPublico | null = null
  let abortController: AbortController | null = null
  let audio: AudioPlayer | null = null
  let audioUrl: string | null = null

  const definirEstado = (estado: TtsEstado) => {
    if (estadoAtual === estado) return
    estadoAtual = estado
    for (const listener of listeners) listener(estado)
  }

  const liberarAudio = () => {
    const atual = audio
    audio = null
    if (atual) {
      atual.onended = null
      atual.onerror = null
      atual.pause()
      atual.src = ''
      atual.load()
    }
    if (audioUrl && revokeObjectURL) {
      revokeObjectURL(audioUrl)
      audioUrl = null
    }
  }

  const iniciarFallback = (versiculo: VersiculoPublico, idOperacao: number) => {
    if (idOperacao !== operacao) return
    liberarAudio()
    if (!synth || !utteranceFactory) {
      modo = null
      definirEstado('error')
      return
    }

    try {
      synth.cancel()
      const fala = utteranceFactory(versiculo.texto)
      fala.lang = versiculo.idioma
      fala.rate = 1.02
      fala.pitch = 1.05
      fala.voice = selecionarVoz(synth, versiculo.idioma)
      fala.onend = () => {
        if (idOperacao !== operacao || modo !== 'local') return
        modo = null
        definirEstado('idle')
      }
      fala.onerror = () => {
        if (idOperacao !== operacao || modo !== 'local') return
        modo = null
        definirEstado('error')
      }
      modo = 'local'
      synth.speak(fala)
      definirEstado('fallback')
    } catch {
      modo = null
      definirEstado('error')
    }
  }

  const cancelar = () => {
    operacao += 1
    abortController?.abort()
    abortController = null
    liberarAudio()
    synth?.cancel()
    modo = null
    versiculoAtual = null
    definirEstado('idle')
  }

  const falar = async (versiculo: VersiculoPublico): Promise<void> => {
    cancelar()
    versiculoAtual = versiculo
    const idOperacao = operacao

    if (!suportado) {
      definirEstado('error')
      return
    }
    if (!neuralDisponivel || !fetchFn || !audioFactory || !createObjectURL) {
      iniciarFallback(versiculo, idOperacao)
      return
    }

    definirEstado('loading')
    abortController = new AbortController()
    const signal = abortController.signal

    try {
      const response = await fetchFn(`${baseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          accept: 'audio/mpeg',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          passagemId: versiculo.passagemId,
          idioma: versiculo.idioma,
        }),
        signal,
      })
      if (idOperacao !== operacao) return
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
      if (!response.ok || !contentType.startsWith('audio/')) throw new Error('invalid-audio')

      const blob = await response.blob()
      if (idOperacao !== operacao) return
      if (blob.size === 0) throw new Error('empty-audio')

      abortController = null
      audioUrl = createObjectURL(blob)
      const player = audioFactory(audioUrl)
      audio = player
      modo = 'neural'
      player.onended = () => {
        if (idOperacao !== operacao || modo !== 'neural') return
        liberarAudio()
        modo = null
        definirEstado('idle')
      }
      player.onerror = () => {
        if (idOperacao !== operacao || modo !== 'neural') return
        modo = null
        iniciarFallback(versiculo, idOperacao)
      }
      await player.play()
      if (idOperacao !== operacao) return
      definirEstado('playing')
    } catch {
      if (idOperacao !== operacao || signal.aborted) return
      abortController = null
      modo = null
      iniciarFallback(versiculo, idOperacao)
    }
  }

  const pausar = () => {
    if (estadoAtual === 'playing' && modo === 'neural' && audio) {
      audio.pause()
      definirEstado('paused')
      return
    }
    if (estadoAtual === 'fallback' && modo === 'local' && synth) {
      synth.pause()
      definirEstado('paused')
    }
  }

  const retomar = () => {
    if (estadoAtual !== 'paused') return
    if (modo === 'local' && synth) {
      synth.resume()
      definirEstado('fallback')
      return
    }
    if (modo === 'neural' && audio) {
      const idOperacao = operacao
      void audio.play().then(
        () => {
          if (idOperacao === operacao && modo === 'neural') definirEstado('playing')
        },
        () => {
          if (idOperacao === operacao && versiculoAtual) {
            modo = null
            iniciarFallback(versiculoAtual, idOperacao)
          }
        },
      )
    }
  }

  return {
    suportado,
    estado: () => estadoAtual,
    assinar: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    falar,
    pausar,
    retomar,
    cancelar,
  }
}

export const ttsController = createTtsController()
