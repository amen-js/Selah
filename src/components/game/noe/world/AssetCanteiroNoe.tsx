import { Clone, useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense } from 'react'
import type { Ponto3D } from '../../../../mapas/types'
import {
  obterAssetNoe,
  obterDeslocamentoFallbackAssetNoe,
  obterDeslocamentoModeloAssetNoe,
  type EntradaManifestoAssetNoe,
} from './assets'
import type { InstanciaAssetCanteiroNoe } from './types'

function FallbackAssetNoe({ entrada }: { entrada: EntradaManifestoAssetNoe }) {
  const [largura, altura, profundidade] = entrada.fallback.dimensoes
  const deslocamento = obterDeslocamentoFallbackAssetNoe(entrada)

  return (
    <mesh
      castShadow
      receiveShadow
      position={[...deslocamento]}
      scale={
        entrada.fallback.geometria === 'icosahedron'
          ? [largura / 2, altura / 2, profundidade / 2]
          : undefined
      }
    >
      {entrada.fallback.geometria === 'cylinder' ? (
        <cylinderGeometry args={[largura / 2, profundidade / 2, altura, 12]} />
      ) : entrada.fallback.geometria === 'icosahedron' ? (
        <icosahedronGeometry args={[1, 1]} />
      ) : (
        <boxGeometry args={[largura, altura, profundidade]} />
      )}
      <meshStandardMaterial color={entrada.fallback.cor} roughness={0.88} />
    </mesh>
  )
}

function ModeloAssetNoe({ entrada }: { entrada: EntradaManifestoAssetNoe }) {
  const { scene } = useGLTF(entrada.urlRuntime)
  const deslocamento = obterDeslocamentoModeloAssetNoe(entrada)

  return (
    <group position={[...deslocamento]} scale={entrada.escalaVisual}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  )
}

function VisualAssetNoe({ entrada }: { entrada: EntradaManifestoAssetNoe }) {
  return (
    <Suspense fallback={<FallbackAssetNoe entrada={entrada} />}>
      <ModeloAssetNoe entrada={entrada} />
    </Suspense>
  )
}

export function AssetCanteiroNoe({
  instancia,
}: {
  instancia: InstanciaAssetCanteiroNoe
}) {
  const entrada = obterAssetNoe(instancia.assetId)
  if (!entrada) return null

  const rotacao: Ponto3D = instancia.rotacao ?? [0, 0, 0]
  const escala = instancia.escala ?? 1
  const visual = (
    <group scale={escala}>
      <VisualAssetNoe entrada={entrada} />
    </group>
  )

  if (entrada.colisor.tipo === 'nenhum') {
    return (
      <group position={[...instancia.posicao]} rotation={[...rotacao]}>
        {visual}
      </group>
    )
  }

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[...instancia.posicao]}
      rotation={[...rotacao]}
    >
      <CuboidCollider
        args={[
          entrada.colisor.meiaExtensaoMetros[0] * escala,
          entrada.colisor.meiaExtensaoMetros[1] * escala,
          entrada.colisor.meiaExtensaoMetros[2] * escala,
        ]}
        position={[
          entrada.colisor.deslocamentoMetros[0] * escala,
          entrada.colisor.deslocamentoMetros[1] * escala,
          entrada.colisor.deslocamentoMetros[2] * escala,
        ]}
        friction={1}
      />
      {visual}
    </RigidBody>
  )
}
