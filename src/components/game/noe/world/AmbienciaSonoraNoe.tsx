import { useEffect, useMemo, useRef } from 'react'
import type { EstadoProgressaoNoe } from '../progression/types'
import {
  projetarAmbienciaSonoraNoe,
  type ProjecaoAmbienciaSonoraNoe,
} from './ambienciaSonora'

export interface AmbienciaSonoraNoeProps {
  estado: EstadoProgressaoNoe
  enabled: boolean
}

interface MotorAmbienciaSonoraNoe {
  contexto: AudioContext
  fonteVento: AudioBufferSourceNode
  fonteChuva: AudioBufferSourceNode
  ganhoVento: GainNode
  ganhoChuva: GainNode
}

interface WindowComAudioContextSafari extends Window {
  webkitAudioContext?: typeof AudioContext
}

function criarBufferRuido(
  contexto: AudioContext,
  sementeInicial: number,
  suavizar: boolean,
): AudioBuffer {
  const duracaoSegundos = 2
  const buffer = contexto.createBuffer(
    1,
    contexto.sampleRate * duracaoSegundos,
    contexto.sampleRate,
  )
  const dados = buffer.getChannelData(0)
  let semente = sementeInicial >>> 0
  let amostraSuave = 0

  for (let indice = 0; indice < dados.length; indice += 1) {
    semente = (Math.imul(semente, 1_664_525) + 1_013_904_223) >>> 0
    const ruidoBranco = (semente / 4_294_967_296) * 2 - 1
    amostraSuave = amostraSuave * 0.985 + ruidoBranco * 0.015
    dados[indice] = suavizar ? amostraSuave * 2.8 : ruidoBranco * 0.72
  }

  return buffer
}

function criarFonteEmLoop(
  contexto: AudioContext,
  buffer: AudioBuffer,
): AudioBufferSourceNode {
  const fonte = contexto.createBufferSource()
  fonte.buffer = buffer
  fonte.loop = true
  return fonte
}

function criarMotorAmbienciaSonoraNoe(): MotorAmbienciaSonoraNoe | null {
  if (typeof window === 'undefined') return null

  const janela = window as WindowComAudioContextSafari
  const ConstrutorAudioContext =
    window.AudioContext ?? janela.webkitAudioContext ?? null
  if (!ConstrutorAudioContext) return null

  const contexto = new ConstrutorAudioContext()
  const ganhoMestre = contexto.createGain()
  const ganhoVento = contexto.createGain()
  const ganhoChuva = contexto.createGain()
  const filtroVento = contexto.createBiquadFilter()
  const filtroChuva = contexto.createBiquadFilter()
  const fonteVento = criarFonteEmLoop(
    contexto,
    criarBufferRuido(contexto, 7_131, true),
  )
  const fonteChuva = criarFonteEmLoop(
    contexto,
    criarBufferRuido(contexto, 14_267, false),
  )

  ganhoMestre.gain.value = 0.55
  ganhoVento.gain.value = 0
  ganhoChuva.gain.value = 0
  filtroVento.type = 'lowpass'
  filtroVento.frequency.value = 620
  filtroVento.Q.value = 0.7
  filtroChuva.type = 'bandpass'
  filtroChuva.frequency.value = 1_900
  filtroChuva.Q.value = 0.45

  fonteVento.connect(filtroVento).connect(ganhoVento).connect(ganhoMestre)
  fonteChuva.connect(filtroChuva).connect(ganhoChuva).connect(ganhoMestre)
  ganhoMestre.connect(contexto.destination)
  fonteVento.start()
  fonteChuva.start()

  return {
    contexto,
    fonteVento,
    fonteChuva,
    ganhoVento,
    ganhoChuva,
  }
}

function aplicarVolumeComFade(
  parametro: AudioParam,
  volume: number,
  agora: number,
  duracaoFadeMs: number,
) {
  const fim = agora + duracaoFadeMs / 1_000

  if (typeof parametro.cancelAndHoldAtTime === 'function') {
    parametro.cancelAndHoldAtTime(agora)
  } else {
    const volumeAtual = parametro.value
    parametro.cancelScheduledValues(agora)
    parametro.setValueAtTime(volumeAtual, agora)
  }
  parametro.linearRampToValueAtTime(volume, fim)
}

function aplicarProjecaoSonora(
  motor: MotorAmbienciaSonoraNoe,
  projecao: ProjecaoAmbienciaSonoraNoe,
) {
  const agora = motor.contexto.currentTime
  aplicarVolumeComFade(
    motor.ganhoVento.gain,
    projecao.volumeVento,
    agora,
    projecao.duracaoFadeMs,
  )
  aplicarVolumeComFade(
    motor.ganhoChuva.gain,
    projecao.volumeChuva,
    agora,
    projecao.duracaoFadeMs,
  )
}

function encerrarMotorAmbienciaSonoraNoe(motor: MotorAmbienciaSonoraNoe) {
  motor.ganhoVento.gain.cancelScheduledValues(motor.contexto.currentTime)
  motor.ganhoChuva.gain.cancelScheduledValues(motor.contexto.currentTime)
  motor.ganhoVento.gain.value = 0
  motor.ganhoChuva.gain.value = 0

  for (const fonte of [motor.fonteVento, motor.fonteChuva]) {
    try {
      fonte.stop()
    } catch {
      // A browser may already have stopped a source while closing the context.
    }
    fonte.disconnect()
  }

  void motor.contexto.close().catch(() => undefined)
}

/**
 * Quiet procedural ambience. Audio is created only inside a user gesture, so
 * entering Noah never forces autoplay or emits browser permission warnings.
 */
export function AmbienciaSonoraNoe({
  estado,
  enabled,
}: AmbienciaSonoraNoeProps) {
  const motorRef = useRef<MotorAmbienciaSonoraNoe | null>(null)
  const projecao = useMemo(
    () => projetarAmbienciaSonoraNoe(estado, enabled),
    [enabled, estado],
  )
  const projecaoRef = useRef(projecao)

  useEffect(() => {
    projecaoRef.current = projecao
    const motor = motorRef.current
    if (!motor || motor.contexto.state !== 'running') return
    aplicarProjecaoSonora(motor, projecao)
  }, [projecao])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    if (motorRef.current?.contexto.state === 'running') return

    let ouvindo = true
    const removerDesbloqueio = () => {
      if (!ouvindo) return
      ouvindo = false
      window.removeEventListener('pointerdown', desbloquear, true)
      window.removeEventListener('keydown', desbloquear, true)
      window.removeEventListener('touchstart', desbloquear, true)
    }
    const desbloquear = () => {
      const motor = motorRef.current ?? criarMotorAmbienciaSonoraNoe()
      if (!motor) {
        removerDesbloqueio()
        return
      }

      motorRef.current = motor
      removerDesbloqueio()
      void motor.contexto
        .resume()
        .then(() => aplicarProjecaoSonora(motor, projecaoRef.current))
        .catch(() => undefined)
    }

    window.addEventListener('pointerdown', desbloquear, true)
    window.addEventListener('keydown', desbloquear, true)
    window.addEventListener('touchstart', desbloquear, {
      capture: true,
      passive: true,
    })

    return removerDesbloqueio
  }, [enabled])

  useEffect(
    () => () => {
      const motor = motorRef.current
      motorRef.current = null
      if (motor) encerrarMotorAmbienciaSonoraNoe(motor)
    },
    [],
  )

  return null
}
