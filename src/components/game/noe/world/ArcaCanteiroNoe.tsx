import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { Ponto3D } from '../../../../mapas/types'
import {
  colisoresArcaCanteiroNoe,
  estruturaArcaCanteiroNoe,
  estruturaRampaCanteiroNoe,
} from './canteiro'

const COR_MADEIRA_CLARA = '#c98b4b'
const COR_MADEIRA_MEDIA = '#9f6337'
const COR_MADEIRA_ESCURA = '#68402a'
const COR_DESTAQUE = '#e8b96b'

function CaixaVisual({
  posicao,
  dimensoes,
  cor,
  rotacao = [0, 0, 0],
}: {
  posicao: Ponto3D
  dimensoes: Ponto3D
  cor: string
  rotacao?: Ponto3D
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={[...posicao]}
      rotation={[...rotacao]}
    >
      <boxGeometry args={[...dimensoes]} />
      <meshStandardMaterial color={cor} roughness={0.82} />
    </mesh>
  )
}

const posicoesVigasZ = [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5] as const

function VisualArca() {
  return (
    <group name="visual-arca-noe">
      <CaixaVisual
        posicao={[0, 0.22, 0]}
        dimensoes={[12, 0.44, 28]}
        cor={COR_MADEIRA_MEDIA}
      />

      <CaixaVisual
        posicao={[-5.82, 3.22, 0]}
        dimensoes={[0.36, 5.56, 27.7]}
        cor={COR_MADEIRA_CLARA}
      />
      <CaixaVisual
        posicao={[5.82, 3.22, 0]}
        dimensoes={[0.36, 5.56, 27.7]}
        cor={COR_MADEIRA_CLARA}
      />
      <CaixaVisual
        posicao={[0, 3.22, -13.82]}
        dimensoes={[11.65, 5.56, 0.36]}
        cor={COR_MADEIRA_CLARA}
      />
      <CaixaVisual
        posicao={[-3.56, 3.22, 13.82]}
        dimensoes={[4.32, 5.56, 0.36]}
        cor={COR_MADEIRA_CLARA}
      />
      <CaixaVisual
        posicao={[3.56, 3.22, 13.82]}
        dimensoes={[4.32, 5.56, 0.36]}
        cor={COR_MADEIRA_CLARA}
      />
      <CaixaVisual
        posicao={[0, 4.82, 13.82]}
        dimensoes={[2.8, 2.36, 0.36]}
        cor={COR_MADEIRA_CLARA}
      />

      {/* Layered lower rails suggest a friendly ark hull without physics hulls. */}
      <CaixaVisual
        posicao={[-6.05, 1.12, 0]}
        dimensoes={[0.48, 1.25, 27.2]}
        cor={COR_MADEIRA_ESCURA}
      />
      <CaixaVisual
        posicao={[6.05, 1.12, 0]}
        dimensoes={[0.48, 1.25, 27.2]}
        cor={COR_MADEIRA_ESCURA}
      />

      {posicoesVigasZ.flatMap((z) => [
        <CaixaVisual
          key={`viga-esquerda-${z}`}
          posicao={[-5.45, 3.15, z]}
          dimensoes={[0.3, 5.4, 0.3]}
          cor={COR_MADEIRA_ESCURA}
        />,
        <CaixaVisual
          key={`viga-direita-${z}`}
          posicao={[5.45, 3.15, z]}
          dimensoes={[0.3, 5.4, 0.3]}
          cor={COR_MADEIRA_ESCURA}
        />,
      ])}

      <CaixaVisual
        posicao={[-2.85, 6.5, 0]}
        dimensoes={[6.2, 0.32, 28]}
        rotacao={[0, 0, 0.24]}
        cor={COR_MADEIRA_MEDIA}
      />
      <CaixaVisual
        posicao={[2.85, 6.5, 0]}
        dimensoes={[6.2, 0.32, 28]}
        rotacao={[0, 0, -0.24]}
        cor={COR_MADEIRA_MEDIA}
      />

      <pointLight
        position={[0, 4.4, 4]}
        color="#ffd995"
        intensity={10}
        distance={13}
        decay={2}
      />
    </group>
  )
}

function RampaArca() {
  const { colisor, largura, comprimento } = estruturaRampaCanteiroNoe

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[...colisor.posicao]}
      rotation={colisor.rotacao ? [...colisor.rotacao] : undefined}
    >
      <CuboidCollider args={[...colisor.meiaExtensao]} friction={1.25} />
      <CaixaVisual
        posicao={[0, 0, 0]}
        dimensoes={[largura, 0.18, comprimento]}
        cor={COR_MADEIRA_MEDIA}
      />
      {[-1.42, 1.42].map((x) => (
        <CaixaVisual
          key={x}
          posicao={[x, 0.16, 0]}
          dimensoes={[0.18, 0.18, comprimento]}
          cor={COR_MADEIRA_ESCURA}
        />
      ))}
      {[-2.7, -1.35, 0, 1.35, 2.7].map((z) => (
        <CaixaVisual
          key={z}
          posicao={[0, 0.13, z]}
          dimensoes={[largura - 0.15, 0.12, 0.12]}
          cor={COR_DESTAQUE}
        />
      ))}
    </RigidBody>
  )
}

/** Large walkable ark shell plus a separate low-slope entrance ramp. */
export function ArcaCanteiroNoe() {
  return (
    <group name="arca-canteiro-noe">
      <RigidBody
        type="fixed"
        colliders={false}
        position={[...estruturaArcaCanteiroNoe.posicao]}
      >
        {colisoresArcaCanteiroNoe.map((colisor) => (
          <CuboidCollider
            key={colisor.id}
            args={[...colisor.meiaExtensao]}
            position={[...colisor.posicao]}
            rotation={colisor.rotacao ? [...colisor.rotacao] : undefined}
            friction={1}
          />
        ))}
        <VisualArca />
      </RigidBody>
      <RampaArca />
    </group>
  )
}
