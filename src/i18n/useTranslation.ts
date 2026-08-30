import { useCallback, useEffect } from 'react'

import { useGameStore } from '../stores/gameStore'
import {
  translate,
  type TranslationKey,
  type TranslationParams,
} from './translate'

export type TranslationFunction = (
  key: TranslationKey,
  params?: TranslationParams,
) => string

export function useTranslation() {
  const idioma = useGameStore((state) => state.idioma)
  const t = useCallback<TranslationFunction>(
    (key, params) => translate(idioma, key, params),
    [idioma],
  )

  return { idioma, t }
}

export function useDocumentLanguage() {
  const translation = useTranslation()
  const { idioma, t } = translation

  useEffect(() => {
    document.documentElement.lang = idioma
    document.title = t('meta.title')

    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.append(description)
    }
    description.content = t('meta.description')
  }, [idioma, t])

  return translation
}
