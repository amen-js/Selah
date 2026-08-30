import { useFrame } from '@react-three/fiber'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from 'react'
import { Group, MathUtils } from 'three'
import type { Ponto3D } from '../../../../mapas/types'
import type { PosicaoJogador } from '../../creation/proximidade'
import type { MomentoNoeId, ProgressoAcaoNoe } from '../progression/types'
import { GrupoAnimaisNoe } from './AnimaisFamiliaNoe'
import {
  campoAnimaisNoeVisivel,
  descreverEstadoCampoAnimaisNoe,
  interpolarCaminhoGrupoAnimaisNoe,
  resolverCandidatoCampoAnimaisNoe,
  type AcaoConducaoAnimaisNoeId,
  type CandidatoCampoAnimaisNoePuro,
  type ComportamentoConducaoNoe,
  type DescritorGrupoConducaoAnimaisNoe,
} from './animais'

export interface CandidatoCampoAnimaisNoe
  extends CandidatoCampoAnimaisNoePuro {
  acionar: () => void
}

export interface CampoAnimaisNoeProps {
  momentoAtualId: MomentoNoeId
  progressoMomentoAtual: readonly ProgressoAcaoNoe[]
  playerRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  onCandidatoChange?: (candidato: CandidatoCampoAnimaisNoe | null) => void
  onConcluirUnidade: (
    acaoId: AcaoConducaoAnimaisNoeId,
    unidadeId: string,
  ) => void
}

function MarcadorComportamento({
  posicao,
  cor,
  comportamento,
}: {
  posicao: Ponto3D
  cor: string
  comportamento: ComportamentoConducaoNoe
}) {
  return (
    <group
      name={`marcador-conducao-${comportamento}`}
      position={[...posicao]}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
        <ringGeometry args={[0.58, 0.76, 28]} />
        <meshBasicMaterial color={cor} transparent opacity={0.86} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        {comportamento === 'trilha-sementes' ? (
          <sphereGeometry args={[0.2, 10, 8]} />
        ) : comportamento === 'ponte-alinhada' ? (
          <boxGeometry args={[0.34, 0.22, 0.5]} />
        ) : (
          <cylinderGeometry args={[0.25, 0.34, 0.34, 10]} />
        )}
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={0.38}
          roughness={0.55}
        />
      </mesh>
      <pointLight color={cor} intensity={2.1} distance={2.8} decay={2} />
    </group>
  )
}

