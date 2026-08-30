import type { MomentoCriacaoId } from '../progression/types'
import { indiceMomentoCriacao } from '../progression/estado'

export interface DetalhesVisiveisCriacao {
  aguas: boolean
  fauna: boolean
  eden: boolean
  fruto: boolean
}

export function obterDetalhesVisiveisCriacao(
  momentoId: MomentoCriacaoId,
): DetalhesVisiveisCriacao {
  const indice = indiceMomentoCriacao(momentoId)
  return {
    aguas: indice >= indiceMomentoCriacao('ceu-terra-aguas'),
    fauna: indice >= indiceMomentoCriacao('criaturas'),
    eden: indice >= indiceMomentoCriacao('eden'),
    fruto: indice >= indiceMomentoCriacao('fruto-escolha'),
  }
}
