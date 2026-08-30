import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { Suspense, useEffect, useMemo } from 'react'
import type { Cenario3DMapa } from '../../../mapas/types'
import { liberarCenario3D, prepararCenario3D } from './prepararCenario3D'

export interface Cenario3DRegiaoProps {
  cenario?: Cenario3DMapa
}

function Cenario3DCarregado({ cenario }: { cenario: Cenario3DMapa }) {
  const { scene } = useGLTF(cenario.arquivo)
  const clone = useMemo(() => prepararCenario3D(scene), [scene])
  const escala = typeof cenario.escala === 'number'
    ? [cenario.escala, cenario.escala, cenario.escala] as const
    : cenario.escala

  useEffect(
    () => () => {
      liberarCenario3D(clone)
      useGLTF.clear(cenario.arquivo)
    },
    [cenario.arquivo, clone],
  )

  const visual = (
    <primitive
      object={clone}
      position={cenario.posicao ? [...cenario.posicao] : undefined}
      rotation={cenario.rotacao ? [...cenario.rotacao] : undefined}
      scale={escala ? [...escala] : undefined}
    />
  )

  if (cenario.colisor === 'trimesh') {
    return (
      <RigidBody type="fixed" colliders="trimesh">
        {visual}
      </RigidBody>
    )
  }

  return visual
}

/** Loads only the complete environment owned by the active region. */
export function Cenario3DRegiao({ cenario }: Cenario3DRegiaoProps) {
  if (!cenario) return null

  return (
    <Suspense fallback={null}>
      <Cenario3DCarregado cenario={cenario} />
    </Suspense>
  )
}
