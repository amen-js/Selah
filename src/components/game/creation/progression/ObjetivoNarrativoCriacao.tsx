import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { obterObjetivoZonaCriacao } from './interacao'
import type { MomentoCriacaoId } from './types'

const COR_OBJETIVO = '#ffe08a'

export interface ObjetivoNarrativoCriacaoProps {
  momentoId: MomentoCriacaoId
  enabled: boolean
}

/** A small in-world beacon for narrative zones; it has no collider or UI state. */
export function ObjetivoNarrativoCriacao({
  momentoId,
  enabled,
}: ObjetivoNarrativoCriacaoProps) {
  const grupoRef = useRef<Group>(null)
  const tempoRef = useRef(0)
  const objetivo = useMemo(
    () => obterObjetivoZonaCriacao(momentoId),
    [momentoId],
  )

  useFrame((_, delta) => {
    const grupo = grupoRef.current
    if (!grupo || !enabled || !objetivo) return

    tempoRef.current += delta
    grupo.rotation.y += delta * 0.7
    grupo.position.y =
      objetivo.posicao[1] + 0.08 + Math.sin(tempoRef.current * 2) * 0.08
    const escala = 1 + Math.sin(tempoRef.current * 2.4) * 0.08
    grupo.scale.setScalar(escala)
  })

  if (!objetivo) return null

  return (
    <group
      ref={grupoRef}
      name={`objetivo-criacao-${objetivo.id}`}
      position={[
        objetivo.posicao[0],
        objetivo.posicao[1] + 0.08,
        objetivo.posicao[2],
      ]}
      visible={enabled}
    >
      <pointLight color={COR_OBJETIVO} intensity={1.2} distance={5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.74, 48]} />
        <meshBasicMaterial
          color={COR_OBJETIVO}
          transparent
          opacity={0.68}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.16, 0.36, 12]} />
        <meshBasicMaterial
          color={COR_OBJETIVO}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
