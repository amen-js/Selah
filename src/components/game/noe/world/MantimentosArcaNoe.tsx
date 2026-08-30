import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { Group } from 'three'
import type { Ponto3D } from '../../../../mapas/types'
import type { PosicaoJogador } from '../../creation/proximidade'
import type { MomentoNoeId, ProgressoAcaoNoe } from '../progression/types'
import {
  descreverEstadoMantimentosNoe,
  estruturaConvesesArcaNoe,
  POSICAO_ARCA_NOE,
  resolverCandidatoMantimentoNoe,
  type AcaoMantimentoNoeId,
  type CandidatoMantimentoNoePuro,
  type TipoMantimentoNoe,
} from './mantimentos'

export interface CandidatoMantimentoNoe extends CandidatoMantimentoNoePuro {
  /** Local two-stage action; the region arbiter remains the keyboard owner. */
  acionar: () => void
}

export interface MantimentosArcaNoeProps {
  momentoAtualId: MomentoNoeId
  progressoMomentoAtual: readonly ProgressoAcaoNoe[]
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  onCandidatoChange?: (candidato: CandidatoMantimentoNoe | null) => void
  onConcluirUnidade: (
    acaoId: AcaoMantimentoNoeId,
    unidadeId: string,
  ) => void
}

const COR_PISO = '#855332'
const COR_VIGA = '#543723'
const COR_BAIA = '#b47743'

