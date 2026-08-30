import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { Mesh, type Object3D } from 'three'
import { clone as clonarEsqueleto } from 'three/addons/utils/SkeletonUtils.js'
import type { Ponto3D } from '../../../../mapas/types'

export type AnimacaoPersonagemCriacao =
  | 'ovelha-idle'
  | 'adao-idle'
  | 'eva-idle'

import { PersonagemEden } from './PersonagemEden'

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

export function ModeloPersonagemCriacao({
  arquivo,
  animacao,
  escala,
}: ModeloPersonagemCriacaoProps) {
  return animacao === 'ovelha-idle' ? (
    <OvelhaAnimada arquivo={arquivo} escala={escala} />
  ) : (
    <group scale={escalaVetor(escala)}>
      <PersonagemEden personagem={animacao === 'adao-idle' ? 'adao' : 'eva'} />
    </group>
  )
}
