import { Howl } from 'howler'
import { useEffect, useRef } from 'react'

import { useGameStore } from '../stores/gameStore'

const SELAH_AUDIO_SRC = '/audio/selah-choir.mp3'
const FADE_IN_MS = 900
const FADE_OUT_MS = 650
const DUCK_FADE_MS = 250
const SELAH_VOLUME = 0.7
const NARRATION_VOLUME = 0.18

export function useSelahAudio() {
  const selahAtivo = useGameStore((state) => Boolean(state.selahAtivo))
  const narracaoAtiva = useGameStore((state) => state.narracaoAtiva)
  const audioRef = useRef<Howl>(null)
  const soundIdRef = useRef<number>(null)
  const stopTimerRef = useRef<number>(null)

  useEffect(() => {
    const audio = new Howl({
      src: [SELAH_AUDIO_SRC],
      preload: true,
      volume: 0,
    })

    audioRef.current = audio

    return () => {
      if (stopTimerRef.current !== null) {
        window.clearTimeout(stopTimerRef.current)
      }
      audio.unload()
      audioRef.current = null
      soundIdRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    if (selahAtivo) {
      const activeSoundId = soundIdRef.current
      const targetVolume = narracaoAtiva ? NARRATION_VOLUME : SELAH_VOLUME
      if (activeSoundId !== null && audio.playing(activeSoundId)) {
        const currentVolume = audio.volume()
        audio.fade(currentVolume, targetVolume, DUCK_FADE_MS, activeSoundId)
        return
      }

      const soundId = audio.play()
      soundIdRef.current = soundId
      audio.volume(0, soundId)
      audio.fade(0, targetVolume, FADE_IN_MS, soundId)
      return
    }

    const soundId = soundIdRef.current
    if (soundId === null) return

    const currentVolume = audio.volume()
    audio.fade(currentVolume, 0, FADE_OUT_MS, soundId)
    stopTimerRef.current = window.setTimeout(() => {
      if (soundIdRef.current !== soundId) return

      audio.stop(soundId)
      soundIdRef.current = null
      stopTimerRef.current = null
    }, FADE_OUT_MS)
  }, [narracaoAtiva, selahAtivo])
}
