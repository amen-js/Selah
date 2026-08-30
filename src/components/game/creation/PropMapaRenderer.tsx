import { Clone, useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useMemo } from 'react'
import type { PropMapa } from '../../../mapas/types'
import { clonarPecaModelo } from './clonarPecaModelo'
import { obterTransformacaoProp } from './propTransforms'

export interface PropMapaRendererProps {
  /** Map props are data-owned; rendering never mutates this collection. */
  props: readonly PropMapa[]
}

export interface PropMapaItemProps {
  prop: PropMapa
}

function PropFallbackGeometry({ forma }: Pick<PropMapa['fallback'], 'forma'>) {
  switch (forma) {
    case 'caixa':
      return <boxGeometry args={[1, 1, 1]} />
    case 'cone':
      return <coneGeometry args={[0.5, 1, 16]} />
    case 'cilindro':
      return <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
    case 'esfera':
      return <sphereGeometry args={[0.5, 16, 12]} />
  }
}

/** Geometric fallback used both for absent models and while a model suspends. */
export function PropFallback({ prop }: PropMapaItemProps) {
  return (
    <mesh castShadow receiveShadow>
      <PropFallbackGeometry forma={prop.fallback.forma} />
      <meshStandardMaterial color={prop.fallback.cor} roughness={0.85} />
    </mesh>
  )
}

function PropModelo({
  modelo,
  modeloNo,
  prop,
}: {
  modelo: string
  modeloNo?: string
  prop: PropMapa
}) {
  const { scene } = useGLTF(modelo)
  const peca = useMemo(
    () => (modeloNo ? clonarPecaModelo(scene, modeloNo) : null),
    [modeloNo, scene],
  )

  if (modeloNo) {
    if (!peca) return <PropFallback prop={prop} />
    return <primitive object={peca} castShadow receiveShadow />
  }

  return <Clone object={scene} castShadow receiveShadow />
}

function PropVisual({ prop }: PropMapaItemProps) {
  const escala = obterTransformacaoProp(prop).scale
  const modelo = prop.modelo?.trim()
  const modeloNo = prop.modeloNo?.trim()

  return (
    <group scale={escala}>
      {modelo ? (
        <PropModelo modelo={modelo} modeloNo={modeloNo} prop={prop} />
      ) : (
        <PropFallback prop={prop} />
      )}
    </group>
  )
}

/** One fixed physics body containing a map prop and its visual representation. */
export function PropMapaItem({ prop }: PropMapaItemProps) {
  const transformacao = obterTransformacaoProp(prop)
  const collider = prop.colisor ? false : (prop.collider ?? 'cuboid')

  return (
    <RigidBody
      type="fixed"
      position={transformacao.position}
      rotation={transformacao.rotation}
      colliders={collider}
    >
      {prop.colisor?.forma === 'cuboid' && (
        <CuboidCollider
          args={[...prop.colisor.meiaExtensao]}
          position={prop.colisor.deslocamento ? [...prop.colisor.deslocamento] : undefined}
        />
      )}
      <Suspense fallback={<group scale={transformacao.scale}><PropFallback prop={prop} /></group>}>
        <PropVisual prop={prop} />
      </Suspense>
    </RigidBody>
  )
}

/** Renders all props from a region without changing the source map array. */
export function PropMapaRenderer({ props }: PropMapaRendererProps) {
  return (
    <group name="props-mapa">
      {props.map((prop) => <PropMapaItem key={prop.id} prop={prop} />)}
    </group>
  )
}
