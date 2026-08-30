import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Group } from 'three'
import { gerarDefinicoesNuvens } from './configuracao'

export interface NuvensProps {
  reducedMotion?: boolean
}

export function Nuvens({ reducedMotion = false }: NuvensProps) {
  const groupRef = useRef<Group>(null)
  const definicoes = useMemo(() => gerarDefinicoesNuvens(), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const speedMultiplier = reducedMotion ? 0.05 : 1.0

    groupRef.current.children.forEach((child, i) => {
      const def = definicoes[i]
      if (!def) return

      child.position.x += def.velocidade * speedMultiplier * delta
      if (child.position.x > 36) {
        child.position.x = -36
      }
    })
  })

  return (
    <group ref={groupRef}>
      {definicoes.map((def, i) => (
        <group key={i} position={def.posicao} scale={def.escala}>
          {/* Central puff */}
          <mesh position={[0, 0, 0]} castShadow={false} receiveShadow={false}>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              transparent
              opacity={0.88}
              depthWrite={false}
            />
          </mesh>
          {/* Left puff */}
          <mesh position={[-0.7, -0.15, 0.1]} scale={[0.75, 0.7, 0.75]} castShadow={false} receiveShadow={false}>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
              color="#d6e5f0"
              roughness={0.9}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
          {/* Right puff */}
          <mesh position={[0.7, -0.1, -0.1]} scale={[0.8, 0.75, 0.8]} castShadow={false} receiveShadow={false}>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              transparent
              opacity={0.88}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
