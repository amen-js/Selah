import { useMemo } from 'react'
import { obterRevelacaoCriacao } from '../progression'
import { AmbienteVazio } from './AmbienteVazio'
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
 * Renders cumulative procedural visual assets based on the active moment's revelation.
 */
export function EfeitosCriacao({
  momentoId,
  enabled = true,
  reducedMotion = false,
}: EfeitosCriacaoProps) {
  const assetsVisiveis = useMemo(() => {
    if (!enabled) return new Set<string>()
    const revelacao = obterRevelacaoCriacao(momentoId)
    return new Set(revelacao.assetsVisiveis)
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
        <LuzGuia reducedMotion={reducedMotion} />
      )}
      {assetsVisiveis.has('nucleo-luz') && (
        <NucleoLuz reducedMotion={reducedMotion} />
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
