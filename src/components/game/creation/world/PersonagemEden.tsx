import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

export type PersonagemEdenId = 'adao' | 'eva'

interface PaletaPersonagemEden {
  pele: string
  peleSombra: string
  cabelo: string
  roupa: string
  roupaClara: string
  folha: string
}

const paletas: Record<PersonagemEdenId, PaletaPersonagemEden> = {
  adao: {
    pele: '#a9663f',
    peleSombra: '#7c432b',
    cabelo: '#3b241c',
    roupa: '#d2ae69',
    roupaClara: '#ead59d',
    folha: '#47783f',
  },
  eva: {
    pele: '#b8754d',
    peleSombra: '#874a32',
    cabelo: '#4a291f',
    roupa: '#718f63',
    roupaClara: '#a9bb7d',
    folha: '#365f39',
  },
}

function Cabeca({ personagem }: { personagem: PersonagemEdenId }) {
  const paleta = paletas[personagem]
  const eva = personagem === 'eva'

  return (
    <group>
      <mesh castShadow scale={[0.46, 0.5, 0.43]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color={paleta.pele} roughness={0.92} />
      </mesh>

      {/* Hair is built as a soft cap plus locks, keeping the face open. */}
      <mesh castShadow position={[0, 0.19, -0.1]} scale={[0.47, 0.37, 0.38]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={paleta.cabelo} roughness={1} />
      </mesh>
      <mesh castShadow position={[-0.29, 0.05, 0.23]} scale={[0.16, 0.3, 0.12]} rotation={[0.15, 0, -0.25]}>
        <capsuleGeometry args={[0.48, 0.65, 5, 8]} />
        <meshStandardMaterial color={paleta.cabelo} roughness={1} />
      </mesh>
      <mesh castShadow position={[0.3, 0.04, 0.2]} scale={[0.16, 0.28, 0.12]} rotation={[0.12, 0, 0.28]}>
        <capsuleGeometry args={[0.48, 0.65, 5, 8]} />
        <meshStandardMaterial color={paleta.cabelo} roughness={1} />
      </mesh>
      {eva && (
        <>
          <mesh castShadow position={[-0.39, -0.26, -0.04]} scale={[0.18, 0.52, 0.16]} rotation={[0.04, 0, -0.08]}>
            <capsuleGeometry args={[0.48, 0.75, 5, 8]} />
            <meshStandardMaterial color={paleta.cabelo} roughness={1} />
          </mesh>
          <mesh castShadow position={[0.39, -0.26, -0.04]} scale={[0.18, 0.52, 0.16]} rotation={[0.04, 0, 0.08]}>
            <capsuleGeometry args={[0.48, 0.75, 5, 8]} />
            <meshStandardMaterial color={paleta.cabelo} roughness={1} />
          </mesh>
        </>
      )}

      {/* Large eyes and a small smile keep the expression gentle and readable. */}
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, 0.04, 0.39]}>
          <mesh scale={[0.065, 0.09, 0.035]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#2b211d" roughness={0.75} />
          </mesh>
          <mesh position={[-0.018, 0.03, 0.031]} scale={0.018}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#fff7df" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.075, 0.43]} scale={[0.055, 0.065, 0.045]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color={paleta.peleSombra} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.21, 0.427]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.085, 0.012, 6, 18, Math.PI]} />
        <meshStandardMaterial color={paleta.peleSombra} roughness={0.9} />
      </mesh>
    </group>
  )
}

interface BracoProps {
  lado: 'esquerdo' | 'direito'
  paleta: PaletaPersonagemEden
  pose: 'relaxado' | 'acolhedor' | 'maos-unidas'
}

function Braco({ lado, paleta, pose }: BracoProps) {
  const sinal = lado === 'esquerdo' ? -1 : 1
  const frente = pose !== 'relaxado'
  const maosUnidas = pose === 'maos-unidas'

  return (
    <group
      position={[sinal * 0.38, 0.34, 0]}
      rotation={[
        frente ? -0.3 : -0.06,
        0,
        frente ? -sinal * 0.22 : sinal * 0.09,
      ]}
    >
      <mesh castShadow position={[0, -0.28, 0]} scale={[0.13, 0.34, 0.13]}>
        <capsuleGeometry args={[0.5, 1, 5, 9]} />
        <meshStandardMaterial color={paleta.pele} roughness={0.92} />
      </mesh>
      <group
        position={[0, maosUnidas ? -0.49 : -0.58, 0]}
        rotation={[
          frente ? -0.5 : -0.13,
          0,
          frente ? -sinal * 0.34 : 0,
        ]}
      >
        <mesh
          castShadow
          position={[0, maosUnidas ? -0.19 : -0.24, 0]}
          scale={[0.115, maosUnidas ? 0.25 : 0.3, 0.115]}
        >
          <capsuleGeometry args={[0.5, 1, 5, 9]} />
          <meshStandardMaterial color={paleta.pele} roughness={0.92} />
        </mesh>
        <mesh
          castShadow
          position={[0, maosUnidas ? -0.4 : -0.51, 0.01]}
          scale={[0.12, 0.14, 0.1]}
        >
          <sphereGeometry args={[1, 12, 9]} />
          <meshStandardMaterial color={paleta.pele} roughness={0.92} />
        </mesh>
      </group>
    </group>
  )
}

function Folha({ position, rotation = 0, color }: { position: [number, number, number]; rotation?: number; color: string }) {
  return (
    <mesh castShadow position={position} rotation={[0.12, 0, rotation]} scale={[0.12, 0.23, 0.045]}>
      <sphereGeometry args={[1, 10, 7]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  )
}

export function PersonagemEden({ personagem }: { personagem: PersonagemEdenId }) {
  const paleta = paletas[personagem]
  const eva = personagem === 'eva'
  const corpoRef = useRef<Group>(null)
  const cabecaRef = useRef<Group>(null)
  const bracoEsquerdoRef = useRef<Group>(null)
  const bracoDireitoRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    const tempo = clock.getElapsedTime() + (eva ? 1.7 : 0)
    const respiracao = Math.sin(tempo * 1.25)

    if (corpoRef.current) {
      corpoRef.current.position.y = 1.08 + respiracao * 0.012
      corpoRef.current.rotation.z = respiracao * 0.006
    }
    if (cabecaRef.current) {
      cabecaRef.current.rotation.y = Math.sin(tempo * 0.48) * 0.055
      cabecaRef.current.rotation.x = Math.sin(tempo * 0.62) * 0.018
    }
    if (bracoEsquerdoRef.current) {
      bracoEsquerdoRef.current.rotation.x = respiracao * 0.018
    }
    if (bracoDireitoRef.current) {
      bracoDireitoRef.current.rotation.x = -respiracao * 0.016
    }
  })

  return (
    <group>
      {/* Feet and short limbs establish a friendly, storybook silhouette. */}
      {[-0.2, 0.2].map((x) => (
        <group key={x} position={[x, 0.46, 0]}>
          <mesh castShadow position={[0, -0.22, 0]} scale={[0.15, 0.3, 0.15]}>
            <capsuleGeometry args={[0.5, 1, 5, 9]} />
            <meshStandardMaterial color={paleta.pele} roughness={0.92} />
          </mesh>
          <mesh castShadow position={[0, -0.48, 0.07]} scale={[0.17, 0.12, 0.24]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={paleta.peleSombra} roughness={0.95} />
          </mesh>
        </group>
      ))}

      <group ref={corpoRef} position={[0, 1.08, 0]}>
        <mesh castShadow scale={[0.39, 0.5, 0.28]}>
          <capsuleGeometry args={[0.62, 0.82, 7, 12]} />
          <meshStandardMaterial color={paleta.roupa} roughness={1} />
        </mesh>
        <mesh castShadow position={[0, -0.35, 0]} scale={[0.48, 0.45, 0.33]}>
          <coneGeometry args={[0.82, 1.25, 7]} />
          <meshStandardMaterial color={paleta.roupaClara} roughness={1} />
        </mesh>
        <mesh castShadow position={[0, 0.18, 0.24]} scale={[0.34, 0.34, 0.05]} rotation={[0.18, 0, 0]}>
          <circleGeometry args={[1, 7]} />
          <meshStandardMaterial color={paleta.roupaClara} roughness={1} side={2} />
        </mesh>

        <Folha position={[-0.22, -0.18, 0.3]} rotation={-0.45} color={paleta.folha} />
        <Folha position={[0, -0.12, 0.33]} color={paleta.folha} />
        <Folha position={[0.22, -0.18, 0.3]} rotation={0.45} color={paleta.folha} />

        <group ref={bracoEsquerdoRef}>
          <Braco
            lado="esquerdo"
            paleta={paleta}
            pose={eva ? 'maos-unidas' : 'relaxado'}
          />
        </group>
        <group ref={bracoDireitoRef}>
          <Braco
            lado="direito"
            paleta={paleta}
            pose={eva ? 'maos-unidas' : 'acolhedor'}
          />
        </group>

        <group ref={cabecaRef} position={[0, 0.82, 0]} rotation={[0, eva ? -0.08 : 0.08, 0]}>
          <Cabeca personagem={personagem} />
        </group>
      </group>
    </group>
  )
}
