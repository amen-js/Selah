import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import {
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from 'react'
import type { Group } from 'three'
import type { Ponto3D } from '../../../../mapas/types'
import type { PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
} from '../progression/types'
import {
  descreverTarefasAbrigoTempestadeNoe,
  obterEstadoVisualAbrigoNoe,
  resolverCandidatoAbrigoTempestadeNoe,
  type AcaoAbrigoTempestadeNoeId,
  type CandidatoAbrigoTempestadeNoePuro,
  type EstadoTarefaAbrigoNoe,
  type TipoVisualTarefaAbrigoNoe,
} from './abrigoTempestade'

export interface CandidatoAbrigoTempestadeNoe
  extends CandidatoAbrigoTempestadeNoePuro {
  /** Confirmation is invoked by the region arbiter; this component owns no key listener. */
  acionar: () => void
}

export interface AbrigoTempestadeNoeProps {
  estado: EstadoProgressaoNoe
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  reducedMotion?: boolean
  onCandidatoChange?: (
    candidato: CandidatoAbrigoTempestadeNoe | null,
  ) => void
  onConcluirUnidade: (acaoId: AcaoNoeId, unidadeId: string) => void
}

function MaterialMadeira({ cor = '#8a5735' }: { cor?: string }) {
  return <meshStandardMaterial color={cor} roughness={0.9} />
}

function PortaArcaNoe({
  fechada,
  reducedMotion,
}: {
  fechada: boolean
  reducedMotion: boolean
}) {
  const portaRef = useRef<Group>(null)
  const poseInicialAplicadaRef = useRef(false)
  const anguloAberta = -Math.PI * 0.48

  useFrame((_, delta) => {
    if (!portaRef.current) return
    const alvo = fechada ? 0 : anguloAberta
    if (reducedMotion || !poseInicialAplicadaRef.current) {
      portaRef.current.rotation.y = alvo
      poseInicialAplicadaRef.current = true
      return
    }
    const passo = 1 - Math.exp(-Math.min(delta, 0.1) * 3.2)
    portaRef.current.rotation.y +=
      (alvo - portaRef.current.rotation.y) * passo
  })

  return (
    <group
      name="porta-pivo-arca-noe"
      position={[-1.4, 0.44, -2.18]}
      userData={{ estado: fechada ? 'fechada' : 'aberta', pivo: true }}
    >
      <group ref={portaRef}>
        <mesh castShadow receiveShadow position={[1.4, 1.55, 0]}>
          <boxGeometry args={[2.72, 3.08, 0.2]} />
          <MaterialMadeira cor="#875230" />
        </mesh>
        {[-0.86, 0, 0.86].map((x) => (
          <mesh key={x} castShadow position={[1.4 + x, 1.55, -0.12]}>
            <boxGeometry args={[0.1, 2.86, 0.09]} />
            <MaterialMadeira cor="#ba7b43" />
          </mesh>
        ))}
        <mesh position={[2.38, 1.46, -0.19]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial
            color="#ddb66b"
            metalness={0.18}
            roughness={0.55}
          />
        </mesh>
      </group>

      {fechada && (
        <RigidBody
          name="colisor-porta-fechada-noe"
          type="fixed"
          colliders={false}
        >
          <CuboidCollider
            args={[1.36, 1.54, 0.1]}
            position={[1.4, 1.55, 0]}
            friction={1}
          />
        </RigidBody>
      )}
    </group>
  )
}

function LampiaoAcolhedor({ posicao }: { posicao: Ponto3D }) {
  return (
    <group position={[...posicao]} name="lampiao-refugio-noe">
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.38, 8]} />
        <meshStandardMaterial
          color="#ffd47d"
          emissive="#ff9d43"
          emissiveIntensity={1.2}
          roughness={0.6}
        />
      </mesh>
      <pointLight color="#ffc56f" intensity={2.8} distance={5.2} decay={2} />
    </group>
  )
}

function MarcadorTarefaAbrigoNoe({ tarefa }: { tarefa: EstadoTarefaAbrigoNoe }) {
  if (tarefa.estado !== 'disponivel') return null
  const cor = tarefa.momentoId === 'fechamento-porta' ? '#f5c66d' : '#82d7b4'

  return (
    <group
      position={[...tarefa.posicao]}
      name={`marcador-${tarefa.id}`}
      userData={{ acaoId: tarefa.acaoId, unidadeId: tarefa.unidadeId }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[0.5, 0.64, 24]} />
        <meshBasicMaterial color={cor} transparent opacity={0.78} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={0.55}
          roughness={0.45}
        />
      </mesh>
      <pointLight color={cor} intensity={2} distance={2.5} decay={2} />
    </group>
  )
}

