import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group } from 'three'
import { useGameStore } from '../../../stores/gameStore'
import type { ColetavelMapa } from '../../../mapas/types'
import { podeAcionarColetavel } from './podeAcionarColetavel'
import { estaNoRaio, type PosicaoJogador } from './proximidade'

export const RAIO_ATIVACAO_PADRAO = 2.5

type ColetavelCriacaoProps = {
  coletavel: ColetavelMapa
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  indice: number
}

function ColetavelCriacao({
  coletavel,
  posicaoJogadorRef,
  enabled,
  indice,
}: ColetavelCriacaoProps) {
  const grupoRef = useRef<Group>(null)
  const acionadoRef = useRef(false)
  const tempoAnimadoRef = useRef(0)
  const cor = coletavel.cor ?? '#fff0a8'
  const raio = coletavel.raioAtivacao ?? RAIO_ATIVACAO_PADRAO
  const posicao: [number, number, number] = [
    coletavel.posicao[0],
    coletavel.posicao[1],
    coletavel.posicao[2],
  ]

  useFrame((_, delta) => {
    const grupo = grupoRef.current
    if (grupo && enabled) {
      tempoAnimadoRef.current += delta
      grupo.rotation.y += delta * 1.8
      grupo.position.y =
        posicao[1] + Math.sin(tempoAnimadoRef.current * 2 + indice * 0.9) * 0.16
    }

    if (!enabled || acionadoRef.current) return

    const estado = useGameStore.getState()
    if (
      !podeAcionarColetavel({
        enabled,
        jaAcionado: acionadoRef.current,
        selahAtivo: estado.selahAtivo !== null,
        pausaParentalAtiva: estado.pausaParentalAtiva,
        passagemColetada: estado.versiculosColetados.includes(coletavel.passagemId),
      })
    ) return

    const posicaoJogador = posicaoJogadorRef.current
    if (!posicaoJogador || !estaNoRaio(posicaoJogador, coletavel.posicao, raio)) return

    acionadoRef.current = true
    estado.abrirSelah({
      historiaId: coletavel.historiaId,
      passagemId: coletavel.passagemId,
    })
  })

  return (
    <group ref={grupoRef} position={posicao}>
      <pointLight color={cor} intensity={1.6} distance={4} />
      <mesh castShadow>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={2.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.025, 8, 32]} />
        <meshBasicMaterial color={cor} transparent opacity={0.72} />
      </mesh>
    </group>
  )
}

export type ColetaveisCriacaoProps = {
  coletaveis: readonly ColetavelMapa[]
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
}

/** Colecionáveis da região da criação e seus gatilhos de proximidade. */
export function ColetaveisCriacao({
  coletaveis,
  posicaoJogadorRef,
  enabled,
}: ColetaveisCriacaoProps) {
  return (
    <>
      {coletaveis.map((coletavel, indice) => (
        <ColetavelCriacao
          key={coletavel.id}
          coletavel={coletavel}
          posicaoJogadorRef={posicaoJogadorRef}
          enabled={enabled}
          indice={indice}
        />
      ))}
    </>
  )
}
