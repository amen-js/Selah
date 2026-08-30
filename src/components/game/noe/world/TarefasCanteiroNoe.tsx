import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  obterTarefasDisponiveisCanteiroNoe,
  resolverCandidatoTarefaCanteiroNoe,
} from './canteiro'
import type { CanteiroNoeProps, CandidatoTarefaNoe } from './types'

function MarcadorTarefa({ candidato }: { candidato: CandidatoTarefaNoe }) {
  const cor = candidato.acaoId === 'noe.betume.aplicado' ? '#69d1b5' : '#ffd166'

  return (
    <group position={[...candidato.posicao]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
        <ringGeometry args={[0.48, 0.62, 24]} />
        <meshBasicMaterial color={cor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={0.65}
          roughness={0.45}
        />
      </mesh>
      <pointLight
        position={[0, 0.35, 0]}
        color={cor}
        intensity={2.5}
        distance={2.5}
        decay={2}
      />
    </group>
  )
}

/** Spatial detector only: confirmation is owned by the parent arbiter. */
export function TarefasCanteiroNoe({
  momentoAtualId,
  progressoMomentoAtual,
  posicaoJogadorRef,
  enabled,
  onCandidatoChange,
}: CanteiroNoeProps) {
  const onCandidatoChangeRef = useRef(onCandidatoChange)
  const candidatoPublicadoRef = useRef<string | null>(null)
  const tarefasDisponiveis = useMemo(
    () =>
      obterTarefasDisponiveisCanteiroNoe(momentoAtualId, progressoMomentoAtual),
    [momentoAtualId, progressoMomentoAtual],
  )

  useEffect(() => {
    onCandidatoChangeRef.current = onCandidatoChange
  }, [onCandidatoChange])

  useEffect(() => {
    candidatoPublicadoRef.current = null
    onCandidatoChangeRef.current?.(null)
  }, [momentoAtualId, progressoMomentoAtual])

  useEffect(() => () => onCandidatoChangeRef.current?.(null), [])

  useFrame(() => {
    const posicao = posicaoJogadorRef.current
    const candidato =
      enabled && posicao
        ? resolverCandidatoTarefaCanteiroNoe(
            posicao,
            momentoAtualId,
            progressoMomentoAtual,
          )
        : null
    const assinatura = candidato ? `${candidato.id}:${candidato.estado}` : null
    if (assinatura === candidatoPublicadoRef.current) return

    candidatoPublicadoRef.current = assinatura
    onCandidatoChangeRef.current?.(candidato)
  })

  return (
    <group name="tarefas-canteiro-noe">
      {tarefasDisponiveis.map((candidato) => (
        <MarcadorTarefa key={candidato.id} candidato={candidato} />
      ))}
    </group>
  )
}
