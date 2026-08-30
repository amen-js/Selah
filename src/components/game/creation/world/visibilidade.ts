import type { Arte2DMapa, PropMapa } from '../../../../mapas/types'
import { indiceMomentoCriacao } from '../progression/estado'
import type { MomentoCriacaoId } from '../progression/types'

const momentoMinimoPorElemento = new Map<string, MomentoCriacaoId>([
  ['prop-pedra-luz', 'luz'],
  ['prop-campo-sul', 'natureza'],
  ['prop-criacao-arvore-noroeste', 'natureza'],
  ['prop-criacao-arvore-nordeste', 'natureza'],
  ['prop-criacao-arvore-oeste', 'natureza'],
  ['prop-criacao-arvore-leste', 'natureza'],
  ['prop-criacao-arvore-sudoeste', 'natureza'],
  ['prop-criacao-arvore-sudeste', 'natureza'],
  ['prop-criacao-grama-vegetacao', 'natureza'],
  ['prop-criacao-flor-vegetacao-a', 'natureza'],
  ['prop-criacao-flor-vegetacao-b', 'natureza'],
  ['prop-criacao-pedra-lago', 'ceu-terra-aguas'],
  ['arte-criacao-caminho-luz', 'luz'],
  ['arte-criacao-primeiro-brilho', 'luz'],
  ['arte-criacao-nucleo-luz', 'luz'],
  ['arte-criacao-rochas-iluminadas', 'luz'],
  ['arte-criacao-particulas-luz', 'luz'],
])

export function obterMomentoMinimoElementoCriacao(
  elementoId: string,
): MomentoCriacaoId | null {
  return momentoMinimoPorElemento.get(elementoId) ?? null
}

export function elementoCriacaoVisivel(
  elementoId: string,
  momentoAtualId: MomentoCriacaoId,
): boolean {
  const momentoMinimo = obterMomentoMinimoElementoCriacao(elementoId)
  if (!momentoMinimo) return false
  return (
    indiceMomentoCriacao(momentoAtualId) >= indiceMomentoCriacao(momentoMinimo)
  )
}

export function obterPropsCriacaoVisiveis(
  props: readonly PropMapa[],
  momentoAtualId: MomentoCriacaoId,
): readonly PropMapa[] {
  return props.filter(({ id }) => elementoCriacaoVisivel(id, momentoAtualId))
}

export function obterArtesCriacaoVisiveis(
  artes: readonly Arte2DMapa[],
  momentoAtualId: MomentoCriacaoId,
): readonly Arte2DMapa[] {
  return artes.filter(({ id }) => elementoCriacaoVisivel(id, momentoAtualId))
}