function NoeChamando() {
  return (
    <group
      name="noe-chamado-final"
      position={[-4.2, 0, 1.8]}
      rotation={[0, 0.18, 0]}
      userData={{ papel: 'chamado-sem-urgencia' }}
    >
      <mesh castShadow position={[0, 1.05, 0]} scale={[0.46, 0.68, 0.34]}>
        <capsuleGeometry args={[0.58, 0.75, 5, 10]} />
        <meshStandardMaterial color="#b87543" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 1.82, 0]} scale={[0.38, 0.42, 0.36]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#ad7654" roughness={0.96} />
      </mesh>
      <mesh castShadow position={[0, 1.58, 0.18]} scale={[0.25, 0.34, 0.22]}>
        <coneGeometry args={[1, 1.3, 9]} />
        <meshStandardMaterial color="#eee0c2" roughness={1} />
      </mesh>
      <group position={[0.42, 1.35, 0]} rotation={[0, 0, -1.02]}>
        <mesh castShadow position={[0, 0.3, 0]} scale={[0.12, 0.43, 0.12]}>
          <capsuleGeometry args={[0.5, 1, 5, 8]} />
          <meshStandardMaterial color="#ad7654" roughness={0.96} />
        </mesh>
        <mesh castShadow position={[0, 0.66, 0]} scale={0.13}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#ad7654" roughness={0.96} />
        </mesh>
      </group>
    </group>
  )
}

function TigelaAlimento({ alimentado }: { alimentado: boolean }) {
  return (
    <group position={[0, 0.08, 0.55]}>
      <mesh castShadow scale={[0.55, 0.2, 0.38]}>
        <sphereGeometry args={[0.5, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <MaterialMadeira cor="#8c5c39" />
      </mesh>
      {alimentado &&
        [-0.16, 0, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.12, 0.55]} scale={0.065}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#d7b25b" roughness={0.95} />
          </mesh>
        ))}
    </group>
  )
}

