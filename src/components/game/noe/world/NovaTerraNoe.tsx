import { CuboidCollider, RigidBody } from '@react-three/rapier'
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
  descreverTarefasNovaTerraNoe,
  obterEstadoVisualNovaTerraNoe,
  resolverCandidatoNovaTerraNoe,
  type AcaoNovaTerraNoeId,
  type CandidatoNovaTerraNoePuro,
  type EstadoTarefaNovaTerraNoe,
  type TipoVisualNovaTerraNoe,
} from './novaTerra'

export interface CandidatoNovaTerraNoe
  extends CandidatoNovaTerraNoePuro {
  acionar: () => void
}

export interface NovaTerraNoeProps {
  estado: EstadoProgressaoNoe
  playerRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  reducedMotion?: boolean
  onCandidatoChange?: (candidato: CandidatoNovaTerraNoe | null) => void
  onConcluirUnidade: (
    acaoId: AcaoNovaTerraNoeId,
    unidadeId: string,
  ) => void
}

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
      <meshStandardMaterial color={cor} roughness={0.88} />
    </mesh>
  )
}

function MontanhaArarate() {
  const penhascos = [
    [-10.5, 0.3, -25.5, 9.5, 5.8, 9.5, '#6f736b'],
    [10.5, 0.15, -25.5, 9.2, 5.5, 9.2, '#777b70'],
    [-14.5, -0.25, -13, 7.2, 4.1, 7.2, '#85877a'],
    [14.5, -0.3, -13, 7.4, 4.2, 7.4, '#7c8075'],
  ] as const

  return (
    <group name="arca-pousada-no-ararate">
      <mesh position={[0, -1.05, -16]} scale={[12.8, 1.15, 17.2]} receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#74796e" roughness={0.96} />
      </mesh>
      {penhascos.map(([x, y, z, sx, sy, sz, cor], indice) => (
        <mesh
          key={indice}
          castShadow
          receiveShadow
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          rotation={[0, indice * 0.58, 0]}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={cor} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, -0.42, 19]} scale={[21, 0.65, 24]} receiveShadow>
        <sphereGeometry args={[1, 22, 12]} />
        <meshStandardMaterial color="#76a75c" roughness={0.98} />
      </mesh>
    </group>
  )
}

function CaminhoAcessivelNovaTerra() {
  const pedras = Array.from({ length: 14 }, (_, indice) => ({
    z: 3.1 + indice * 2.35,
    x: Math.sin(indice * 1.9) * 0.38,
    rotacao: Math.sin(indice) * 0.18,
  }))

  return (
    <RigidBody
      name="caminho-acessivel-arca-nova-terra"
      type="fixed"
      colliders={false}
      userData={{ colisor: 'cuboid-primitivo', larguraLivre: 4.8 }}
    >
      <CuboidCollider
        args={[2.4, 0.08, 16.3]}
        position={[0, 0.02, 18.2]}
        friction={1.15}
      />
      <Caixa
        posicao={[0, 0.01, 18.2]}
        dimensoes={[4.8, 0.16, 32.6]}
        cor="#a8956e"
      />
      {pedras.map(({ z, x, rotacao }, indice) => (
        <mesh
          key={indice}
          receiveShadow
          position={[x, 0.12, z]}
          rotation={[0, rotacao, 0]}
          scale={[1.15, 0.11, 0.72]}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={indice % 2 === 0 ? '#c5b38d' : '#b8a47d'}
            roughness={0.96}
          />
        </mesh>
      ))}
    </RigidBody>
  )
}

function ArvoreNova({
  posicao,
  escala,
}: {
  posicao: Ponto3D
  escala: number
}) {
  return (
    <group position={[...posicao]} scale={escala} name="vegetacao-brotando">
      <mesh castShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 1.3, 8]} />
        <meshStandardMaterial color="#795238" roughness={0.92} />
      </mesh>
      {[
        [-0.3, 1.15, 0, 0.42],
        [0.28, 1.35, 0.04, 0.48],
        [0, 1.62, -0.06, 0.52],
      ].map(([x, y, z, tamanho], indice) => (
        <mesh
          key={indice}
          castShadow
          position={[x, y, z]}
          scale={[tamanho, tamanho * 0.78, tamanho]}
        >
          <sphereGeometry args={[1, 10, 7]} />
          <meshStandardMaterial
            color={indice % 2 === 0 ? '#6fa655' : '#8aba64'}
            roughness={0.88}
          />
        </mesh>
      ))}
    </group>
  )
}

