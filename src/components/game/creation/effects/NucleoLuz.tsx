import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, Group, Mesh } from 'three'

export interface NucleoLuzProps {
  posicao?: [number, number, number]
  reducedMotion?: boolean
}

export function NucleoLuz({
  posicao = [0, 1.8, 0],
  reducedMotion = false,
}: NucleoLuzProps) {
  const groupRef = useRef<Group>(null)
  const ring1Ref = useRef<Mesh>(null)
  const ring2Ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return

    if (ring1Ref.current) {
      ring1Ref.current.rotation.y += 0.18 * delta
      ring1Ref.current.rotation.x += 0.12 * delta
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= 0.14 * delta
      ring2Ref.current.rotation.z += 0.16 * delta
    }
  })

  return (
    <group ref={groupRef} position={posicao}>
      {/* Central radiant core */}
      <mesh castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#fff4cf" />
      </mesh>

      {/* Inner glow envelope */}
      <mesh castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.8, 20, 20]} />
        <meshBasicMaterial
          color="#ffd875"
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>

      {/* Concentric orbital light rings */}
      <mesh
        ref={ring1Ref}
        rotation={[Math.PI / 4, 0, 0]}
        castShadow={false}
        receiveShadow={false}
      >
        <ringGeometry args={[0.9, 1.1, 32]} />
        <meshBasicMaterial
          color="#ffb84d"
          transparent
          opacity={0.4}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={ring2Ref}
        rotation={[-Math.PI / 4, Math.PI / 6, 0]}
        castShadow={false}
        receiveShadow={false}
      >
        <ringGeometry args={[1.2, 1.38, 32]} />
        <meshBasicMaterial
          color="#ffd56b"
          transparent
          opacity={0.3}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Gentle localized revelation point light */}
      <pointLight
        color="#fff0bd"
        intensity={1.85}
        distance={12}
        decay={2}
        castShadow={false}
      />
    </group>
  )
}
