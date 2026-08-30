import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Group, Mesh } from 'three'

export interface LuzGuiaProps {
  posicao?: [number, number, number]
  reducedMotion?: boolean
}

export function LuzGuia({
  posicao = [0, 1.2, 0],
  reducedMotion = false,
}: LuzGuiaProps) {
  const groupRef = useRef<Group>(null)
  const haloRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    if (reducedMotion) {
      groupRef.current.position.set(posicao[0], posicao[1] + 0.05, posicao[2])
      if (haloRef.current) {
        haloRef.current.scale.setScalar(1.0)
      }
      return
    }

    const t = clock.getElapsedTime()
    const floatY = posicao[1] + Math.sin(t * 1.5) * 0.1
    groupRef.current.position.set(posicao[0], floatY, posicao[2])

    if (haloRef.current) {
      const pulse = 1.0 + Math.sin(t * 1.1) * 0.06
      haloRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} position={posicao}>
      {/* Inner core */}
      <mesh castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#fff6d6" />
      </mesh>

      {/* Outer soft halo */}
      <mesh ref={haloRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.36, 16, 16]} />
        <meshBasicMaterial
          color="#ffd56b"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Child-friendly warm guide light */}
      <pointLight
        color="#ffe699"
        intensity={1.35}
        distance={4.2}
        decay={2}
        castShadow={false}
      />
    </group>
  )
}
