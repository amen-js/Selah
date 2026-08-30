import { useFrame } from '@react-three/fiber'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  type MeshStandardMaterial,
} from 'three'
import { indiceMomentoCriacao } from '../progression/estado'
import type { MomentoCriacaoId } from '../progression/types'
import { criarMalhaTerrenoCriacao } from './terreno'

const COR_TERRENO_OCULTO = new Color('#111a18')
const COR_TERRENO_FORMADO = new Color('#6e965c')
const COR_TERRENO_EDEN = new Color('#79a960')

export interface TerrenoCriacaoProps {
  momentoId: MomentoCriacaoId
}

function criarGeometriaTerreno(
  vertices: Float32Array,
  indices: Uint32Array,
): BufferGeometry {
  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new BufferAttribute(vertices, 3))
  geometria.setIndex(new BufferAttribute(indices, 1))
  geometria.computeVertexNormals()
  geometria.computeBoundingSphere()
  return geometria
}

/** One shared low-poly surface keeps the rendered ground aligned with Rapier. */
export function TerrenoCriacao({ momentoId }: TerrenoCriacaoProps) {
  const materialRef = useRef<MeshStandardMaterial>(null)
  const malha = useMemo(() => criarMalhaTerrenoCriacao(), [])
  const geometria = useMemo(
    () => criarGeometriaTerreno(malha.vertices, malha.indices),
    [malha],
  )
  const mundoFormado = indiceMomentoCriacao(momentoId) >= 2
  const jardimRevelado = indiceMomentoCriacao(momentoId) >= 6

  useEffect(() => () => geometria.dispose(), [geometria])

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return

    const alvoCor = jardimRevelado
      ? COR_TERRENO_EDEN
      : mundoFormado
        ? COR_TERRENO_FORMADO
        : COR_TERRENO_OCULTO
    material.color.lerp(alvoCor, Math.min(1, delta * 2.4))
    material.opacity +=
      ((mundoFormado ? 1 : 0.22) - material.opacity) *
      Math.min(1, delta * 2.4)
  })

  return (
    <RigidBody type="fixed" colliders={false}>
      <TrimeshCollider
        args={[malha.vertices, malha.indices]}
        friction={1}
      />
      <mesh geometry={geometria} receiveShadow>
        <meshStandardMaterial
          ref={materialRef}
          color={COR_TERRENO_OCULTO}
          roughness={0.96}
          transparent
          opacity={0.22}
        />
      </mesh>
      {mundoFormado && (
        <mesh position={[-16, -0.08, -7]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.8, 48]} />
          <meshStandardMaterial
            color="#58a9c2"
            emissive="#1e5367"
            emissiveIntensity={0.25}
            roughness={0.28}
            metalness={0.05}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </RigidBody>
  )
}
