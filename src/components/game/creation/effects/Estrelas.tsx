import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
} from 'three'
import { gerarPontosEstrelas } from './configuracao'

export interface EstrelasProps {
  reducedMotion?: boolean
}

const CONTAGEM = 140
const PALETA_ESTRELAS = ['#ffeaa7', '#e8f0fe', '#dfd6f7']

export function Estrelas({ reducedMotion = false }: EstrelasProps) {
  const pointsRef = useRef<Points>(null)
  const estrelasDef = useMemo(() => gerarPontosEstrelas(CONTAGEM), [])

  const { geometry, baseColors } = useMemo(() => {
    const posArr = new Float32Array(CONTAGEM * 3)
    const colArr = new Float32Array(CONTAGEM * 3)
    const baseCol = new Float32Array(CONTAGEM * 3)
    const tempColor = new Color()

    for (let i = 0; i < CONTAGEM; i++) {
      const e = estrelasDef[i]
      posArr[i * 3] = e.x
      posArr[i * 3 + 1] = e.y
      posArr[i * 3 + 2] = e.z

      const hex = PALETA_ESTRELAS[i % PALETA_ESTRELAS.length]
      tempColor.set(hex).multiplyScalar(e.brilhoBase)

      colArr[i * 3] = tempColor.r
      colArr[i * 3 + 1] = tempColor.g
      colArr[i * 3 + 2] = tempColor.b

      baseCol[i * 3] = tempColor.r
      baseCol[i * 3 + 1] = tempColor.g
      baseCol[i * 3 + 2] = tempColor.b
    }

    const geom = new BufferGeometry()
    geom.setAttribute('position', new BufferAttribute(posArr, 3))
    geom.setAttribute('color', new BufferAttribute(colArr, 3))

    return { geometry: geom, baseColors: baseCol }
  }, [estrelasDef])

  useFrame(({ clock }) => {
    if (reducedMotion || !pointsRef.current) return

    const colorAttr = pointsRef.current.geometry.attributes
      .color as BufferAttribute
    const colArray = colorAttr.array as Float32Array
    const t = clock.getElapsedTime()

    for (let i = 0; i < CONTAGEM; i++) {
      const e = estrelasDef[i]
      // Subtle twinkle (±15%)
      const factor = 0.85 + Math.sin(t * e.frequencia * Math.PI * 2 + e.fase) * 0.15
      const idx = i * 3

      colArray[idx] = baseColors[idx] * factor
      colArray[idx + 1] = baseColors[idx + 1] * factor
      colArray[idx + 2] = baseColors[idx + 2] * factor
    }

    colorAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.88}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
