import { Clone, useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useEffect, useMemo } from 'react'
import { obterManifestoAssetCriacao } from '../../../../mapas/criacaoAssets'
import type { Ponto3D } from '../../../../mapas/types'
import type { EntradaManifestoAssetCriacao } from '../progression/revelacao'
import type { MomentoCriacaoId } from '../progression/types'
import {
  obterInstanciasAssetsCriacaoVisiveis,
  proximoMomentoId,
  type EscalaInstancia,
  type InstanciaAssetCriacao,
} from './elementos'
import { ModeloPersonagemCriacao } from './ModeloPersonagemCriacao'

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

function InstanciaAsset({ instancia }: { instancia: InstanciaAssetCriacao }) {
  const entrada = obterManifestoAssetCriacao(instancia.assetId)
  if (!entrada) return null

  const visual = (
    <Suspense fallback={null}>
      {instancia.animacao ? (
        <ModeloPersonagemCriacao
          arquivo={entrada.arquivo}
          animacao={instancia.animacao}
          escala={instancia.escala}
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

/** Mounts only discovered GLBs and warms the cache for the immediately next beat. */
export function Elementos3DCriacao({ momentoId }: { momentoId: MomentoCriacaoId }) {
  const visiveis = useMemo(
    () => obterInstanciasAssetsCriacaoVisiveis(momentoId),
    [momentoId],
  )

  useEffect(() => {
    const proximo = proximoMomentoId(momentoId)
    if (!proximo) return
    const arquivosAtuais = new Set(
      visiveis
        .map(({ assetId }) => obterManifestoAssetCriacao(assetId)?.arquivo)
        .filter(Boolean),
    )
    const proximosArquivos = obterInstanciasAssetsCriacaoVisiveis(proximo)
      .map(({ assetId }) => obterManifestoAssetCriacao(assetId)?.arquivo)
      .filter((arquivo): arquivo is string => Boolean(arquivo))

    for (const arquivo of new Set(proximosArquivos)) {
      if (!arquivosAtuais.has(arquivo)) useGLTF.preload(arquivo)
    }
  }, [momentoId, visiveis])

  return (
    <group name="assets-criacao">
      {visiveis.map((instancia) => (
        <InstanciaAsset key={instancia.id} instancia={instancia} />
      ))}
    </group>
  )
}
