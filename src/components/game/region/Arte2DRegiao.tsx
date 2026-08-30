import { useTexture } from '@react-three/drei'
import type { Arte2DMapa } from '../../../mapas/types'

export interface Arte2DRegiaoProps {
  artes: readonly Arte2DMapa[]
}

export interface Arte2DItemProps {
  arte: Arte2DMapa
}

/** Decorative 2.5D art never owns physics or gameplay interaction. */
export function Arte2DItem({ arte }: Arte2DItemProps) {
  const textura = useTexture(arte.arquivo)

  const opacidade = arte.opacidade ?? 1

  if (arte.modo === 'chao') {
    return (
      <mesh
        name={arte.id}
        position={arte.posicao}
        rotation={[-Math.PI / 2, 0, arte.rotacao ?? 0]}
        renderOrder={2}
      >
        <planeGeometry args={arte.escala} />
        <meshBasicMaterial
          map={textura}
          transparent
          opacity={opacidade}
          alphaTest={0.01}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          toneMapped={false}
        />
      </mesh>
    )
  }

  return (
    <sprite
      name={arte.id}
      position={arte.posicao}
      scale={[arte.escala[0], arte.escala[1], 1]}
      renderOrder={3}
    >
      <spriteMaterial
        map={textura}
        transparent
        opacity={opacidade}
        alphaTest={0.01}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
}

export function Arte2DRegiao({ artes }: Arte2DRegiaoProps) {
  return (
    <group name="arte-2d-regiao">
      {artes.map((arte) => <Arte2DItem key={arte.id} arte={arte} />)}
    </group>
  )
}
