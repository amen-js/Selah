import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { Ponto3D } from '../../../../mapas/types'
import type { MomentoNoeId, ProgressoAcaoNoe } from '../progression/types'
import {
  colisoresArcaCanteiroNoe,
  estruturaArcaCanteiroNoe,
  estruturaRampaCanteiroNoe,
  obterEstadoVisualCanteiroNoe,
  type FendaCanteiroNoeId,
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
const alturasTabuasCasco = [0.78, 1.62, 2.46, 3.3, 4.14, 4.98] as const

function DetalhesArcaEmConstrucao() {
  return (
    <group name="detalhes-arca-em-construcao">
      {alturasTabuasCasco.flatMap((y, indice) => [
        <CaixaVisual
          key={`tabua-casco-esquerda-${y}`}
          posicao={[-6.08, y, 0]}
          dimensoes={[0.16, 0.66, 27.25]}
          cor={indice % 2 === 0 ? COR_MADEIRA_CLARA : COR_MADEIRA_MEDIA}
        />,
        <CaixaVisual
          key={`tabua-casco-direita-${y}`}
          posicao={[6.08, y, 0]}
          dimensoes={[0.16, 0.66, 27.25]}
          cor={indice % 2 === 0 ? COR_MADEIRA_MEDIA : COR_MADEIRA_CLARA}
        />,
      ])}

      {/* Exterior scaffold sits outside the solid hull and leaves the door clear. */}
      {[-7.15, 7.15].flatMap((x) =>
        [-10, 0, 10].map((z) => (
          <CaixaVisual
            key={`andaime-${x}-${z}`}
            posicao={[x, 2.45, z]}
            dimensoes={[0.18, 5.1, 0.18]}
            cor={COR_DESTAQUE}
          />
        )),
      )}
      {[-7.15, 7.15].flatMap((x) =>
        [1.15, 3.15, 4.75].map((y) => (
          <CaixaVisual
            key={`travessa-andaime-${x}-${y}`}
            posicao={[x, y, 0]}
            dimensoes={[0.2, 0.16, 22]}
            cor={COR_MADEIRA_MEDIA}
          />
        )),
      )}
      {[-7.15, 7.15].map((x) => (
        <CaixaVisual
          key={`plataforma-andaime-${x}`}
          posicao={[x, 2.02, 0]}
          dimensoes={[1.35, 0.16, 20.5]}
          cor={COR_MADEIRA_CLARA}
        />
      ))}

      {/* Open ribs and an unfinished ridge make the construction state legible. */}
      {posicoesVigasZ.map((z) => (
        <group key={`costela-teto-${z}`}>
          <CaixaVisual
            posicao={[-2.78, 6.4, z]}
            dimensoes={[6.05, 0.18, 0.2]}
            rotacao={[0, 0, 0.24]}
            cor={COR_DESTAQUE}
          />
          <CaixaVisual
            posicao={[2.78, 6.4, z]}
            dimensoes={[6.05, 0.18, 0.2]}
            rotacao={[0, 0, -0.24]}
            cor={COR_DESTAQUE}
          />
        </group>
      ))}
    </group>
  )
}

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

      <DetalhesArcaEmConstrucao />

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

function RampaQuebrada() {
  return (
    <group
      name="rampa-arca-quebrada"
      position={[0, 0.08, 2.65]}
      userData={{ estado: 'quebrada', colisor: 'nenhum' }}
    >
      <CaixaVisual
        posicao={[-1.05, 0.02, -0.55]}
        dimensoes={[0.68, 0.16, 2.35]}
        rotacao={[0.035, 0.1, 0.08]}
        cor={COR_MADEIRA_MEDIA}
      />
      <CaixaVisual
        posicao={[0.15, 0.04, 0.8]}
        dimensoes={[0.72, 0.16, 2.1]}
        rotacao={[-0.04, -0.18, -0.04]}
        cor={COR_MADEIRA_CLARA}
      />
      <CaixaVisual
        posicao={[1.15, 0.03, -0.95]}
        dimensoes={[0.66, 0.16, 1.75]}
        rotacao={[0.025, -0.25, -0.1]}
        cor={COR_MADEIRA_MEDIA}
      />
      <CaixaVisual
        posicao={[1.42, 0.18, 1.35]}
        dimensoes={[0.18, 0.18, 1.2]}
        rotacao={[0.06, 0.42, Math.PI / 2.8]}
        cor={COR_DESTAQUE}
      />
    </group>
  )
}

function RampaArca({ reparada }: { reparada: boolean }) {
  const { colisor, largura, comprimento } = estruturaRampaCanteiroNoe

  if (!reparada) return <RampaQuebrada />

  return (
    <RigidBody
      name="rampa-arca-reparada"
      type="fixed"
      colliders={false}
      position={[...colisor.posicao]}
      rotation={colisor.rotacao ? [...colisor.rotacao] : undefined}
      userData={{ estado: 'reparada' }}
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

const posicoesFendas: Record<
  FendaCanteiroNoeId,
  { posicao: Ponto3D; rotacao?: Ponto3D; escala: Ponto3D }
> = {
  'fenda-casco-1': {
    posicao: [-3.2, 1.7, -1.69],
    escala: [0.72, 0.42, 1],
  },
  'fenda-casco-2': {
    posicao: [3.2, 2.4, -1.69],
    escala: [0.66, 0.48, 1],
  },
  'fenda-casco-3': {
    posicao: [5.91, 1.6, -10],
    rotacao: [0, Math.PI / 2, 0],
    escala: [0.7, 0.4, 1],
  },
}

function SeloBetume({ fendaId }: { fendaId: FendaCanteiroNoeId }) {
  const { posicao, rotacao = [0, 0, 0], escala } = posicoesFendas[fendaId]

  return (
    <group
      name={`selo-betume-${fendaId}`}
      position={[...posicao]}
      rotation={[...rotacao]}
      scale={[...escala]}
      userData={{ fendaId, persistente: true }}
    >
      {[
        [0, 0, 0.09, 0.48],
        [-0.32, 0.08, -0.18, 0.3],
        [0.3, -0.06, 0.22, 0.27],
      ].map(([x, y, rotacaoZ, tamanho], indice) => (
        <mesh key={indice} position={[x, y, 0]} rotation={[0, 0, rotacaoZ]}>
          <circleGeometry args={[tamanho, 9]} />
          <meshStandardMaterial
            color={indice === 0 ? '#28201b' : '#3a2920'}
            roughness={0.72}
            metalness={0.03}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </group>
  )
}

function SelosBetume({
  fendasVedadas,
}: {
  fendasVedadas: readonly FendaCanteiroNoeId[]
}) {
  return (
    <group name="selos-betume-persistentes">
      {fendasVedadas.map((fendaId) => (
        <SeloBetume key={fendaId} fendaId={fendaId} />
      ))}
    </group>
  )
}

/** Large walkable ark shell plus a separate low-slope entrance ramp. */
export function ArcaCanteiroNoe({
  momentoAtualId,
  progressoMomentoAtual,
}: {
  momentoAtualId: MomentoNoeId
  progressoMomentoAtual: readonly ProgressoAcaoNoe[]
}) {
  const estadoVisual = obterEstadoVisualCanteiroNoe(
    momentoAtualId,
    progressoMomentoAtual,
  )

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
      <RampaArca reparada={estadoVisual.rampa === 'reparada'} />
      <SelosBetume fendasVedadas={estadoVisual.fendasVedadas} />
    </group>
  )
}
