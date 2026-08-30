import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Matrix4, MeshBasicMaterial, PlaneGeometry } from 'three'
import { gerarParticulasCrescimento } from './configuracao'

export interface EfeitoCrescimentoProps {
  reducedMotion?: boolean
}

const PALETA_CORES = ['#82d866', '#ffe869', '#f8b4d9']
const CONTAGEM = 28

export function EfeitoCrescimento({
  reducedMotion = false,
}: EfeitoCrescimentoProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const particulas = useMemo(() => gerarParticulasCrescimento(CONTAGEM), [])

  const tempMatrix = useMemo(() => new Matrix4(), [])
  const tempColor = useMemo(() => new Color(), [])

  const geometry = useMemo(() => new PlaneGeometry(0.1, 0.1), [])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    [],
  )

  useEffect(() => {
    if (!meshRef.current) return

    for (let i = 0; i < CONTAGEM; i++) {
      const p = particulas[i]
      tempColor.set(PALETA_CORES[p.corIndex])
      meshRef.current.setColorAt(i, tempColor)
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [particulas, tempColor])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const t = clock.getElapsedTime()

    for (let i = 0; i < CONTAGEM; i++) {
      const p = particulas[i]
      const speed = reducedMotion ? p.velocidade * 0.5 : p.velocidade
      const cycle = ((t * speed + p.fase) % 2.6) / 2.6 // 0..1

      const y = p.origem[1] + cycle * 2.2
      const angle = reducedMotion ? 0 : t * 1.1 + p.fase
      const radius = 0.4 * (1 - cycle * 0.3)

      const x = p.origem[0] + Math.cos(angle) * radius
      const z = p.origem[2] + Math.sin(angle) * radius

      tempMatrix.makeScale(p.escala, p.escala, p.escala)
      tempMatrix.setPosition(x, y, z)
      meshRef.current.setMatrixAt(i, tempMatrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, CONTAGEM]}
      castShadow={false}
      receiveShadow={false}
    />
  )
}
