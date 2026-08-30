import { useFrame } from '@react-three/fiber'
import {
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from 'react'
import type { Group } from 'three'
import type { Ponto3D } from '../../../../mapas/types'
import type { PosicaoJogador } from '../../creation/proximidade'
import type { EstadoProgressaoNoe } from '../progression/types'
import {
  descreverTarefasPombaEsperancaNoe,
  obterEstadoVisualPombaEsperancaNoe,
  resolverCandidatoPombaEsperancaNoe,
  type AcaoPombaEsperancaNoeId,
  type CandidatoPombaEsperancaNoePuro,
  type FaseVisualPombaNoe,
} from './pombaEsperanca'

export interface CandidatoPombaEsperancaNoe
  extends CandidatoPombaEsperancaNoePuro {
  acionar: () => void
}

export interface PombaEsperancaNoeProps {
  estado: EstadoProgressaoNoe
  playerRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  reducedMotion?: boolean
  onCandidatoChange?: (
    candidato: CandidatoPombaEsperancaNoe | null,
  ) => void
  onConcluirUnidade: (
    acaoId: AcaoPombaEsperancaNoeId,
    unidadeId: string,
  ) => void
}

function Caixa({
  posicao,
  dimensoes,
  cor,
}: {
  posicao: Ponto3D
  dimensoes: Ponto3D
  cor: string
}) {
  return (
    <mesh castShadow receiveShadow position={[...posicao]}>
      <boxGeometry args={[...dimensoes]} />
      <meshStandardMaterial color={cor} roughness={0.78} />
    </mesh>
  )
}

/** A genuine procedural olive twig: woody stem, lateral shoots and leaves. */
function RamoOliveira() {
  const folhas = [
    [-0.27, 0.08, -0.02, -0.55],
    [-0.08, -0.06, 0.02, 0.55],
    [0.11, 0.07, -0.01, -0.5],
    [0.3, -0.05, 0.01, 0.5],
  ] as const

  return (
    <group name="ramo-de-oliveira-real" rotation={[0.08, 0, -0.16]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.026, 0.78, 7]} />
        <meshStandardMaterial color="#725132" roughness={0.9} />
      </mesh>
      {folhas.map(([x, y, z, rotacaoZ], indice) => (
        <mesh
          key={indice}
          position={[x, y, z]}
          rotation={[0, 0, rotacaoZ]}
          scale={[0.17, 0.055, 0.07]}
        >
          <sphereGeometry args={[1, 9, 6]} />
          <meshStandardMaterial
            color={indice % 2 === 0 ? '#6e9b51' : '#8aae63'}
            roughness={0.82}
          />
        </mesh>
      ))}
    </group>
  )
}

function AsaPomba({ lado }: { lado: -1 | 1 }) {
  return (
    <group rotation={[0, 0, lado * 0.3]}>
      <mesh
        castShadow
        position={[lado * 0.45, 0, -0.05]}
        rotation={[0, 0, lado * -0.18]}
        scale={[0.58, 0.1, 0.82]}
      >
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#edf1ec" roughness={0.72} />
      </mesh>
      <mesh
        castShadow
        position={[lado * 0.75, -0.02, -0.2]}
        rotation={[0, lado * -0.12, lado * -0.27]}
        scale={[0.44, 0.075, 0.58]}
      >
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color="#dfe8e4" roughness={0.76} />
      </mesh>
    </group>
  )
}

function PombaProcedural({
  fase,
  reducedMotion,
}: {
  fase: FaseVisualPombaNoe
  reducedMotion: boolean
}) {
  const pombaRef = useRef<Group>(null)
  const asaEsquerdaRef = useRef<Group>(null)
  const asaDireitaRef = useRef<Group>(null)
  const voando = fase === 'retornando-com-oliveira'

  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    const batida = reducedMotion ? 0.18 : Math.sin(tempo * 7.5) * 0.72

    if (asaEsquerdaRef.current) asaEsquerdaRef.current.rotation.z = batida
    if (asaDireitaRef.current) asaDireitaRef.current.rotation.z = -batida
    if (!pombaRef.current) return

    if (voando && !reducedMotion) {
      pombaRef.current.position.set(
        Math.sin(tempo * 0.65) * 1.35,
        0.55 + Math.sin(tempo * 1.3) * 0.18,
        0.25 + Math.cos(tempo * 0.65) * 0.72,
      )
      pombaRef.current.rotation.y = Math.sin(tempo * 0.65) * 0.35
      return
    }

    pombaRef.current.position.set(0, 0.18, 0.35)
    pombaRef.current.rotation.y = 0
  })

  return (
    <group ref={pombaRef} name={`pomba-storybook-${fase}`} scale={0.72}>
      <mesh castShadow scale={[0.48, 0.42, 0.72]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#f4f4ee" roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 0.36, 0.47]} scale={[0.34, 0.34, 0.36]}>
        <sphereGeometry args={[1, 12, 9]} />
        <meshStandardMaterial color="#faf9ef" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0.84]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.28, 7]} />
        <meshStandardMaterial color="#e6a55a" roughness={0.65} />
      </mesh>
      {[-1, 1].map((lado) => (
        <mesh
          key={`olho-${lado}`}
          position={[lado * 0.16, 0.45, 0.72]}
          scale={0.045}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#273236" roughness={0.45} />
        </mesh>
      ))}
      <group ref={asaEsquerdaRef} position={[-0.28, 0.08, 0]}>
        <AsaPomba lado={-1} />
      </group>
      <group ref={asaDireitaRef} position={[0.28, 0.08, 0]}>
        <AsaPomba lado={1} />
      </group>
      <group position={[0, -0.08, 1.01]} scale={0.82}>
        {(fase === 'retornando-com-oliveira' ||
          fase === 'pousada-com-oliveira') && <RamoOliveira />}
      </group>
    </group>
  )
}

