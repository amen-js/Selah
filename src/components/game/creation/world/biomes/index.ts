export * from './bosqueDaVida'
export * from './campo'
export * from './eden'
export * from './posicao'
export * from './types'
export * from './valeDasAguas'

import { composicaoBosqueDaVida } from './bosqueDaVida'
import { composicaoCampoCriacao } from './campo'
import { composicaoEden } from './eden'
import type { ComposicaoBiomaCriacao, InstanciaBiomaCriacao } from './types'
import { composicaoValeDasAguas } from './valeDasAguas'

/** Stable biome order follows the player journey from open field to Eden. */
export const composicoesBiomasCriacao: readonly ComposicaoBiomaCriacao[] = [
  composicaoCampoCriacao,
  composicaoValeDasAguas,
  composicaoBosqueDaVida,
  composicaoEden,
]

/** Flat renderer-ready view, intentionally free of visibility/progression logic. */
export function obterInstanciasBiomasCriacao(): readonly InstanciaBiomaCriacao[] {
  return composicoesBiomasCriacao.flatMap(({ instancias }) => instancias)
}
