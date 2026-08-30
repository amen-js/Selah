import { useFrame } from '@react-three/fiber'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { Group } from 'three'
import type { Ponto3D } from '../../../../mapas/types'
import type { PosicaoJogador } from '../../creation/proximidade'
import type { MomentoNoeId, ProgressoAcaoNoe } from '../progression/types'
import { FamiliaNoeEmGrupo, GrupoAnimaisNoe } from './AnimaisFamiliaNoe'
import type { EspecieVisualNoe } from './animais'
import {
  descreverEstadoHabitatsArcaNoe,
  habitatConcluidoNoe,
  habitatsArcaNoe,
  habitatsArcaNoeVisiveis,
  resolverCandidatoHabitatArcaNoe,
  type AcaoHabitatNoeId,
  type CandidatoHabitatNoePuro,
  type DescritorHabitatNoe,
  type FamiliaHabitatNoeId,
  type NivelHabitatNoe,
} from './habitats'

export interface CandidatoHabitatNoe extends CandidatoHabitatNoePuro {
  acionar: () => void
}

export interface HabitatsArcaNoeProps {
  momentoAtualId: MomentoNoeId
  progressoMomentoAtual: readonly ProgressoAcaoNoe[]
  playerRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  onCandidatoChange?: (candidato: CandidatoHabitatNoe | null) => void
  onConcluirUnidade: (acaoId: AcaoHabitatNoeId, unidadeId: string) => void
}

function especiesDaFamilia(
  descritor: DescritorHabitatNoe,
): readonly EspecieVisualNoe[] {
  if (descritor.especie === 'familia-noe') return []
  return Array.from(
    { length: Math.max(2, descritor.quantidade) },
    () => descritor.especie as EspecieVisualNoe,
  )
}

function VisualFamiliaHabitat({
  descritor,
  descansando = false,
  escala = 1,
}: {
  descritor: DescritorHabitatNoe
  descansando?: boolean
  escala?: number
}) {
  if (descritor.especie === 'familia-noe') {
    return (
      <group scale={escala}>
        <FamiliaNoeEmGrupo descansando={descansando} />
      </group>
    )
  }

  return (
    <GrupoAnimaisNoe
      especies={especiesDaFamilia(descritor)}
      descansando={descansando}
      escala={escala}
    />
  )
}

function MarcadorHabitat({
  cor,
  nivel,
  selecionado,
}: {
  cor: string
  nivel: NivelHabitatNoe
  selecionado: boolean
}) {
  const lados = nivel === 'inferior' ? 4 : nivel === 'medio' ? 6 : 8
  return (
    <group name={`marcador-habitat-${nivel}`}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.62, 0.82, 28]} />
        <meshBasicMaterial
          color={cor}
          transparent
          opacity={selecionado ? 0.96 : 0.56}
        />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.22, lados]} />
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={selecionado ? 0.78 : 0.25}
          roughness={0.48}
        />
      </mesh>
      {selecionado && (
        <pointLight color={cor} intensity={2.8} distance={3.1} decay={2} />
      )}
    </group>
  )
}

