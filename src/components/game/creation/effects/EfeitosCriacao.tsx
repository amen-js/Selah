import { useMemo } from 'react'
import { AmbienteVazio } from './AmbienteVazio'
import { obterConfiguracaoEfeitosCriacao } from './configuracao'
import { EfeitoCrescimento } from './EfeitoCrescimento'
import { Estrelas } from './Estrelas'
import { Lua } from './Lua'
import { LuzGuia } from './LuzGuia'
import { MarcadoresCaminhoLuz } from './MarcadoresCaminhoLuz'
import { NucleoLuz } from './NucleoLuz'
import { Nuvens } from './Nuvens'
import { Sol } from './Sol'
import type { EfeitosCriacaoProps } from './types'

/**
 * Root procedural VFX component for the nine Creation moments in Selah.
 * Narrative cues are beat-local; only the celestial set persists after its
 * establishing beat (`ceu-ritmo`). Physical scene chunks keep their own
 * cumulative policy in the world layer.
 */
export function EfeitosCriacao({
  momentoId,
  enabled = true,
  reducedMotion = false,
}: EfeitosCriacaoProps) {
  const assetsVisiveis = useMemo(() => {
    if (!enabled) return new Set<string>()
    return new Set(obterConfiguracaoEfeitosCriacao(momentoId).efeitosAtivos)
  }, [momentoId, enabled])

  if (!enabled || assetsVisiveis.size === 0) {
    return null
  }

  return (
    <group name="efeitos-criacao-procedurais">
      {assetsVisiveis.has('ambiente-vazio') && (
        <AmbienteVazio reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('luz-guia') && (
        <LuzGuia posicao={[0, 1.2, 15]} reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('nucleo-luz') && (
        <NucleoLuz posicao={[10, 1.35, 13]} reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('marcadores-caminho-luz') && (
        <MarcadoresCaminhoLuz reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('efeito-crescimento') && (
        <EfeitoCrescimento reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('sol') && (
        <Sol reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('lua') && (
        <Lua reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('estrelas') && (
        <Estrelas reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('nuvens') && (
        <Nuvens reducedMotion={reducedMotion} />
      )}
    </group>
  )
}
