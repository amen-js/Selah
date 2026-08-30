import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CircleGeometry, Color, InstancedMesh, Matrix4, MeshBasicMaterial } from 'three'
import { gerarMarcadoresCaminhoLuz } from './configuracao'

export interface MarcadoresCaminhoLuzProps {
  reducedMotion?: boolean
}

export function MarcadoresCaminhoLuz({
  reducedMotion = false,
}: MarcadoresCaminhoLuzProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const marcadores = useMemo(() => gerarMarcadoresCaminhoLuz(), [])
  const count = marcadores.length

  // Preallocated Three.js helpers for zero-allocation useFrame
  const tempMatrix = useMemo(() => new Matrix4(), [])
  const tempColor = useMemo(() => new Color(), [])

  // Geometry and material memoized to avoid churn
  const geometry = useMemo(() => new CircleGeometry(0.24, 24), [])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ffe88f',
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    [],
  )

  useEffect(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      const [x, y, z] = marcadores[i]
      tempMatrix.makeRotationX(-Math.PI / 2)
      tempMatrix.setPosition(x, y, z)
      meshRef.current.setMatrixAt(i, tempMatrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [marcadores, count, tempMatrix])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    if (reducedMotion) {
      if (meshRef.current.instanceColor) {
        tempColor.set('#ffe88f')
        for (let i = 0; i < count; i++) {
          meshRef.current.setColorAt(i, tempColor)
        }
        meshRef.current.instanceColor.needsUpdate = true
      }
      return
    }

    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      // Gentle delayed brightness wave
      const brightness = 0.75 + Math.sin(t * 1.8 - i * 0.55) * 0.25
      tempColor.set('#ffe88f').multiplyScalar(brightness)
      meshRef.current.setColorAt(i, tempColor)
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow={false}
      receiveShadow={false}
    />
  )
}
