import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  type Group,
} from 'three'
import type { MomentoCriacaoId } from '../progression/types'
import { obterDetalhesVisiveisCriacao } from './detalhes'
import { obterAlturaTerrenoCriacao } from './terreno'

type PontoRio = readonly [x: number, z: number]

const RIO_DO_VALE: readonly PontoRio[] = [
  [-14, 5],
  [-14.5, 2],
  [-15, -1],
  [-15.5, -4],
  [-16, -7],
]

const RIOS_EDEN: readonly (readonly PontoRio[])[] = [
  [[0, -2], [-3, -4], [-7, -6], [-11, -7]],
  [[0, -2], [3, -4], [7, -6], [10, -9]],
  [[0, -2], [-1, -6], [-2, -10], [-4, -14]],
  [[0, -2], [2, 1], [5, 3], [8, 4]],
]

function criarGeometriaRio(
  pontos: readonly PontoRio[],
  largura: number,
): BufferGeometry {
  const posicoes = new Float32Array(pontos.length * 2 * 3)
  const indices = new Uint16Array((pontos.length - 1) * 6)

  pontos.forEach(([x, z], indice) => {
    const anterior = pontos[Math.max(0, indice - 1)]
    const proximo = pontos[Math.min(pontos.length - 1, indice + 1)]
    const dx = proximo[0] - anterior[0]
    const dz = proximo[1] - anterior[1]
    const tamanho = Math.hypot(dx, dz) || 1
    const perpendicularX = (-dz / tamanho) * largura * 0.5
    const perpendicularZ = (dx / tamanho) * largura * 0.5
    const y = obterAlturaTerrenoCriacao(x, z) + 0.055
    const cursor = indice * 6

    posicoes[cursor] = x + perpendicularX
    posicoes[cursor + 1] = y
    posicoes[cursor + 2] = z + perpendicularZ
    posicoes[cursor + 3] = x - perpendicularX
    posicoes[cursor + 4] = y
    posicoes[cursor + 5] = z - perpendicularZ
  })

  for (let indice = 0; indice < pontos.length - 1; indice += 1) {
    const cursor = indice * 6
    const esquerdaAtual = indice * 2
    const direitaAtual = esquerdaAtual + 1
    const esquerdaProxima = esquerdaAtual + 2
    const direitaProxima = esquerdaAtual + 3
    indices[cursor] = esquerdaAtual
    indices[cursor + 1] = direitaAtual
    indices[cursor + 2] = esquerdaProxima
    indices[cursor + 3] = direitaAtual
    indices[cursor + 4] = direitaProxima
    indices[cursor + 5] = esquerdaProxima
  }

  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new BufferAttribute(posicoes, 3))
  geometria.setIndex(new BufferAttribute(indices, 1))
  geometria.computeVertexNormals()
  geometria.computeBoundingSphere()
  return geometria
}

function FaixaAgua({ pontos, largura }: { pontos: readonly PontoRio[]; largura: number }) {
  const geometria = useMemo(
    () => criarGeometriaRio(pontos, largura),
    [largura, pontos],
  )
  useEffect(() => () => geometria.dispose(), [geometria])

  return (
    <mesh geometry={geometria} receiveShadow renderOrder={1}>
      <meshStandardMaterial
        color="#65bdd2"
        emissive="#1d6378"
        emissiveIntensity={0.22}
        roughness={0.22}
        metalness={0.04}
        transparent
        opacity={0.88}
        side={DoubleSide}
      />
    </mesh>
  )
}

function LeaoStorybook({ reducedMotion }: { reducedMotion: boolean }) {
  const cabecaRef = useRef<Group>(null)
  const caudaRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const tempo = clock.getElapsedTime()
    if (cabecaRef.current) {
      cabecaRef.current.rotation.y = Math.sin(tempo * 0.55) * 0.09
      cabecaRef.current.position.y = 0.92 + Math.sin(tempo * 1.4) * 0.012
    }
    if (caudaRef.current) {
      caudaRef.current.rotation.z = -0.65 + Math.sin(tempo * 1.1) * 0.18
    }
  })

  return (
    <group
      name="leao-storybook"
      position={[10.5, obterAlturaTerrenoCriacao(10.5, 8.2), 8.2]}
      rotation={[0, -0.55, 0]}
      scale={0.82}
    >
      <mesh castShadow position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.48, 0.72, 0.48]}>
        <capsuleGeometry args={[0.55, 0.85, 6, 12]} />
        <meshStandardMaterial color="#d99a43" roughness={0.95} />
      </mesh>
      {[-0.32, 0.32].flatMap((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.32, z]} scale={[0.13, 0.35, 0.13]}>
            <capsuleGeometry args={[0.5, 1, 5, 8]} />
            <meshStandardMaterial color="#c78135" roughness={0.96} />
          </mesh>
        )),
      )}
      <group ref={cabecaRef} position={[0, 0.92, 0.68]}>
        <mesh castShadow scale={[0.52, 0.5, 0.34]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#8e552f" roughness={1} />
        </mesh>
        <mesh castShadow position={[0, -0.02, 0.22]} scale={[0.38, 0.34, 0.29]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#e5a64f" roughness={0.95} />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.49]} scale={0.047}>
            <sphereGeometry args={[1, 9, 7]} />
            <meshStandardMaterial color="#2c211b" />
          </mesh>
        ))}
        <mesh position={[0, -0.08, 0.51]} scale={[0.065, 0.052, 0.04]}>
          <sphereGeometry args={[1, 9, 7]} />
          <meshStandardMaterial color="#513126" />
        </mesh>
      </group>
      <group ref={caudaRef} position={[0, 0.72, -0.65]} rotation={[0.45, 0, -0.65]}>
        <mesh castShadow position={[0, 0.35, 0]} scale={[0.075, 0.4, 0.075]}>
          <capsuleGeometry args={[0.5, 1, 5, 8]} />
          <meshStandardMaterial color="#c78135" roughness={0.96} />
        </mesh>
        <mesh castShadow position={[0, 0.72, 0]} scale={0.13}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#6f422b" roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

