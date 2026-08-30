import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points } from 'three'
import { gerarPontosAmbienteVazio } from './configuracao'

export interface AmbienteVazioProps {
  reducedMotion?: boolean
}

const CONTAGEM = 48

export function AmbienteVazio({ reducedMotion = false }: AmbienteVazioProps) {
  const pointsRef = useRef<Points>(null)
  const pontosDef = useMemo(() => gerarPontosAmbienteVazio(CONTAGEM), [])

  const geometry = useMemo(() => {
    const arr = new Float32Array(CONTAGEM * 3)
    for (let i = 0; i < CONTAGEM; i++) {
      arr[i * 3] = pontosDef[i].x
      arr[i * 3 + 1] = pontosDef[i].y
      arr[i * 3 + 2] = pontosDef[i].z
    }
    const geom = new BufferGeometry()
    geom.setAttribute('position', new BufferAttribute(arr, 3))
    return geom
  }, [pontosDef])

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return

    const positionAttr = pointsRef.current.geometry.attributes
      .position as BufferAttribute
    const array = positionAttr.array as Float32Array

    for (let i = 0; i < CONTAGEM; i++) {
      const idx = i * 3
      const def = pontosDef[i]

      // Subtle upward drift
      let y = array[idx + 1] + def.velocidade * delta
      if (y > 5.5) {
        y = 0.3
      }
      array[idx + 1] = y

      // Subtle gentle horizontal wave
      array[idx] = def.x + Math.sin(y * 1.5 + def.fase) * 0.12
    }

    positionAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        color="#7a9cb8"
        transparent
        opacity={reducedMotion ? 0.22 : 0.28}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