function FilhotesAves({ alimentados }: { alimentados: boolean }) {
  return (
    <group name="filhotes-aves-noe">
      {[-0.27, 0.27].map((x) => (
        <group key={x} position={[x, 0.2, 0]}>
          <mesh castShadow scale={[0.22, 0.2, 0.25]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#e5c55d" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.14, 0.18]} scale={[0.13, 0.12, 0.13]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#ead174" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.13, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 0.18, 6]} />
            <meshStandardMaterial color="#d9883f" roughness={0.85} />
          </mesh>
        </group>
      ))}
      <TigelaAlimento alimentado={alimentados} />
    </group>
  )
}

function FilhotesHerbivoros({ alimentados }: { alimentados: boolean }) {
  return (
    <group name="filhotes-herbivoros-noe">
      {[-0.34, 0.34].map((x) => (
        <group key={x} position={[x, 0.34, 0]}>
          <mesh castShadow scale={[0.34, 0.3, 0.43]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#d4c29b" roughness={0.97} />
          </mesh>
          <mesh position={[0, 0.12, 0.36]} scale={[0.24, 0.25, 0.22]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#decaa3" roughness={0.97} />
          </mesh>
          {[-0.14, 0.14].map((orelha) => (
            <mesh
              key={orelha}
              position={[orelha, 0.31, 0.37]}
              rotation={[0.25, 0, orelha < 0 ? 0.45 : -0.45]}
            >
              <coneGeometry args={[0.08, 0.25, 7]} />
              <meshStandardMaterial color="#ba9b76" roughness={0.96} />
            </mesh>
          ))}
        </group>
      ))}
      <TigelaAlimento alimentado={alimentados} />
    </group>
  )
}

function FilhotesMamiferos({ alimentados }: { alimentados: boolean }) {
  return (
    <group name="filhotes-mamiferos-noe">
      {[-0.28, 0.28].map((x) => (
        <group key={x} position={[x, 0.23, 0]}>
          <mesh castShadow scale={[0.25, 0.23, 0.35]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#b88967" roughness={0.96} />
          </mesh>
          <mesh position={[0, 0.11, 0.29]} scale={0.2}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#c99a77" roughness={0.96} />
          </mesh>
          {[-0.12, 0.12].map((orelha) => (
            <mesh key={orelha} position={[orelha, 0.27, 0.27]}>
              <sphereGeometry args={[0.09, 9, 7]} />
              <meshStandardMaterial color="#9f7054" roughness={0.96} />
            </mesh>
          ))}
        </group>
      ))}
      <TigelaAlimento alimentado={alimentados} />
    </group>
  )
}

function CuidadoFilhotes({
  tipo,
  posicao,
  alimentado,
}: {
  tipo: TipoVisualTarefaAbrigoNoe
  posicao: Ponto3D
  alimentado: boolean
}) {
  return (
    <group
      position={[...posicao]}
      name={`estacao-${tipo}`}
      userData={{ alimentado, persistente: true }}
    >
      {tipo === 'filhotes-aves' ? (
        <FilhotesAves alimentados={alimentado} />
      ) : tipo === 'filhotes-herbivoros' ? (
        <FilhotesHerbivoros alimentados={alimentado} />
      ) : (
        <FilhotesMamiferos alimentados={alimentado} />
      )}
    </group>
  )
}

/**
 * M6/M7 detector and scene dressing. It exposes one callback candidate and
 * deliberately leaves keyboard ownership to NoeWorldRuntime.
 */
export function AbrigoTempestadeNoe({
  estado,
  posicaoJogadorRef,
  enabled,
  reducedMotion = false,
  onCandidatoChange,
  onConcluirUnidade,
}: AbrigoTempestadeNoeProps) {
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const onConcluirUnidadeRef = useRef(onConcluirUnidade)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const conclusaoSolicitadaRef = useRef<string | null>(null)
  const tarefas = useMemo(
    () => descreverTarefasAbrigoTempestadeNoe(estado),
    [estado],
  )
  const visual = useMemo(() => obterEstadoVisualAbrigoNoe(estado), [estado])

  useEffect(() => {
    onCandidatoChangeRef.current = onCandidatoChange
  }, [onCandidatoChange])

  useEffect(() => {
    onConcluirUnidadeRef.current = onConcluirUnidade
  }, [onConcluirUnidade])

  useEffect(() => {
    conclusaoSolicitadaRef.current = null
    candidatoPublicadoRef.current = null
    onCandidatoChangeRef.current?.(null)
  }, [estado])

  useEffect(() => () => onCandidatoChangeRef.current?.(null), [])

  useFrame(() => {
    const jogador = posicaoJogadorRef.current
    const candidato =
      enabled && jogador
        ? resolverCandidatoAbrigoTempestadeNoe(jogador, estado)
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
        onConcluirUnidadeRef.current(
          candidato.acaoId as AcaoAbrigoTempestadeNoeId,
          candidato.unidadeId,
        )
      },
    })
  })

  const m6Apresentado =
    indiceMomentoNoe(estado.momentoAtualId) >=
    indiceMomentoNoe('fechamento-porta')
  const m7Apresentado =
    indiceMomentoNoe(estado.momentoAtualId) >=
    indiceMomentoNoe('refugio-tempestade')
  const cuidados = tarefas.filter(
    ({ momentoId }) => momentoId === 'refugio-tempestade',
  )

  if (!m6Apresentado) return null

  return (
    <group name="abrigo-tempestade-noe-m6-m7">
      <PortaArcaNoe
        fechada={visual.porta === 'fechada'}
        reducedMotion={reducedMotion}
      />
      {estado.momentoAtualId === 'fechamento-porta' && <NoeChamando />}

      {visual.interiorAcolhedor && (
        <group name="luz-acolhedora-refugio-noe">
          <LampiaoAcolhedor posicao={[-4.75, 1.7, -18]} />
          <LampiaoAcolhedor posicao={[4.75, 3.48, -21]} />
          <LampiaoAcolhedor posicao={[0, 5.3, -25.5]} />
        </group>
      )}

      {m7Apresentado &&
        cuidados.map((tarefa) => (
          <CuidadoFilhotes
            key={tarefa.id}
            tipo={tarefa.tipoVisual}
            posicao={tarefa.posicao}
            alimentado={tarefa.estado === 'concluida'}
          />
        ))}

      {tarefas.map((tarefa) => (
        <MarcadorTarefaAbrigoNoe key={tarefa.id} tarefa={tarefa} />
      ))}
    </group>
  )
}
