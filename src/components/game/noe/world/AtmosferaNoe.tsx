import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D, type Group, type InstancedMesh } from 'three'
import type { Ponto3D } from '../../../../mapas/types'
import type { EstadoProgressaoNoe } from '../progression/types'
import {
  gerarGotasChuvaExteriorNoe,
  projetarAtmosferaNoe,
} from './abrigoTempestade'

export interface AtmosferaNoeProps {
  estado: EstadoProgressaoNoe
  reducedMotion?: boolean
}

const NUVENS: readonly {
  id: string
  posicao: Ponto3D
  escala: Ponto3D
}[] = [
  { id: 'nuvem-oeste-frente', posicao: [-24, 14, 22], escala: [7, 1.5, 3.2] },
  { id: 'nuvem-leste-frente', posicao: [22, 15.5, 18], escala: [8, 1.7, 3.5] },
  { id: 'nuvem-centro', posicao: [-3, 17, -2], escala: [10, 1.8, 4] },
  { id: 'nuvem-oeste-fundo', posicao: [-27, 15, -26], escala: [8, 1.6, 3.8] },
  { id: 'nuvem-leste-fundo', posicao: [25, 16, -30], escala: [9, 1.8, 4.2] },
  { id: 'nuvem-fundo', posicao: [0, 18, -42], escala: [11, 2, 4.5] },
] as const

const VENTOS: readonly Ponto3D[] = [
  [-31, 7.5, 15],
  [-16, 9, -8],
  [8, 8, 26],
  [24, 10, -19],
  [-25, 6, -33],
  [14, 7, -39],
] as const

function NuvemSuave({
  posicao,
  escala,
  cor,
  opacidade,
}: {
  posicao: Ponto3D
  escala: Ponto3D
  cor: string
  opacidade: number
}) {
  return (
    <group position={[...posicao]} scale={[...escala]}>
      {[
        [-0.55, 0, 0, 0.68],
        [0, 0.15, 0, 0.88],
        [0.58, -0.02, 0.08, 0.62],
        [0.12, -0.15, 0.24, 0.74],
      ].map(([x, y, z, tamanho], indice) => (
        <mesh key={indice} position={[x, y, z]} scale={tamanho}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial
            color={cor}
            transparent
            opacity={opacidade}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function NuvensAtmosferaNoe({
  quantidade,
  cor,
  densidade,
  vento,
  reducedMotion,
}: {
  quantidade: number
  cor: string
  densidade: number
  vento: number
  reducedMotion: boolean
}) {
  const grupoRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!grupoRef.current || reducedMotion) return
    grupoRef.current.position.x =
      Math.sin(clock.getElapsedTime() * (0.035 + vento * 0.03)) *
      (0.45 + vento * 0.7)
  })

  return (
    <group ref={grupoRef} name="nuvens-graduais-noe">
      {NUVENS.slice(0, quantidade).map((nuvem) => (
        <NuvemSuave
          key={nuvem.id}
          posicao={nuvem.posicao}
          escala={nuvem.escala}
          cor={cor}
          opacidade={0.46 + densidade * 0.24}
        />
      ))}
    </group>
  )
}

function VentoSuaveNoe({
  intensidade,
  reducedMotion,
}: {
  intensidade: number
  reducedMotion: boolean
}) {
  const grupoRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!grupoRef.current || reducedMotion) return
    grupoRef.current.position.x =
      ((clock.getElapsedTime() * (1.2 + intensidade * 1.4)) % 8) - 4
  })

  if (intensidade <= 0) return null

  return (
    <group
      ref={grupoRef}
      name="vento-suave-noe"
      userData={{ intensidade, semUrgencia: true }}
    >
      {VENTOS.slice(0, Math.ceil(intensidade * VENTOS.length)).map(
        (posicao, indice) => (
          <mesh
            key={indice}
            position={[...posicao]}
            rotation={[0, 0, -0.04]}
          >
            <boxGeometry args={[2.8 + indice * 0.22, 0.025, 0.035]} />
            <meshBasicMaterial
              color="#d9edf0"
              transparent
              opacity={0.2 + intensidade * 0.12}
              depthWrite={false}
            />
          </mesh>
        ),
      )}
    </group>
  )
}

function ChuvaExteriorNoe({ reducedMotion }: { reducedMotion: boolean }) {
  const grupoRef = useRef<Group>(null)
  const gotasRef = useRef<InstancedMesh>(null)
  const gotas = useMemo(() => gerarGotasChuvaExteriorNoe(), [])
  const transformacao = useMemo(() => new Object3D(), [])

  useLayoutEffect(() => {
    const malha = gotasRef.current
    if (!malha) return

    gotas.forEach((posicao, indice) => {
      transformacao.position.set(...posicao)
      transformacao.rotation.set(0, 0, -0.08)
      transformacao.updateMatrix()
      malha.setMatrixAt(indice, transformacao.matrix)
    })
    malha.instanceMatrix.needsUpdate = true
  }, [gotas, transformacao])

  useFrame(({ clock }) => {
    if (!grupoRef.current || reducedMotion) return
    grupoRef.current.position.y = -(clock.getElapsedTime() * 4.2 % 4.5)
  })

  return (
    <group
      ref={grupoRef}
      name="chuva-exterior-noe"
      userData={{ somenteExterior: true, semTrovao: true, semPerigo: true }}
    >
      <instancedMesh
        ref={gotasRef}
        args={[undefined, undefined, gotas.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.018, 0.018, 0.72, 4]} />
        <meshBasicMaterial
          color="#b9d9e5"
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}

/**
 * Calm deterministic atmosphere for World 2. It does not own timers or danger
 * state: every visual is projected from the durable journey checkpoint.
 */
export function AtmosferaNoe({
  estado,
  reducedMotion = false,
}: AtmosferaNoeProps) {
  const atmosfera = useMemo(() => projetarAtmosferaNoe(estado), [estado])
  const quantidadeNuvens = Math.ceil(atmosfera.densidadeNuvens * NUVENS.length)

  return (
    <>
      <color attach="background" args={[atmosfera.corCeu]} />
      <fog attach="fog" args={[atmosfera.corCeu, 28, 86]} />
      <group
        name="atmosfera-progressiva-noe"
        userData={{
          percentualPreparacao: atmosfera.percentualPreparacao,
          chuvaAtiva: atmosfera.chuvaExteriorAtiva,
          corCeu: atmosfera.corCeu,
        }}
      >
        <NuvensAtmosferaNoe
          quantidade={quantidadeNuvens}
          cor={atmosfera.corNuvem}
          densidade={atmosfera.densidadeNuvens}
          vento={atmosfera.intensidadeVento}
          reducedMotion={reducedMotion}
        />
        <VentoSuaveNoe
          intensidade={atmosfera.intensidadeVento}
          reducedMotion={reducedMotion}
        />
        {atmosfera.chuvaExteriorAtiva && (
          <ChuvaExteriorNoe reducedMotion={reducedMotion} />
        )}
      </group>
    </>
  )
}