function JanelaSuperior({ iluminada }: { iluminada: boolean }) {
  return (
    <group name="janela-superior-pomba" position={[0, 0, -1.35]}>
      <mesh position={[0, 0.18, 0]}>
        <planeGeometry args={[2.15, 1.45]} />
        <meshStandardMaterial
          color={iluminada ? '#a8d9df' : '#7c9fa4'}
          emissive={iluminada ? '#6ab5c5' : '#20373b'}
          emissiveIntensity={iluminada ? 0.65 : 0.2}
          roughness={0.45}
        />
      </mesh>
      <Caixa posicao={[-1.18, 0.18, 0.04]} dimensoes={[0.2, 1.75, 0.18]} cor="#6a4228" />
      <Caixa posicao={[1.18, 0.18, 0.04]} dimensoes={[0.2, 1.75, 0.18]} cor="#6a4228" />
      <Caixa posicao={[0, 1.02, 0.04]} dimensoes={[2.55, 0.2, 0.18]} cor="#6a4228" />
      <Caixa posicao={[0, -0.66, 0.04]} dimensoes={[2.55, 0.2, 0.18]} cor="#6a4228" />
      <pointLight
        color="#bcecf2"
        intensity={iluminada ? 3.2 : 1.1}
        distance={4.5}
        decay={2}
      />
    </group>
  )
}

function MarcadorPomba({ ativo }: { ativo: boolean }) {
  if (!ativo) return null
  return (
    <group name="marcador-pomba-esperanca" position={[0, -0.55, 0.4]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.79, 28]} />
        <meshBasicMaterial color="#8fe3d3" transparent opacity={0.82} />
      </mesh>
      <pointLight color="#b9f1df" intensity={2.1} distance={3.2} decay={2} />
    </group>
  )
}

/** M8 story scene. Interaction is published to the shared arbiter only. */
export function PombaEsperancaNoe({
  estado,
  playerRef,
  enabled,
  reducedMotion = false,
  onCandidatoChange,
  onConcluirUnidade,
}: PombaEsperancaNoeProps) {
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const onConcluirUnidadeRef = useRef(onConcluirUnidade)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const conclusaoSolicitadaRef = useRef<string | null>(null)
  const visual = useMemo(
    () => obterEstadoVisualPombaEsperancaNoe(estado),
    [estado],
  )
  const tarefas = useMemo(
    () => descreverTarefasPombaEsperancaNoe(estado),
    [estado],
  )

  useLayoutEffect(() => {
    onCandidatoChangeRef.current = onCandidatoChange
  }, [onCandidatoChange])

  useLayoutEffect(() => {
    onConcluirUnidadeRef.current = onConcluirUnidade
  }, [onConcluirUnidade])

  useLayoutEffect(() => {
    candidatoPublicadoRef.current = null
    conclusaoSolicitadaRef.current = null
    onCandidatoChangeRef.current?.(null)
  }, [estado])

  useLayoutEffect(() => () => onCandidatoChangeRef.current?.(null), [])

  useFrame(() => {
    const jogador = playerRef.current
    const candidato =
      enabled && jogador
        ? resolverCandidatoPombaEsperancaNoe(jogador, estado)
        : null
    const assinatura = candidato
      ? `${candidato.acaoId}:${candidato.unidadeId}`
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
        const assinaturaConclusao = `${candidato.acaoId}:${candidato.unidadeId}`
        if (conclusaoSolicitadaRef.current === assinaturaConclusao) return
        conclusaoSolicitadaRef.current = assinaturaConclusao
        onConcluirUnidadeRef.current(candidato.acaoId, candidato.unidadeId)
      },
    })
  })

  if (!visual.visivel) return null

  const tarefaDisponivel = tarefas.some(
    ({ estado: estadoTarefa }) => estadoTarefa === 'disponivel',
  )

  return (
    <group
      name="pomba-esperanca-noe-m8"
      position={[...tarefas[0].posicao]}
      userData={{
        fase: visual.fase,
        ramoOliveira: visual.carregaRamoOliveira,
        semTimerObrigatorio: true,
      }}
    >
      <JanelaSuperior iluminada={visual.janelaIluminada} />
      <PombaProcedural fase={visual.fase} reducedMotion={reducedMotion} />
      <MarcadorPomba ativo={tarefaDisponivel} />
    </group>
  )
}
