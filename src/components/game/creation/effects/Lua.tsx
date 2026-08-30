import { useRef } from 'react'
import { Group, Mesh } from 'three'

export interface LuaProps {
  posicao?: [number, number, number]
  reducedMotion?: boolean
}

export function Lua({
  posicao = [-14, 20, 16],
}: LuaProps) {
  const groupRef = useRef<Group>(null)
  const haloRef = useRef<Mesh>(null)

  return (
    <group ref={groupRef} position={posicao}>
      {/* Moon core disc */}
      <mesh castShadow={false} receiveShadow={false}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#eef4ff" depthWrite={false} />
      </mesh>

      {/* Cool serene halo */}
      <mesh ref={haloRef} position={[0, 0, -0.05]} castShadow={false} receiveShadow={false}>
        <circleGeometry args={[3.2, 32]} />
        <meshBasicMaterial
          color="#7899d4"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
