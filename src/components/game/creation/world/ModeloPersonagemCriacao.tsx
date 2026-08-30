import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Mesh, type Object3D, type Quaternion } from 'three'
import { clone as clonarEsqueleto } from 'three/addons/utils/SkeletonUtils.js'
import type { Ponto3D } from '../../../../mapas/types'

export type AnimacaoPersonagemCriacao = 'ovelha-idle' | 'humano-idle'

export interface ModeloPersonagemCriacaoProps {
  arquivo: string
  animacao: AnimacaoPersonagemCriacao
  escala: number | Ponto3D
}

function prepararClone(scene: Object3D) {
  const clone = clonarEsqueleto(scene)
  clone.traverse((objeto) => {
    if (objeto instanceof Mesh) {
      objeto.castShadow = true
      objeto.receiveShadow = true
    }
  })
  return clone
}

function escalaVetor(escala: number | Ponto3D): Ponto3D {
  return typeof escala === 'number'
    ? [escala, escala, escala]
    : escala
}

function OvelhaAnimada({
  arquivo,
  escala,
}: Omit<ModeloPersonagemCriacaoProps, 'animacao'>) {
  const { scene, animations } = useGLTF(arquivo)
  const clone = useMemo(() => prepararClone(scene), [scene])
  const { actions } = useAnimations(animations, clone)

  useEffect(() => {
    const idle = actions['Armature|Idle'] ?? Object.values(actions).find(Boolean)
    idle?.reset().fadeIn(0.2).play()
    return () => {
      idle?.fadeOut(0.15)
    }
  }, [actions])

  return <primitive object={clone} scale={escalaVetor(escala)} />
}

interface RigHumano {
  clone: Object3D
  spine: Object3D | null
  head: Object3D | null
  spineBase: Quaternion | null
  headBase: Quaternion | null
}

function prepararHumano(scene: Object3D): RigHumano {
  const clone = prepararClone(scene)
  const bracoEsquerdo = clone.getObjectByName('upperarm_l')
  const bracoDireito = clone.getObjectByName('upperarm_r')
  const antebracoEsquerdo = clone.getObjectByName('lowerarm_l')
  const antebracoDireito = clone.getObjectByName('lowerarm_r')

  // The free base characters ship in a T-pose. Keep a relaxed, symmetrical
  // garden pose without baking or duplicating another heavyweight animation.
  bracoEsquerdo?.rotateZ(-Math.PI * 0.42)
  bracoDireito?.rotateZ(Math.PI * 0.42)
  antebracoEsquerdo?.rotateX(-0.18)
  antebracoDireito?.rotateX(-0.18)

  const spine = clone.getObjectByName('spine_03') ?? null
  const head = clone.getObjectByName('Head') ?? null

  return {
    clone,
    spine,
    head,
    spineBase: spine?.quaternion.clone() ?? null,
    headBase: head?.quaternion.clone() ?? null,
  }
}

function HumanoIdle({
  arquivo,
  escala,
}: Omit<ModeloPersonagemCriacaoProps, 'animacao'>) {
  const { scene } = useGLTF(arquivo)
  const rig = useMemo(() => prepararHumano(scene), [scene])

  useFrame(({ clock }) => {
    const tempo = clock.getElapsedTime()
    if (rig.spine && rig.spineBase) {
      rig.spine.quaternion.copy(rig.spineBase)
      rig.spine.rotateX(Math.sin(tempo * 1.15) * 0.012)
    }
    if (rig.head && rig.headBase) {
      rig.head.quaternion.copy(rig.headBase)
      rig.head.rotateY(Math.sin(tempo * 0.48) * 0.035)
    }
  })

  return <primitive object={rig.clone} scale={escalaVetor(escala)} />
}

export function ModeloPersonagemCriacao({
  arquivo,
  animacao,
  escala,
}: ModeloPersonagemCriacaoProps) {
  return animacao === 'ovelha-idle' ? (
    <OvelhaAnimada arquivo={arquivo} escala={escala} />
  ) : (
    <HumanoIdle arquivo={arquivo} escala={escala} />
  )
}
