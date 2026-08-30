import { useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { EcctrlHandle } from 'ecctrl'
import { useMemo, useRef, type RefObject } from 'react'
import {
  Bone,
  Euler,
  Group,
  MathUtils,
  Mesh,
  Quaternion,
} from 'three'
import { clone as clonarEsqueleto } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { calcularPoseProcedural } from './poseProcedural'

const ARQUIVO_PERSONAGEM = '/models/characters/aj/aj.fbx'
const ESCALA_PERSONAGEM = 0.006
const ALTURA_BASE = -0.71

export interface RiggedPlayerProps {
  controller: RefObject<EcctrlHandle | null>
}

function agruparOssos(personagem: Group): Map<string, Bone[]> {
  const ossos = new Map<string, Bone[]>()

  personagem.traverse((objeto) => {
    if (!(objeto instanceof Bone)) return
    const grupo = ossos.get(objeto.name) ?? []
    grupo.push(objeto)
    ossos.set(objeto.name, grupo)
  })

  return ossos
}

/** Rigged AJ visual driven by the runtime state of the existing controller. */
export function RiggedPlayer({ controller }: RiggedPlayerProps) {
  const fonte = useFBX(ARQUIVO_PERSONAGEM)
  const grupoRef = useRef<Group>(null)
  const faseRef = useRef(0)
  const tempoRef = useRef(0)
  const pesoMovimentoRef = useRef(0)
  const pesoChaoRef = useRef(1)
  const intensidadeCorridaRef = useRef(0)
  const personagem = useMemo(() => {
    const clone = clonarEsqueleto(fonte) as Group
    clone.traverse((objeto) => {
      if (!(objeto instanceof Mesh)) return
      objeto.castShadow = true
      objeto.receiveShadow = true
      objeto.frustumCulled = false
    })
    return clone
  }, [fonte])
  const ossos = useMemo(() => agruparOssos(personagem), [personagem])
  const posesBase = useMemo(() => {
    const bases = new Map<Bone, Quaternion>()
    for (const grupo of ossos.values()) {
      for (const osso of grupo) bases.set(osso, osso.quaternion.clone())
    }
    return bases
  }, [ossos])
  const rotacaoAditiva = useMemo(() => new Quaternion(), [])
  const rotacaoAlvo = useMemo(() => new Quaternion(), [])
  const eulerAditivo = useMemo(() => new Euler(), [])

  useFrame((_, delta) => {
    const character = controller.current
    const grupo = grupoRef.current
    if (!character || !grupo) return

    tempoRef.current += delta
    const velocidadeHorizontal = Math.hypot(
      character.currLinVel.x,
      character.currLinVel.z,
    )
    const alvoMovimento = MathUtils.clamp((velocidadeHorizontal - 0.08) / 1.8, 0, 1)
    const alvoCorrida = character.runActive
      ? MathUtils.clamp((velocidadeHorizontal - 2.5) / 3.5, 0, 1)
      : 0
    pesoMovimentoRef.current = MathUtils.damp(
      pesoMovimentoRef.current,
      alvoMovimento,
      9,
      delta,
    )
    pesoChaoRef.current = MathUtils.damp(
      pesoChaoRef.current,
      character.isOnGround ? 1 : 0,
      character.isOnGround ? 16 : 10,
      delta,
    )
    intensidadeCorridaRef.current = MathUtils.damp(
      intensidadeCorridaRef.current,
      alvoCorrida,
      7,
      delta,
    )
    const cadencia = MathUtils.lerp(6.2, 10.5, intensidadeCorridaRef.current)
    faseRef.current = (
      faseRef.current + delta * cadencia * Math.max(0.18, pesoMovimentoRef.current)
    ) % (Math.PI * 2)

    const pose = calcularPoseProcedural({
      fase: faseRef.current,
      pesoMovimento: pesoMovimentoRef.current,
      pesoChao: pesoChaoRef.current,
      intensidadeCorrida: intensidadeCorridaRef.current,
      tempo: tempoRef.current,
    })
    const interpolacao = 1 - Math.exp(-11 * delta)
    const aplicarRotacao = (
      nome: string,
      x: number,
      y = 0,
      z = 0,
    ) => {
      for (const osso of ossos.get(nome) ?? []) {
        const base = posesBase.get(osso)
        if (!base) continue
        eulerAditivo.set(x, y, z)
        rotacaoAditiva.setFromEuler(eulerAditivo)
        rotacaoAlvo.copy(base).multiply(rotacaoAditiva)
        osso.quaternion.slerp(rotacaoAlvo, interpolacao)
      }
    }

    aplicarRotacao('mixamorigLeftArm', pose.bracoEsquerdoX)
    aplicarRotacao('mixamorigRightArm', pose.bracoDireitoX)
    aplicarRotacao('mixamorigLeftForeArm', 0, 0, pose.antebracoEsquerdoZ)
    aplicarRotacao('mixamorigRightForeArm', 0, 0, pose.antebracoDireitoZ)
    aplicarRotacao('mixamorigLeftUpLeg', pose.coxaEsquerdaX)
    aplicarRotacao('mixamorigRightUpLeg', pose.coxaDireitaX)
    aplicarRotacao('mixamorigLeftLeg', pose.joelhoEsquerdoX)
    aplicarRotacao('mixamorigRightLeg', pose.joelhoDireitoX)
    aplicarRotacao('mixamorigLeftFoot', pose.peEsquerdoX)
    aplicarRotacao('mixamorigRightFoot', pose.peDireitoX)
    aplicarRotacao('mixamorigSpine', pose.colunaX, 0, pose.colunaZ)
    aplicarRotacao('mixamorigHips', 0, 0, pose.quadrilZ)

    grupo.position.y = MathUtils.damp(
      grupo.position.y,
      ALTURA_BASE + pose.deslocamentoY,
      13,
      delta,
    )
  })

  return (
    <group
      ref={grupoRef}
      position={[0, ALTURA_BASE, 0]}
      scale={ESCALA_PERSONAGEM}
    >
      <primitive object={personagem} />
    </group>
  )
}

useFBX.preload(ARQUIVO_PERSONAGEM)
