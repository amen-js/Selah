import { Clone, useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useMemo } from 'react'
import { obterManifestoAssetCriacao } from '../../../../mapas/criacaoAssets'
import type { Ponto3D } from '../../../../mapas/types'
import type { EntradaManifestoAssetCriacao } from '../progression/revelacao'
import type { MomentoCriacaoId } from '../progression/types'
import {
  obterInstanciasAssetsCriacaoVisiveis,
  type EscalaInstancia,
  type InstanciaAssetCriacao,
} from './elementos'
import { ModeloPersonagemCriacao } from './ModeloPersonagemCriacao'
import { DetalhesNarrativosCriacao } from './DetalhesNarrativosCriacao'

function escalaVetor(escala: EscalaInstancia): Ponto3D {
  return typeof escala === 'number'
    ? [escala, escala, escala]
    : escala
}

function ModeloAssetCriacao({
  entrada,
  escala,
}: {
  entrada: EntradaManifestoAssetCriacao
  escala: EscalaInstancia
}) {
  const { scene } = useGLTF(entrada.arquivo)
  return (
    <group scale={escalaVetor(escala)}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  )
}

function InstanciaAsset({
  instancia,
  reducedMotion,
}: {
  instancia: InstanciaAssetCriacao
  reducedMotion: boolean
}) {
  const entrada = obterManifestoAssetCriacao(instancia.assetId)
  if (!entrada) return null

  const visual = (
    <Suspense fallback={null}>
      {instancia.animacao ? (
        <ModeloPersonagemCriacao
          arquivo={entrada.arquivo}
          animacao={instancia.animacao}
          escala={instancia.escala}
          reducedMotion={reducedMotion}
        />
      ) : (
        <ModeloAssetCriacao entrada={entrada} escala={instancia.escala} />
      )}
    </Suspense>
  )
  const rotacao: Ponto3D = [0, instancia.rotacao ?? 0, 0]

  if (!instancia.colisor) {
    return (
      <group position={[...instancia.posicao]} rotation={[...rotacao]}>
        {visual}
      </group>
    )
  }

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[...instancia.posicao]}
      rotation={[...rotacao]}
    >
      <CuboidCollider
        args={[...instancia.colisor.meiaExtensao]}
        position={
          instancia.colisor.deslocamento
            ? [...instancia.colisor.deslocamento]
            : undefined
        }
      />
      {visual}
    </RigidBody>
  )
}

/** Mounts discovered GLBs on demand without blocking play with speculative loads. */
export function Elementos3DCriacao({
  momentoId,
  reducedMotion = false,
}: {
  momentoId: MomentoCriacaoId
  reducedMotion?: boolean
}) {
  const visiveis = useMemo(
    () => obterInstanciasAssetsCriacaoVisiveis(momentoId),
    [momentoId],
  )

  return (
    <group name="assets-criacao">
      {visiveis.map((instancia) => (
        <InstanciaAsset
          key={instancia.id}
          instancia={instancia}
          reducedMotion={reducedMotion}
        />
      ))}
      <DetalhesNarrativosCriacao
        momentoId={momentoId}
        reducedMotion={reducedMotion}
      />
    </group>
  )
}