function Caixa({
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

function FardoFeno() {
  return (
    <group name="fardo-feno">
      <Caixa
        posicao={[0, 0, 0]}
        dimensoes={[1.05, 0.62, 0.72]}
        cor="#d7ad45"
      />
      {[-0.31, 0.31].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.045, 0.66, 0.75]} />
          <meshStandardMaterial color="#705036" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function SacoGraos() {
  return (
    <group name="saco-graos">
      <mesh castShadow scale={[0.68, 0.9, 0.55]}>
        <sphereGeometry args={[0.55, 12, 8]} />
        <meshStandardMaterial color="#c8a16b" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <torusGeometry args={[0.14, 0.025, 6, 12]} />
        <meshStandardMaterial color="#755035" roughness={0.9} />
      </mesh>
    </group>
  )
}

function JarraAgua() {
  return (
    <group name="jarra-agua">
      <mesh castShadow>
        <cylinderGeometry args={[0.33, 0.43, 0.82, 12]} />
        <meshStandardMaterial color="#6e8fa4" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.22, 12]} />
        <meshStandardMaterial color="#49697c" roughness={0.45} />
      </mesh>
      <mesh position={[0.39, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.055, 7, 14]} />
        <meshStandardMaterial color="#49697c" roughness={0.5} />
      </mesh>
    </group>
  )
}

function CestoFrutas() {
  return (
    <group name="cesto-frutas">
      <Caixa posicao={[0, -0.12, 0]} dimensoes={[0.95, 0.42, 0.72]} cor="#9b6334" />
      {[
        [-0.28, 0.17, -0.18, '#d95f42'],
        [0.02, 0.2, -0.12, '#e6b63c'],
        [0.29, 0.18, 0.05, '#d96a3b'],
        [-0.12, 0.22, 0.2, '#a9bd4f'],
      ].map(([x, y, z, cor], indice) => (
        <mesh
          key={indice}
          castShadow
          position={[Number(x), Number(y), Number(z)]}
        >
          <sphereGeometry args={[0.18, 10, 7]} />
          <meshStandardMaterial color={String(cor)} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function VisualMantimento({ tipo }: { tipo: TipoMantimentoNoe }) {
  if (tipo === 'feno') return <FardoFeno />
  if (tipo === 'graos') return <SacoGraos />
  if (tipo === 'agua') return <JarraAgua />
  return <CestoFrutas />
}

function MarcadorMantimento({
  posicao,
  etapa,
}: {
  posicao: Ponto3D
  etapa: 'coleta' | 'entrega'
}) {
  const cor = etapa === 'coleta' ? '#ffd166' : '#72d6b7'

  return (
    <group position={[...posicao]} name={`marcador-mantimento-${etapa}`}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <ringGeometry args={[0.48, 0.62, 24]} />
        <meshBasicMaterial color={cor} transparent opacity={0.82} />
      </mesh>
      <pointLight color={cor} intensity={2.2} distance={2.7} decay={2} />
    </group>
  )
}

function Baia({
  posicao,
  nivel,
}: {
  posicao: Ponto3D
  nivel: 'inferior' | 'medio' | 'superior'
}) {
  const altura = nivel === 'superior' ? 1.15 : 1.35
  return (
    <group position={[...posicao]} name={`baia-${nivel}`}>
      {[-1.05, 1.05].map((x) => (
        <Caixa
          key={x}
          posicao={[x, altura / 2, 0]}
          dimensoes={[0.12, altura, 2.6]}
          cor={COR_VIGA}
        />
      ))}
      {[0.3, 0.85].map((y) => (
        <Caixa
          key={y}
          posicao={[0, y, -1.24]}
          dimensoes={[2.2, 0.1, 0.12]}
          cor={COR_BAIA}
        />
      ))}
    </group>
  )
}

function LuzAcolhedora({ posicao }: { posicao: Ponto3D }) {
  return (
    <group position={[...posicao]} name="lampiao-arca">
      <mesh>
        <cylinderGeometry args={[0.11, 0.16, 0.34, 8]} />
        <meshStandardMaterial
          color="#ffcf70"
          emissive="#ff9c3c"
          emissiveIntensity={1.4}
        />
      </mesh>
      <pointLight color="#ffc16a" intensity={3.5} distance={5} decay={2} />
    </group>
  )
}

/** Three clearly readable decks with two broad, low-slope circulation paths. */
export function InteriorTresNiveisArcaNoe() {
  return (
    <group name="interior-tres-niveis-arca-noe">
      <RigidBody
        name="conveses-arca-noe"
        type="fixed"
        colliders={false}
        position={[...POSICAO_ARCA_NOE]}
      >
        {estruturaConvesesArcaNoe.plataformas.map((plataforma) => (
          <CuboidCollider
            key={plataforma.id}
            args={[...plataforma.meiaExtensao]}
            position={[...plataforma.posicaoLocal]}
            friction={1.1}
          />
        ))}
        {estruturaConvesesArcaNoe.acessos.map((acesso) => (
          <CuboidCollider
            key={acesso.id}
            args={[...acesso.meiaExtensao]}
            position={[...acesso.posicaoLocal]}
            rotation={[...acesso.rotacao]}
            friction={1.25}
          />
        ))}

        {estruturaConvesesArcaNoe.plataformas.map((plataforma, indice) => (
          <Caixa
            key={plataforma.id}
            posicao={plataforma.posicaoLocal}
            dimensoes={[
              plataforma.meiaExtensao[0] * 2,
              plataforma.meiaExtensao[1] * 2,
              plataforma.meiaExtensao[2] * 2,
            ]}
            cor={indice === 0 ? '#92603a' : '#a06a3f'}
          />
        ))}
        {estruturaConvesesArcaNoe.acessos.map((acesso) => (
          <group key={acesso.id}>
            <Caixa
              posicao={acesso.posicaoLocal}
              dimensoes={[
                acesso.meiaExtensao[0] * 2,
                acesso.meiaExtensao[1] * 2,
                acesso.meiaExtensao[2] * 2,
              ]}
              rotacao={acesso.rotacao}
              cor={COR_PISO}
            />
          </group>
        ))}

        <group name="baias-conves-inferior">
          <Baia posicao={[-3.9, 0.44, -8.5]} nivel="inferior" />
          <Baia posicao={[3.9, 0.44, -8.5]} nivel="inferior" />
        </group>
        <group name="baias-conves-medio">
          <Baia posicao={[-3.9, 2.22, -7]} nivel="medio" />
          <Baia posicao={[3.9, 2.22, -7]} nivel="medio" />
        </group>
        <group name="poleiros-conves-superior">
          <Baia posicao={[-3.7, 4.12, -8]} nivel="superior" />
          <Baia posicao={[3.7, 4.12, -8]} nivel="superior" />
        </group>
        <group name="lampioes-interior-arca">
          <LuzAcolhedora posicao={[-4.8, 1.6, -4]} />
          <LuzAcolhedora posicao={[4.8, 3.45, -5]} />
          <LuzAcolhedora posicao={[0, 5.35, -9]} />
        </group>
      </RigidBody>
    </group>
  )
}

function MantimentoCarregado({
  tipo,
  posicaoJogadorRef,
}: {
  tipo: TipoMantimentoNoe
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
}) {
  const grupoRef = useRef<Group>(null)

  useFrame(() => {
    const jogador = posicaoJogadorRef.current
    if (!jogador || !grupoRef.current) return
    grupoRef.current.position.set(jogador.x + 0.48, jogador.y + 0.85, jogador.z)
  })

  return (
    <group ref={grupoRef} name={`mantimento-carregado-${tipo}`} scale={0.62}>
      <VisualMantimento tipo={tipo} />
    </group>
  )
}

/**
 * M3 detector and visuals. It never owns keyboard input: pickup is local and
 * only delivery invokes the durable progression callback supplied by runtime.
 */
export function MantimentosArcaNoe({
  momentoAtualId,
  progressoMomentoAtual,
  posicaoJogadorRef,
  enabled,
  onCandidatoChange,
  onConcluirUnidade,
}: MantimentosArcaNoeProps) {
  const [mantimentoCarregadoId, setMantimentoCarregadoId] =
    useState<TipoMantimentoNoe | null>(null)
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const onConcluirUnidadeRef = useRef(onConcluirUnidade)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const entregaSolicitadaRef = useRef<string | null>(null)
  const estados = useMemo(
    () =>
      descreverEstadoMantimentosNoe(
        momentoAtualId,
        progressoMomentoAtual,
        mantimentoCarregadoId,
      ),
    [mantimentoCarregadoId, momentoAtualId, progressoMomentoAtual],
  )
  const mantimentoCarregadoAtivo = estados.some(({ carregado }) => carregado)
    ? mantimentoCarregadoId
    : null

  useEffect(() => {
    onCandidatoChangeRef.current = onCandidatoChange
  }, [onCandidatoChange])

  useEffect(() => {
    onConcluirUnidadeRef.current = onConcluirUnidade
  }, [onConcluirUnidade])

  useEffect(() => {
    candidatoPublicadoRef.current = null
    onCandidatoChangeRef.current?.(null)
  }, [mantimentoCarregadoAtivo, momentoAtualId, progressoMomentoAtual])

  useEffect(() => () => onCandidatoChangeRef.current?.(null), [])

  useFrame(() => {
    const jogador = posicaoJogadorRef.current
    const candidato =
      enabled && jogador
        ? resolverCandidatoMantimentoNoe(
            jogador,
            momentoAtualId,
            progressoMomentoAtual,
            mantimentoCarregadoAtivo,
          )
        : null
    const assinatura = candidato
      ? `${candidato.id}:${candidato.etapaInteracao}`
      : null
    if (assinatura === candidatoPublicadoRef.current) return

    candidatoPublicadoRef.current = assinatura
    if (!candidato) {
      onCandidatoChangeRef.current?.(null)
      return
    }

    onCandidatoChangeRef.current?.({
      ...candidato,
      acionar: () => {
        if (candidato.etapaInteracao === 'coleta') {
          entregaSolicitadaRef.current = null
          setMantimentoCarregadoId(candidato.mantimentoId)
          return
        }

        const assinaturaEntrega = `${candidato.acaoId}:${candidato.unidadeId}`
        if (entregaSolicitadaRef.current === assinaturaEntrega) return
        entregaSolicitadaRef.current = assinaturaEntrega
        onConcluirUnidadeRef.current(candidato.acaoId, candidato.unidadeId)
      },
    })
  })

  const m3JaApresentado =
    momentoAtualId === 'estoque-mantimentos' ||
    estados.some(({ concluido }) => concluido)

  if (!m3JaApresentado) return null

  return (
    <group name="mantimentos-arca-noe-m3">
      <InteriorTresNiveisArcaNoe />
      {estados.map(
        ({ descritor, mostrarNaColeta, mostrarNoDestino, carregado }) => (
          <group key={descritor.id} name={`mantimento-${descritor.id}`}>
            {mostrarNaColeta && (
              <group position={[...descritor.posicaoColeta]}>
                <VisualMantimento tipo={descritor.id} />
                <MarcadorMantimento posicao={[0, 0, 0]} etapa="coleta" />
              </group>
            )}
            {mostrarNoDestino && (
              <group
                position={[...descritor.posicaoDestino]}
                name={`mantimento-organizado-${descritor.id}`}
                userData={{ organizado: true, unidadeId: descritor.unidadeId }}
              >
                <VisualMantimento tipo={descritor.id} />
                <group position={[0.72, 0, 0]} scale={0.9}>
                  <VisualMantimento tipo={descritor.id} />
                </group>
              </group>
            )}
            {carregado && (
              <>
                <MantimentoCarregado
                  tipo={descritor.id}
                  posicaoJogadorRef={posicaoJogadorRef}
                />
                <MarcadorMantimento
                  posicao={descritor.posicaoDestino}
                  etapa="entrega"
                />
              </>
            )}
          </group>
        ),
      )}
    </group>
  )
}
