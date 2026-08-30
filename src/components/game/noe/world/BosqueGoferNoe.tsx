import { Clone, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import type { Ponto3D } from '../../../../mapas/types'
import { instanciasBosqueGoferNoe } from './cenografia'

const URL_ARVORE_GOFER =
  '/models/creation/shared/kenney/tree_default.glb' as const

function ArvoreGoferFallback() {
  return (
    <group>
      <mesh castShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.45, 8]} />
        <meshStandardMaterial color="#765038" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.75, 0]} scale={[0.82, 1.05, 0.82]}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color="#52764b" roughness={1} />
      </mesh>
    </group>
  )
}

function ModeloArvoreGofer() {
  const { scene } = useGLTF(URL_ARVORE_GOFER)
  return <Clone object={scene} castShadow receiveShadow />
}

function ArvoreGofer({
  posicao,
  rotacaoY,
  escala,
}: {
  posicao: Ponto3D
  rotacaoY: number
  escala: number
}) {
  return (
    <group
      position={[...posicao]}
      rotation={[0, rotacaoY, 0]}
      scale={escala}
    >
      <Suspense fallback={<ArvoreGoferFallback />}>
        <ModeloArvoreGofer />
      </Suspense>
    </group>
  )
}

/**
 * A visual-only tree belt around the valley. It reuses the already documented
 * Kenney CC0 tree and stays outside the central playable route, so authored
 * foliage can never create hidden or snag-prone collision.
 */
export function BosqueGoferNoe() {
  return (
    <group
      name="bosque-gofer-noe"
      userData={{ colisor: 'nenhum', origem: 'kenney-cc0-reutilizado' }}
    >
      {instanciasBosqueGoferNoe.map(
        ([x, y, z, rotacaoY, escala], indice) => (
          <ArvoreGofer
            key={`arvore-gofer-${indice + 1}`}
            posicao={[x, y, z]}
            rotacaoY={rotacaoY}
            escala={escala}
          />
        ),
      )}
    </group>
  )
}