function HabitatAcolhedor({
  descritor,
  concluido,
  selecionado,
}: {
  descritor: DescritorHabitatNoe
  concluido: boolean
  selecionado: boolean
}) {
  const alturaCerca = descritor.nivel === 'inferior' ? 0.72 : 0.52
  return (
    <group
      name={`habitat-${descritor.id}`}
      position={[...descritor.posicaoHabitat]}
      userData={{
        nivel: descritor.nivel,
        unidadeId: descritor.unidadeId,
        familiaDescansando: concluido,
      }}
    >
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.28, 1.4, 0.16, 12]} />
        <meshStandardMaterial
          color={concluido ? '#c89a55' : '#816349'}
          roughness={0.94}
        />
      </mesh>
      {[-1.25, 1.25].map((x) => (
        <group key={x} position={[x, alturaCerca / 2 - 0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, alturaCerca, 2.45]} />
            <meshStandardMaterial color="#60442f" roughness={0.9} />
          </mesh>
          {[0.08, alturaCerca - 0.16].map((y) => (
            <mesh key={y} position={[-x, y - alturaCerca / 2, -1.12]}>
              <boxGeometry args={[2.5, 0.08, 0.08]} />
              <meshStandardMaterial color="#98653d" roughness={0.88} />
            </mesh>
          ))}
        </group>
      ))}
      <group name="palha-macia" position={[0, -0.02, 0]}>
        {[-0.55, -0.18, 0.2, 0.58].map((x, indice) => (
          <mesh
            key={x}
            position={[x, 0, (indice % 2 === 0 ? -1 : 1) * 0.42]}
            rotation={[0, (indice - 1.5) * 0.22, 0]}
          >
            <boxGeometry args={[0.62, 0.08, 1.15]} />
            <meshStandardMaterial color="#d1a84e" roughness={0.96} />
          </mesh>
        ))}
      </group>
      {!concluido && (
        <MarcadorHabitat
          cor={descritor.cor}
          nivel={descritor.nivel}
          selecionado={selecionado}
        />
      )}
      {concluido && (
        <group name={`familia-descansando-${descritor.id}`}>
          <VisualFamiliaHabitat
            descritor={descritor}
            descansando
            escala={descritor.nivel === 'inferior' ? 0.68 : 0.62}
          />
        </group>
      )}
    </group>
  )
}

function FamiliaAguardando({ descritor }: { descritor: DescritorHabitatNoe }) {
  return (
    <group
      name={`familia-aguardando-${descritor.id}`}
      position={[...descritor.posicaoEspera]}
      userData={{ grupoInteiro: true, familiaId: descritor.id }}
    >
      <VisualFamiliaHabitat descritor={descritor} escala={0.58} />
      <MarcadorHabitat
        cor={descritor.cor}
        nivel={descritor.nivel}
        selecionado={false}
      />
    </group>
  )
}

function FamiliaCarregada({
  descritor,
  playerRef,
}: {
  descritor: DescritorHabitatNoe
  playerRef: RefObject<PosicaoJogador | null>
}) {
  const grupoRef = useRef<Group>(null)

  useFrame((state) => {
    const jogador = playerRef.current
    const grupo = grupoRef.current
    if (!jogador || !grupo) return
    grupo.position.set(
      jogador.x + 0.72,
      jogador.y + 1.12 + Math.sin(state.clock.elapsedTime * 2.2) * 0.05,
      jogador.z,
    )
    grupo.rotation.y = -state.clock.elapsedTime * 0.18
  })

  return (
    <group
      ref={grupoRef}
      name={`familia-em-deslocamento-${descritor.id}`}
      userData={{ grupoInteiro: true, familiaId: descritor.id }}
    >
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.72, 14, 10]} />
        <meshBasicMaterial color={descritor.cor} transparent opacity={0.2} />
      </mesh>
      <VisualFamiliaHabitat descritor={descritor} escala={0.36} />
    </group>
  )
}

function LampioesHabitats() {
  const lampioes: readonly [Ponto3D, string][] = [
    [[-4.8, 1.8, -26], '#ffc26d'],
    [[4.8, 1.8, -26], '#ffc26d'],
    [[-4.8, 3.55, -25], '#ffd27f'],
    [[4.8, 5.35, -25], '#ffe09a'],
  ]

  return (
    <group name="lampioes-habitats-noe">
      {lampioes.map(([posicao, cor], indice) => (
        <group key={indice} position={[...posicao]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.15, 0.34, 8]} />
            <meshStandardMaterial
              color={cor}
              emissive={cor}
              emissiveIntensity={1.15}
            />
          </mesh>
          <pointLight color={cor} intensity={2.1} distance={4.2} decay={2} />
        </group>
      ))}
    </group>
  )
}

/**
 * M5 matching puzzle. Picking a family is local; only the matching deck
 * placement emits durable progression. Finished families remain resting.
 */
