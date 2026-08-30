import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, MeshStandardMaterial } from 'three'
import { portalDisponivel } from './proximidade'
import type { PortalMapa } from './types'

export interface PortalVisualProps {
  portal: PortalMapa
  ativo?: boolean
  indice?: number
  reducedMotion?: boolean
}

/** Portal emissivo, sem collider: a interação é resolvida por proximidade XZ. */
export function PortalVisual({
  portal,
  ativo = false,
  indice = 0,
  reducedMotion = false,
}: PortalVisualProps) {
  const grupoRef = useRef<Group>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  const disponivel = portalDisponivel(portal)
  const cor = portal.cor ?? '#8de7df'

  useFrame(({ clock }, delta) => {
    const grupo = grupoRef.current
    if (grupo) {
      if (reducedMotion) {
        grupo.rotation.y = 0
        grupo.position.y = portal.posicao[1]
      } else {
        grupo.rotation.y += delta * (disponivel ? 0.45 : 0.22)
        grupo.position.y =
          portal.posicao[1] + Math.sin(clock.elapsedTime * 1.4 + indice) * 0.08
      }
    }

    if (materialRef.current) {
      const intensidadeBase = disponivel ? 1.2 : 0.45
      materialRef.current.emissiveIntensity =
        intensidadeBase +
        (ativo ? 1.4 : 0) +
        (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 2) * 0.12)
    }
  })

  return (
    <group ref={grupoRef} position={portal.posicao}>
      <pointLight
        color={cor}
        intensity={disponivel ? (ativo ? 2.4 : 1.25) : 0.4}
        distance={disponivel ? 5 : 3}
      />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.08, 12, 40]} />
        <meshStandardMaterial
          ref={materialRef}
          color={cor}
          emissive={cor}
          emissiveIntensity={disponivel ? 1.2 : 0.45}
          transparent
          opacity={disponivel ? 0.9 : 0.5}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.72}>
        <torusGeometry args={[0.9, 0.025, 8, 32]} />
        <meshBasicMaterial color={cor} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}
