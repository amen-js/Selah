import { translate, type TranslationKey } from '../../i18n'
import type { Idioma } from '../../types/selah'
import type { MomentoCriacaoId } from './creation/progression'

interface ChavesJornadaCriacao {
  titulo: TranslationKey
  objetivo: TranslationKey
}

export const chavesJornadaCriacao = {
  vazio: {
    titulo: 'creation.journey.vazio.title',
    objetivo: 'creation.journey.vazio.objective',
  },
  luz: {
    titulo: 'creation.journey.luz.title',
    objetivo: 'creation.journey.luz.objective',
  },
  'ceu-terra-aguas': {
    titulo: 'creation.journey.ceu-terra-aguas.title',
    objetivo: 'creation.journey.ceu-terra-aguas.objective',
  },
  natureza: {
    titulo: 'creation.journey.natureza.title',
    objetivo: 'creation.journey.natureza.objective',
  },
  'ceu-ritmo': {
    titulo: 'creation.journey.ceu-ritmo.title',
    objetivo: 'creation.journey.ceu-ritmo.objective',
  },
  criaturas: {
    titulo: 'creation.journey.criaturas.title',
    objetivo: 'creation.journey.criaturas.objective',
  },
  eden: {
    titulo: 'creation.journey.eden.title',
    objetivo: 'creation.journey.eden.objective',
  },
  'adao-e-eva': {
    titulo: 'creation.journey.adao-e-eva.title',
    objetivo: 'creation.journey.adao-e-eva.objective',
  },
  'fruto-escolha': {
    titulo: 'creation.journey.fruto-escolha.title',
    objetivo: 'creation.journey.fruto-escolha.objective',
  },
} as const satisfies Record<MomentoCriacaoId, ChavesJornadaCriacao>

export function traduzirJornadaCriacao(
  momentoId: MomentoCriacaoId,
  idioma: Idioma,
) {
  const chaves = chavesJornadaCriacao[momentoId]

  return {
    titulo: translate(idioma, chaves.titulo),
    objetivo: translate(idioma, chaves.objetivo),
  }
}
