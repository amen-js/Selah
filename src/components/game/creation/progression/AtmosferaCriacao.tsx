import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  MathUtils,
} from 'three'
import { obterMomentoAtualCriacao } from './estado'
import type {
  EstadoProgressaoCriacao,
  FaseCenarioCriacao,
  MomentoCriacaoId,
} from './types'

interface ConfiguracaoAtmosfera {
  fundo: string
  neblina: string
  neblinaInicio: number
  neblinaFim: number
  ceu: string
  solo: string
  hemisferio: number
  sol: string
  solIntensidade: number
}

const atmosferas: Record<FaseCenarioCriacao, ConfiguracaoAtmosfera> = {
  escuro: {
    fundo: '#07131f',
    neblina: '#07131f',
    neblinaInicio: 7,
    neblinaFim: 23,
    ceu: '#30445e',
    solo: '#020609',
    hemisferio: 0.5,
    sol: '#7690aa',
    solIntensidade: 0.32,
  },
  amanhecer: {
    fundo: '#5d8793',
    neblina: '#5d8793',
    neblinaInicio: 11,
    neblinaFim: 31,
    ceu: '#ffe1a6',
    solo: '#27433b',
    hemisferio: 1.35,
    sol: '#fff0bd',
    solIntensidade: 1.65,
  },
  'mundo-formado': {
    fundo: '#8fbfc8',
    neblina: '#8fbfc8',
    neblinaInicio: 15,
    neblinaFim: 38,
    ceu: '#fff0c4',
    solo: '#315b4a',
    hemisferio: 1.8,
    sol: '#fff2c7',
    solIntensidade: 2.15,
  },
  'mundo-verde': {
    fundo: '#a9d4c2',
    neblina: '#a9d4c2',
    neblinaInicio: 16,
    neblinaFim: 40,
    ceu: '#fff2c9',
    solo: '#3e6847',
    hemisferio: 2,
    sol: '#fff0b8',
    solIntensidade: 2.3,
  },
  'ciclo-celeste': {
    fundo: '#2e4069',
    neblina: '#2e4069',
    neblinaInicio: 13,
    neblinaFim: 36,
    ceu: '#8795ca',
    solo: '#17283b',
    hemisferio: 1.05,
    sol: '#c7cff4',
    solIntensidade: 0.75,
  },
  'mundo-vivo': {
    fundo: '#acd9c8',
    neblina: '#acd9c8',
    neblinaInicio: 17,
    neblinaFim: 42,
    ceu: '#fff0c4',
    solo: '#416a49',
    hemisferio: 2.1,
    sol: '#fff2c0',
    solIntensidade: 2.4,
  },
  jardim: {
    fundo: '#bddfc2',
    neblina: '#bddfc2',
    neblinaInicio: 18,
    neblinaFim: 44,
    ceu: '#fff5cf',
    solo: '#3f704c',
    hemisferio: 2.25,
    sol: '#ffe9a8',
    solIntensidade: 2.55,
  },
  humanidade: {
    fundo: '#c7dfc1',
    neblina: '#c7dfc1',
    neblinaInicio: 18,
    neblinaFim: 44,
    ceu: '#fff0c9',
    solo: '#506a44',
    hemisferio: 2.15,
    sol: '#ffdca0',
    solIntensidade: 2.35,
  },
  escolha: {
    fundo: '#9eb3a3',
    neblina: '#9eb3a3',
    neblinaInicio: 15,
    neblinaFim: 39,
    ceu: '#ead3b1',
    solo: '#3c4939',
    hemisferio: 1.55,
    sol: '#e8bd88',
    solIntensidade: 1.45,
  },
}

export interface AtmosferaCriacaoProps {
  momentoId: MomentoCriacaoId
}

/** Smooth scene lighting contract consumed by the future per-moment art chunks. */
export function AtmosferaCriacao({ momentoId }: AtmosferaCriacaoProps) {
  const fundoRef = useRef<Color>(null)
  const neblinaRef = useRef<Fog>(null)
  const hemisferioRef = useRef<HemisphereLight>(null)
  const solRef = useRef<DirectionalLight>(null)
  const estado = useMemo<EstadoProgressaoCriacao>(
    () => ({ momentoAtualId: momentoId, momentosConcluidos: [], concluida: false }),
    [momentoId],
  )
  const fase = obterMomentoAtualCriacao(estado).faseCenario
  const configuracao = atmosferas[fase]
  const fundoAlvo = useMemo(() => new Color(configuracao.fundo), [configuracao.fundo])
  const neblinaAlvo = useMemo(
    () => new Color(configuracao.neblina),
    [configuracao.neblina],
  )
  const ceuAlvo = useMemo(() => new Color(configuracao.ceu), [configuracao.ceu])
  const soloAlvo = useMemo(() => new Color(configuracao.solo), [configuracao.solo])
  const solAlvo = useMemo(() => new Color(configuracao.sol), [configuracao.sol])

  useFrame((_, delta) => {
    const suavidade = 1 - Math.exp(-2.4 * delta)
    fundoRef.current?.lerp(fundoAlvo, suavidade)

    const neblina = neblinaRef.current
    if (neblina) {
      neblina.color.lerp(neblinaAlvo, suavidade)
      neblina.near = MathUtils.damp(
        neblina.near,
        configuracao.neblinaInicio,
        2.4,
        delta,
      )
      neblina.far = MathUtils.damp(
        neblina.far,
        configuracao.neblinaFim,
        2.4,
        delta,
      )
    }

    const hemisferio = hemisferioRef.current
    if (hemisferio) {
      hemisferio.color.lerp(ceuAlvo, suavidade)
      hemisferio.groundColor.lerp(soloAlvo, suavidade)
      hemisferio.intensity = MathUtils.damp(
        hemisferio.intensity,
        configuracao.hemisferio,
        2.4,
        delta,
      )
    }

    const sol = solRef.current
    if (sol) {
      sol.color.lerp(solAlvo, suavidade)
      sol.intensity = MathUtils.damp(
        sol.intensity,
        configuracao.solIntensidade,
        2.4,
        delta,
      )
    }
  })

  return (
    <>
      <color ref={fundoRef} attach="background" args={[configuracao.fundo]} />
      <fog
        ref={neblinaRef}
        attach="fog"
        args={[
          configuracao.neblina,
          configuracao.neblinaInicio,
          configuracao.neblinaFim,
        ]}
      />
      <hemisphereLight
        ref={hemisferioRef}
        args={[configuracao.ceu, configuracao.solo, configuracao.hemisferio]}
      />
      <directionalLight
        ref={solRef}
        position={[8, 12, 5]}
        intensity={configuracao.solIntensidade}
        color={configuracao.sol}
      />
    </>
  )
}
