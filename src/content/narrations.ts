import {
  buscarNarracaoCriacao,
  type NarracaoCriacaoId,
} from './creationNarrations.ts'
import type { Idioma } from '../types/selah.ts'

export const narracoesMissaoNoeIds = [
  'noe.mission.line1',
  'noe.mission.line2',
  'noe.mission.line3',
] as const

export type NarracaoMissaoNoeId = (typeof narracoesMissaoNoeIds)[number]
export type NarracaoAprovadaId = NarracaoCriacaoId | NarracaoMissaoNoeId

export interface NarracaoAprovada {
  narracaoId: NarracaoAprovadaId
  idioma: Idioma
  texto: string
}

const idiomasSuportados = new Set<Idioma>(['pt-BR', 'en-US', 'es-ES'])
const narracoesMissaoNoe = new Set<string>(narracoesMissaoNoeIds)
const textosMissaoNoe = {
  'noe.mission.line1': {
    'pt-BR':
      'Deus nos confiou uma grande missão: preparar um abrigo seguro para a vida.',
    'en-US':
      'God entrusted us with a great mission: prepare a safe shelter for life.',
    'es-ES':
      'Dios nos confió una gran misión: preparar un refugio seguro para la vida.',
  },
  'noe.mission.line2': {
    'pt-BR':
      'Estamos construindo juntos. Cada tábua e cada cuidado fazem parte desse trabalho.',
    'en-US':
      'We are building it together. Every plank and every act of care belongs to this work.',
    'es-ES':
      'Estamos construyendo juntos. Cada tabla y cada cuidado forman parte de este trabajo.',
  },
  'noe.mission.line3': {
    'pt-BR':
      'Conheça o canteiro com calma. Depois, você poderá nos ajudar a terminar a Arca.',
    'en-US':
      'Explore the worksite calmly. Then you can help us finish the Ark.',
    'es-ES':
      'Conoce el astillero con calma. Después podrás ayudarnos a terminar el Arca.',
  },
} as const satisfies Record<
  NarracaoMissaoNoeId,
  Record<Idioma, string>
>

const ehIdioma = (valor: string): valor is Idioma =>
  idiomasSuportados.has(valor as Idioma)

const ehNarracaoMissaoNoe = (valor: string): valor is NarracaoMissaoNoeId =>
  narracoesMissaoNoe.has(valor)

export function buscarNarracaoAprovada(
  narracaoId: string,
  idioma: string,
): NarracaoAprovada | undefined {
  const narracaoCriacao = buscarNarracaoCriacao(narracaoId, idioma)
  if (narracaoCriacao) {
    return {
      narracaoId: narracaoCriacao.narracaoId,
      idioma: narracaoCriacao.idioma,
      texto: narracaoCriacao.texto,
    }
  }

  if (!ehNarracaoMissaoNoe(narracaoId) || !ehIdioma(idioma)) return undefined

  return {
    narracaoId,
    idioma,
    texto: textosMissaoNoe[narracaoId][idioma],
  }
}
