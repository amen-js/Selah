import type { Idioma } from '../types/selah'
import { enUS } from './messages/en-US'
import { esES } from './messages/es-ES'
import { ptBR, type TranslationKey } from './messages/pt-BR'

export type { TranslationKey }

export type TranslationParams = Record<string, string | number>

export const catalogs: Record<
  Idioma,
  Readonly<Record<TranslationKey, string>>
> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
}

const placeholderPattern = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g

export function translate(
  idioma: Idioma,
  key: TranslationKey,
  params: TranslationParams = {},
): string {
  const catalog = catalogs[idioma] ?? catalogs['pt-BR']
  const message = catalog[key] ?? catalogs['pt-BR'][key]

  return message.replace(placeholderPattern, (placeholder, name: string) => {
    const value = params[name]
    return value === undefined ? placeholder : String(value)
  })
}