export function HabitatsArcaNoe({
  momentoAtualId,
  progressoMomentoAtual,
  playerRef,
  enabled,
  onCandidatoChange,
  onConcluirUnidade,
}: HabitatsArcaNoeProps) {
  const [familiaSelecionadaId, setFamiliaSelecionadaId] =
    useState<FamiliaHabitatNoeId | null>(null)
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const onConcluirUnidadeRef = useRef(onConcluirUnidade)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const encaixeSolicitadoRef = useRef<string | null>(null)
  const familiaSelecionadaEfetivaId = useMemo(() => {
    if (momentoAtualId !== 'acomodacao-animais' || !familiaSelecionadaId) {
      return null
    }
    const descritor = habitatsArcaNoe.find(
      ({ id }) => id === familiaSelecionadaId,
    )
    if (
      !descritor ||
      habitatConcluidoNoe(
        descritor,
        momentoAtualId,
        progressoMomentoAtual,
      )
    ) {
      return null
    }
    return familiaSelecionadaId
  }, [familiaSelecionadaId, momentoAtualId, progressoMomentoAtual])
  const estados = useMemo(
    () =>
      descreverEstadoHabitatsArcaNoe(
        momentoAtualId,
        progressoMomentoAtual,
        familiaSelecionadaEfetivaId,
      ),
    [familiaSelecionadaEfetivaId, momentoAtualId, progressoMomentoAtual],
  )

  useEffect(() => {
    onCandidatoChangeRef.current = onCandidatoChange
  }, [onCandidatoChange])

  useEffect(() => {
    onConcluirUnidadeRef.current = onConcluirUnidade
  }, [onConcluirUnidade])

  useEffect(() => {
    candidatoPublicadoRef.current = null
    onCandidatoChangeRef.current?.(null)
  }, [familiaSelecionadaEfetivaId, momentoAtualId, progressoMomentoAtual])

  useEffect(() => () => onCandidatoChangeRef.current?.(null), [])

  useFrame(() => {
    const jogador = playerRef.current
    const candidato =
      enabled && jogador
        ? resolverCandidatoHabitatArcaNoe(
            jogador,
            momentoAtualId,
            progressoMomentoAtual,
            familiaSelecionadaEfetivaId,
          )
        : null
    const assinatura = candidato
      ? `${candidato.id}:${candidato.etapaInteracao}:${candidato.distancia.toFixed(2)}`
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
        if (candidato.etapaInteracao === 'selecionar-familia') {
          encaixeSolicitadoRef.current = null
          setFamiliaSelecionadaId(candidato.familiaId)
          return
        }
        if (candidato.etapaInteracao === 'devolver-familia') {
          encaixeSolicitadoRef.current = null
          setFamiliaSelecionadaId(null)
          return
        }

        const assinaturaEncaixe = `${candidato.acaoId}:${candidato.unidadeId}`
        if (encaixeSolicitadoRef.current === assinaturaEncaixe) return
        encaixeSolicitadoRef.current = assinaturaEncaixe
        onConcluirUnidadeRef.current(
          candidato.acaoId,
          candidato.unidadeId,
        )
      },
    })
  })

  if (!habitatsArcaNoeVisiveis(momentoAtualId)) return null

  const selecionada = estados.find(({ selecionado }) => selecionado)

  return (
    <group name="habitats-arca-noe-m5">
      <LampioesHabitats />
      {estados.map(
        ({
          descritor,
          concluido,
          selecionado,
          mostrarNaEspera,
        }) => (
          <group key={descritor.id} name={`puzzle-habitat-${descritor.id}`}>
            <HabitatAcolhedor
              descritor={descritor}
              concluido={concluido}
              selecionado={selecionado}
            />
            {mostrarNaEspera && <FamiliaAguardando descritor={descritor} />}
          </group>
        ),
      )}
      {selecionada && (
        <FamiliaCarregada
          descritor={selecionada.descritor}
          playerRef={playerRef}
        />
      )}
    </group>
  )
}