function GirafaStorybook({ reducedMotion }: { reducedMotion: boolean }) {
  const cabecaRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const tempo = clock.getElapsedTime() + 1.3
    if (cabecaRef.current) {
      cabecaRef.current.rotation.z = Math.sin(tempo * 0.48) * 0.04
      cabecaRef.current.rotation.y = Math.sin(tempo * 0.35) * 0.08
    }
  })

  return (
    <group
      name="girafa-storybook"
      position={[17, obterAlturaTerrenoCriacao(17, 10.8), 10.8]}
      rotation={[0, 0.35, 0]}
      scale={0.86}
    >
      <mesh castShadow position={[0, 1.16, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.42, 0.68, 0.4]}>
        <capsuleGeometry args={[0.55, 0.85, 6, 12]} />
        <meshStandardMaterial color="#e4b451" roughness={0.96} />
      </mesh>
      {[-0.28, 0.28].flatMap((x) =>
        [-0.38, 0.38].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.55, z]} scale={[0.105, 0.62, 0.105]}>
            <capsuleGeometry args={[0.5, 1, 5, 8]} />
            <meshStandardMaterial color="#d7a347" roughness={0.96} />
          </mesh>
        )),
      )}
      <mesh castShadow position={[0, 2.05, 0.32]} rotation={[-0.16, 0, 0]} scale={[0.18, 0.9, 0.18]}>
        <capsuleGeometry args={[0.5, 1, 6, 10]} />
        <meshStandardMaterial color="#e4b451" roughness={0.96} />
      </mesh>
      <group ref={cabecaRef} position={[0, 2.9, 0.48]}>
        <mesh castShadow scale={[0.28, 0.24, 0.39]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color="#efc467" roughness={0.95} />
        </mesh>
        {[-0.16, 0.16].map((x) => (
          <group key={x} position={[x, 0.28, 0]}>
            <mesh castShadow scale={[0.035, 0.18, 0.035]}>
              <capsuleGeometry args={[0.5, 1, 4, 7]} />
              <meshStandardMaterial color="#9a6435" roughness={1} />
            </mesh>
            <mesh castShadow position={[0, 0.17, 0]} scale={0.07}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color="#75472e" roughness={1} />
            </mesh>
          </group>
        ))}
        {[-0.11, 0.11].map((x) => (
          <mesh key={x} position={[x, 0.04, 0.35]} scale={0.042}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#2b211b" />
          </mesh>
        ))}
      </group>
      {[
        [-0.32, 1.25, 0.38, 0.12],
        [0.25, 1.05, 0.5, 0.14],
        [0.2, 1.42, -0.25, 0.11],
        [-0.12, 2.05, 0.49, 0.09],
        [0.1, 2.45, 0.5, 0.075],
      ].map(([x, y, z, escala], indice) => (
        <mesh key={indice} position={[x, y, z]} scale={[escala, escala * 0.8, 0.035]}>
          <sphereGeometry args={[1, 9, 7]} />
          <meshStandardMaterial color="#986137" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function FrutosDaEscolha() {
  const frutos = [
    [-1.15, 4.45, 1.72],
    [0.82, 5.05, 1.82],
    [1.22, 4.1, 1.62],
    [-0.42, 5.62, 1.76],
    [0.18, 4.48, 1.98],
  ] as const

  return (
    <group
      name="fruto-nao-interativo"
      position={[12, obterAlturaTerrenoCriacao(12, -12), -12]}
      userData={{ interativo: false }}
    >
      {frutos.map(([x, y, z], indice) => (
        <group key={indice} position={[x, y, z]}>
          <mesh castShadow scale={[0.25, 0.28, 0.25]}>
            <sphereGeometry args={[1, 12, 9]} />
            <meshStandardMaterial color="#d9663f" roughness={0.72} />
          </mesh>
          <mesh castShadow position={[0.1, 0.27, 0]} rotation={[0.2, 0, -0.65]} scale={[0.11, 0.2, 0.04]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#4c7b3d" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function DetalhesNarrativosCriacao({
  momentoId,
  reducedMotion = false,
}: {
  momentoId: MomentoCriacaoId
  reducedMotion?: boolean
}) {
  const detalhes = obterDetalhesVisiveisCriacao(momentoId)

  return (
    <group name="detalhes-narrativos-criacao">
      {detalhes.aguas && <FaixaAgua pontos={RIO_DO_VALE} largura={1.25} />}
      {detalhes.eden &&
        RIOS_EDEN.map((pontos, indice) => (
          <FaixaAgua key={indice} pontos={pontos} largura={0.72} />
        ))}
      {detalhes.fauna && (
        <>
          <LeaoStorybook reducedMotion={reducedMotion} />
          <GirafaStorybook reducedMotion={reducedMotion} />
        </>
      )}
      {detalhes.fruto && <FrutosDaEscolha />}
    </group>
  )
}
