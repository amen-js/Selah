import type { Idioma } from '../types/selah'

export interface TtsController {
  suportado: boolean
  falar: (texto: string, idioma: Idioma) => void
  pausar: () => void
  cancelar: () => void
}

export const createTtsController = (
  synth: Pick<SpeechSynthesis, 'speak' | 'pause' | 'cancel'> | null = typeof window !== 'undefined' &&
  'speechSynthesis' in window
    ? window.speechSynthesis
    : null,
): TtsController => {
  const suportado =
    synth !== null &&
    typeof SpeechSynthesisUtterance !== 'undefined'

  return {
    suportado,
    falar: (texto, idioma) => {
      if (!suportado || !synth) return
      synth.cancel()
      const fala = new SpeechSynthesisUtterance(texto)
      fala.lang = idioma
      synth.speak(fala)
    },
    pausar: () => {
      if (suportado && synth) synth.pause()
    },
    cancelar: () => {
      if (suportado && synth) synth.cancel()
    },
  }
}

export const ttsController = createTtsController()