function TrilhaSementes({ concluida }: { concluida: boolean }) {
  const pontos: readonly Ponto3D[] = [
    [-14, 0.08, 14],
    [-12.1, 0.08, 12.6],
    [-10.2, 0.08, 11.2],
    [-8.2, 0.08, 9.8],
    [-6.2, 0.08, 8.3],
    [-4.3, 0.08, 6.8],
  ]
  return (
    <group name="trilha-sementes-aves">
      {pontos.map((posicao, indice) => (
        <group key={indice} position={[...posicao]}>
          {[-0.13, 0, 0.13].map((x, semente) => (
            <mesh
              key={semente}
              position={[x, 0, (semente - 1) * 0.08]}
              scale={[0.08, 0.035, 0.13]}
            >
              <sphereGeometry args={[1, 7, 5]} />
              <meshStandardMaterial
                color={concluida ? '#9d8151' : '#e2b95f'}
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function PonteAlinhavel({ alinhada }: { alinhada: boolean }) {
  const tabuasRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!tabuasRef.current) return
    tabuasRef.current.rotation.y = MathUtils.lerp(
      tabuasRef.current.rotation.y,
      alinhada ? 0 : 0.5,
      1 - Math.exp(-delta * 4),
    )
  })

  return (
    <group name="ponte-grandes-herbivoros" position={[13.2, 0, 11.5]}>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 3.6]} />
        <meshStandardMaterial color="#78b7c2" roughness={0.35} />
      </mesh>
      <group ref={tabuasRef} position={[0, 0.15, 0]}>
        {[-1.05, -0.7, -0.35, 0, 0.35, 0.7, 1.05].map((z) => (
          <mesh key={z} position={[0, 0, z]} castShadow receiveShadow>
            <boxGeometry args={[4.8, 0.16, 0.28]} />
            <meshStandardMaterial color="#9d653c" roughness={0.86} />
          </mesh>
        ))}
        {[-2.05, 2.05].map((x) => (
          <mesh key={x} position={[x, 0.12, 0]}>
            <boxGeometry args={[0.14, 0.12, 2.65]} />
            <meshStandardMaterial color="#6c472f" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function CestosPequenosMamiferos({ conduzidos }: { conduzidos: boolean }) {
  return (
    <group name="cestos-pequenos-mamiferos" position={[11.5, 0.25, 21.5]}>
      {[-0.72, 0, 0.72].map((x, indice) => (
        <group key={x} position={[x, 0, indice % 2 === 0 ? 0.15 : -0.12]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.38, 0.3, 0.44, 12]} />
            <meshStandardMaterial color="#a96f3f" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.035, 7, 14]} />
            <meshStandardMaterial color="#6e472e" roughness={0.9} />
          </mesh>
          {!conduzidos && (
            <mesh position={[0, 0.34, 0]}>
              <sphereGeometry args={[0.13, 8, 6]} />
              <meshStandardMaterial color="#ead9e4" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

function GrupoConduzido({
  descritor,
  concluido,
}: {
  descritor: DescritorGrupoConducaoAnimaisNoe
  concluido: boolean
}) {
  const grupoRef = useRef<Group>(null)
  const concluidoInicialRef = useRef(concluido)
  const progressoCaminhoRef = useRef(concluido ? 1 : 0)

  useLayoutEffect(() => {
    const posicaoInicial = concluidoInicialRef.current
      ? descritor.posicaoDestino
      : descritor.posicaoInicial
    grupoRef.current?.position.set(...posicaoInicial)
  }, [descritor])

  useFrame((state, delta) => {
    const grupo = grupoRef.current
    if (!grupo) return
    if (concluido) {
      progressoCaminhoRef.current = Math.min(
        1,
        progressoCaminhoRef.current + delta * 0.17,
      )
      const atual = interpolarCaminhoGrupoAnimaisNoe(
        descritor.caminho,
        progressoCaminhoRef.current,
      )
      const adiante = interpolarCaminhoGrupoAnimaisNoe(
        descritor.caminho,
        Math.min(1, progressoCaminhoRef.current + 0.015),
      )
      grupo.position.set(...atual)
      if (progressoCaminhoRef.current < 1) {
        grupo.rotation.y = Math.atan2(adiante[0] - atual[0], adiante[2] - atual[2])
      }
    } else {
      grupo.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.8 + descritor.ordem) * 0.035
    }
  })

  return (
    <group
      ref={grupoRef}
      name={`familia-conducao-${descritor.id}`}
      userData={{
        grupoInteiro: true,
        comportamento: descritor.comportamento,
        concluido,
      }}
    >
      <GrupoAnimaisNoe
        especies={descritor.especies}
        escala={descritor.id === 'grandes-herbivoros' ? 1.25 : 0.95}
      />
    </group>
  )
}

/**
 * M4 field: three cooperative whole-family interactions, with confirmation
 * delegated to the region arbiter through each candidate's `acionar` callback.
 */
export function CampoAnimaisNoe({
  momentoAtualId,
  progressoMomentoAtual,
  playerRef,
  enabled,
  onCandidatoChange,
  onConcluirUnidade,
}: CampoAnimaisNoeProps) {
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const onConcluirUnidadeRef = useRef(onConcluirUnidade)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const conclusaoSolicitadaRef = useRef<string | null>(null)
  const estados = useMemo(
    () =>
      descreverEstadoCampoAnimaisNoe(
        momentoAtualId,
        progressoMomentoAtual,
      ),
    [momentoAtualId, progressoMomentoAtual],
  )

  useEffect(() => {
    onCandidatoChangeRef.current = onCandidatoChange
  }, [onCandidatoChange])

  useEffect(() => {
    onConcluirUnidadeRef.current = onConcluirUnidade
  }, [onConcluirUnidade])

  useEffect(() => {
    candidatoPublicadoRef.current = null
    conclusaoSolicitadaRef.current = null
    onCandidatoChangeRef.current?.(null)
  }, [momentoAtualId, progressoMomentoAtual])

  useEffect(() => () => onCandidatoChangeRef.current?.(null), [])

  useFrame(() => {
    const jogador = playerRef.current
    const candidato =
      enabled && jogador
        ? resolverCandidatoCampoAnimaisNoe(
            jogador,
            momentoAtualId,
            progressoMomentoAtual,
          )
        : null
    const assinatura = candidato
      ? `${candidato.id}:${candidato.distancia.toFixed(2)}`
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
          candidato.acaoId,
          candidato.unidadeId,
        )
      },
    })
  })

  if (!campoAnimaisNoeVisivel(momentoAtualId)) return null

  const aves = estados.find(({ descritor }) => descritor.id === 'aves')
  const herbivoros = estados.find(
    ({ descritor }) => descritor.id === 'grandes-herbivoros',
  )
  const mamiferos = estados.find(
    ({ descritor }) => descritor.id === 'pequenos-mamiferos',
  )

  return (
    <group name="campo-animais-noe-m4">
      <group name="colinas-campo-animais">
        {[
          [-23, 1.2, 19, 7, '#78955f'],
          [27, 1.5, 22, 8, '#73905b'],
          [19, 0.8, 33, 6, '#83a066'],
        ].map(([x, y, z, escala, cor], indice) => (
          <mesh
            key={indice}
            position={[Number(x), Number(y), Number(z)]}
            scale={[Number(escala), Number(escala) * 0.34, Number(escala)]}
            receiveShadow
          >
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color={String(cor)} roughness={0.96} />
          </mesh>
        ))}
      </group>

      <TrilhaSementes concluida={aves?.concluido ?? false} />
      <PonteAlinhavel alinhada={herbivoros?.concluido ?? false} />
      <CestosPequenosMamiferos conduzidos={mamiferos?.concluido ?? false} />

      {estados.map(({ descritor, concluido, disponivel }) => (
        <group key={descritor.id} name={`comportamento-${descritor.id}`}>
          <GrupoConduzido descritor={descritor} concluido={concluido} />
          {disponivel && (
            <MarcadorComportamento
              posicao={descritor.posicaoInteracao}
              cor={descritor.cor}
              comportamento={descritor.comportamento}
            />
          )}
        </group>
      ))}
    </group>
  )
}