function VegetacaoBrotando({ progresso }: { progresso: number }) {
  const brotos = [
    [-13, 0, 12],
    [-10, 0, 28],
    [-7, 0, 35],
    [7, 0, 35],
    [10, 0, 28],
    [13, 0, 12],
    [-16, 0, 22],
    [16, 0, 22],
  ] as const satisfies readonly Ponto3D[]

  return (
    <group name="jardim-da-nova-terra" userData={{ progressoBrotos: progresso }}>
      {brotos.map((posicao, indice) => (
        <ArvoreNova
          key={indice}
          posicao={posicao}
          escala={0.46 + progresso * 0.11 + (indice % 3) * 0.08}
        />
      ))}
      {Array.from({ length: 20 }, (_, indice) => {
        const lado = indice % 2 === 0 ? -1 : 1
        const z = 7 + (indice % 10) * 3.15
        const x = lado * (3.3 + (indice % 3) * 1.15)
        return (
          <group key={indice} position={[x, 0.12, z]} scale={0.55 + progresso * 0.08}>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.018, 0.025, 0.32, 6]} />
              <meshStandardMaterial color="#4f843e" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.35, 0]} scale={0.11}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial
                color={indice % 4 === 0 ? '#f2ce6b' : '#d787a7'}
                roughness={0.72}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Ave({ deslocamento }: { deslocamento: Ponto3D }) {
  return (
    <group position={[...deslocamento]} scale={0.48}>
      <mesh castShadow scale={[0.32, 0.25, 0.48]}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color="#f2d27b" roughness={0.75} />
      </mesh>
      {[-1, 1].map((lado) => (
        <mesh
          key={lado}
          position={[lado * 0.36, 0.05, 0]}
          rotation={[0, 0, lado * -0.35]}
          scale={[0.42, 0.08, 0.34]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#f7e5ac" roughness={0.78} />
        </mesh>
      ))}
    </group>
  )
}

function Herbivoro({ deslocamento }: { deslocamento: Ponto3D }) {
  return (
    <group position={[...deslocamento]} scale={0.72}>
      <mesh castShadow position={[0, 0.48, 0]} scale={[0.62, 0.45, 0.9]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#b89b6a" roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0, 0.63, 0.82]} scale={[0.4, 0.36, 0.42]}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color="#c5aa78" roughness={0.84} />
      </mesh>
      {[-0.36, 0.36].flatMap((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 0.05, z]}>
            <cylinderGeometry args={[0.09, 0.11, 0.62, 7]} />
            <meshStandardMaterial color="#8b714f" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  )
}

function Coelho({ deslocamento }: { deslocamento: Ponto3D }) {
  return (
    <group position={[...deslocamento]} scale={0.5}>
      <mesh castShadow position={[0, 0.28, 0]} scale={[0.42, 0.5, 0.55]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#d5b7a8" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 0.65, 0.28]} scale={0.34}>
        <sphereGeometry args={[1, 9, 7]} />
        <meshStandardMaterial color="#e2c9bb" roughness={0.8} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 1.02, 0.22]} scale={[0.1, 0.38, 0.12]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#dcbcaf" roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function GrupoAnimais({ tipo }: { tipo: TipoVisualNovaTerraNoe }) {
  if (tipo === 'aves') {
    return (
      <group name="aves-desembarcando-em-grupo">
        <Ave deslocamento={[-0.7, 0.35, 0]} />
        <Ave deslocamento={[0, 0.7, 0.2]} />
        <Ave deslocamento={[0.7, 0.32, -0.1]} />
      </group>
    )
  }
  if (tipo === 'herbivoros') {
    return (
      <group name="herbivoros-desembarcando-em-grupo">
        <Herbivoro deslocamento={[-1.15, 0, 0]} />
        <Herbivoro deslocamento={[0.25, 0, 0.3]} />
        <Herbivoro deslocamento={[1.4, 0, -0.35]} />
      </group>
    )
  }
  return (
    <group name="mamiferos-desembarcando-em-grupo">
      <Coelho deslocamento={[-0.65, 0, 0]} />
      <Coelho deslocamento={[0, 0, 0.25]} />
      <Coelho deslocamento={[0.65, 0, -0.05]} />
    </group>
  )
}

function MarcadorNovaTerra({ tarefa }: { tarefa: EstadoTarefaNovaTerraNoe }) {
  if (tarefa.estado !== 'disponivel') return null
  const cor = tarefa.etapa === 1 ? '#8edba5' : tarefa.etapa === 2 ? '#f3bd69' : '#8ecfe7'

  return (
    <group position={[...tarefa.posicao]} name={`marcador-${tarefa.tipoVisual}`}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
        <ringGeometry args={[0.65, 0.84, 28]} />
        <meshBasicMaterial color={cor} transparent opacity={0.83} />
      </mesh>
      <pointLight color={cor} intensity={2.4} distance={3.4} decay={2} />
    </group>
  )
}

function AltarGratidao({ construido }: { construido: boolean }) {
  const pedras = construido
    ? ([
        [-0.72, 0.25, -0.4, 0.55],
        [0, 0.28, -0.48, 0.62],
        [0.72, 0.24, -0.38, 0.53],
        [-0.52, 0.3, 0.34, 0.59],
        [0.2, 0.3, 0.4, 0.64],
        [0.82, 0.25, 0.28, 0.52],
        [-0.35, 0.72, -0.05, 0.56],
        [0.35, 0.75, 0.02, 0.58],
      ] as const)
    : ([
        [-1.15, 0.12, -0.7, 0.42],
        [0.9, 0.13, -0.9, 0.45],
        [-0.75, 0.14, 0.85, 0.48],
        [1.2, 0.11, 0.55, 0.4],
      ] as const)

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[0, 0, 30.5]}
      name="altar-de-gratidao"
      userData={{ construido }}
    >
      {construido && (
        <CuboidCollider args={[1.05, 0.65, 0.85]} position={[0, 0.48, 0]} />
      )}
      {pedras.map(([x, y, z, escala], indice) => (
        <mesh
          key={indice}
          castShadow
          receiveShadow
          position={[x, y, z]}
          scale={[escala, escala * 0.7, escala * 0.85]}
          rotation={[0, indice * 0.61, 0]}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={indice % 2 === 0 ? '#898b82' : '#a09a87'}
            roughness={0.96}
          />
        </mesh>
      ))}
      {construido && (
        <pointLight position={[0, 1.35, 0]} color="#ffd387" intensity={2.7} distance={5} decay={2} />
      )}
    </RigidBody>
  )
}

function ArcoIrisAlianca({ reducedMotion }: { reducedMotion: boolean }) {
  const arcoRef = useRef<Group>(null)
  const cores = [
    '#e86e68',
    '#efa45d',
    '#efd568',
    '#7fc67a',
    '#69afd0',
    '#7d82c7',
    '#aa78bd',
  ] as const

  useFrame(({ clock }) => {
    if (!arcoRef.current || reducedMotion) return
    const pulso = 1 + Math.sin(clock.elapsedTime * 0.65) * 0.018
    arcoRef.current.scale.setScalar(pulso)
  })

  return (
    <group
      ref={arcoRef}
      name="arco-iris-da-alianca"
      position={[0, 7.2, 43]}
      userData={{ liberadoAposContemplacao: true }}
    >
      {cores.map((cor, indice) => (
        <mesh key={cor} position={[0, 0, indice * -0.035]}>
          <torusGeometry args={[12.2 - indice * 0.52, 0.28, 10, 72, Math.PI]} />
          <meshStandardMaterial
            color={cor}
            emissive={cor}
            emissiveIntensity={0.42}
            transparent
            opacity={0.9}
            roughness={0.38}
          />
        </mesh>
      ))}
      <pointLight color="#dcefff" intensity={5} distance={25} decay={2} />
    </group>
  )
}

/** M9 Ararat/new-earth scene and interaction detector; no keyboard listener. */
export function NovaTerraNoe({
  estado,
  playerRef,
  enabled,
  reducedMotion = false,
  onCandidatoChange,
  onConcluirUnidade,
}: NovaTerraNoeProps) {
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const onConcluirUnidadeRef = useRef(onConcluirUnidade)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const conclusaoSolicitadaRef = useRef<string | null>(null)
  const visual = useMemo(() => obterEstadoVisualNovaTerraNoe(estado), [estado])
  const tarefas = useMemo(() => descreverTarefasNovaTerraNoe(estado), [estado])

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
      enabled && jogador ? resolverCandidatoNovaTerraNoe(jogador, estado) : null
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

  const tarefasAnimais = tarefas.filter(({ etapa }) => etapa === 1)
  const progressoVegetacao = visual.gruposDesembarcados.length + (visual.altarConstruido ? 1 : 0)

  return (
    <group
      name="nova-terra-noe-m9"
      userData={{
        area: 'ararate-nova-terra',
        caminhoAcessivel: true,
        arcoIrisVisivel: visual.arcoIrisVisivel,
      }}
    >
      <MontanhaArarate />
      <CaminhoAcessivelNovaTerra />
      <VegetacaoBrotando progresso={progressoVegetacao} />

      {tarefasAnimais.map((tarefa) => {
        const concluida = tarefa.estado === 'concluida'
        return (
          <group
            key={tarefa.id}
            position={[...(concluida ? tarefa.posicaoDestino : tarefa.posicao)]}
            name={`grupo-${tarefa.tipoVisual}-${concluida ? 'na-nova-terra' : 'saindo-da-arca'}`}
            userData={{ desembarcado: concluida }}
          >
            <GrupoAnimais tipo={tarefa.tipoVisual} />
          </group>
        )
      })}

      <AltarGratidao construido={visual.altarConstruido} />
      {visual.arcoIrisVisivel && (
        <ArcoIrisAlianca reducedMotion={reducedMotion} />
      )}
      {tarefas.map((tarefa) => (
        <MarcadorNovaTerra key={tarefa.id} tarefa={tarefa} />
      ))}
    </group>
  )
}
