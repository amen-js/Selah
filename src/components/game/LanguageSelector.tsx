import { useTranslation, type TranslationKey } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'
import type { Idioma } from '../../types/selah'

const idiomas: Array<{ value: Idioma; labelKey: TranslationKey }> = [
  { value: 'pt-BR', labelKey: 'language.ptBR' },
  { value: 'en-US', labelKey: 'language.enUS' },
  { value: 'es-ES', labelKey: 'language.esES' },
]

export function LanguageSelector() {
  const { idioma, t } = useTranslation()
  const setIdioma = useGameStore((state) => state.setIdioma)
  const selectorLabel = t('language.selector.label')

  return (
    <label className="language-selector overlay-interactive">
      <span aria-hidden="true">◎</span>
      <span className="sr-only">{selectorLabel}</span>
      <select
        aria-label={selectorLabel}
        value={idioma}
        onChange={(event) => setIdioma(event.target.value as Idioma)}
      >
        {idiomas.map((item) => (
          <option key={item.value} value={item.value}>
            {t(item.labelKey)}
          </option>
        ))}
      </select>
    </label>
  )
}
