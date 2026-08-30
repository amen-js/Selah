import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Group, Mesh } from 'three'

export interface SolProps {
  posicao?: [number, number, number]
  reducedMotion?: boolean
}

export function Sol({
  posicao = [14, 22, -16],
  reducedMotion = false,
}: SolProps) {
  const groupRef = useRef<Group>(null)
  const haloRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    // Billboard orientation towards camera (or fixed facing world center)
    if (reducedMotion) {
      if (haloRef.current) haloRef.current.scale.setScalar(1.0)
      return
    }

    const t = clock.getElapsedTime()
    if (haloRef.current) {
      const pulse = 1.0 + Math.sin(t * 0.5) * 0.02
      haloRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} position={posicao}>
      {/* Sun core disc */}
      <mesh castShadow={false} receiveShadow={false}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color="#fff7d6" depthWrite={false} />
      </mesh>

      {/* Sun warm outer halo */}
      <mesh ref={haloRef} position={[0, 0, -0.05]} castShadow={false} receiveShadow={false}>
        <circleGeometry args={[4.4, 32]} />
        <meshBasicMaterial
          color="#ffba52"
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
