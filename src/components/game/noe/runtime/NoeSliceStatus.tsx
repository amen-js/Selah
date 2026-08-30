import { useTranslation } from '../../../../i18n'

export interface NoeSliceStatusProps {
  visible: boolean
}

/** Explicit handoff after the implemented M1/M2 worksite chapter. */
export function NoeSliceStatus({ visible }: NoeSliceStatusProps) {
  const { t } = useTranslation()

  if (!visible) return null

  return (
    <aside
      className="portal-prompt noe-slice-status"
      role="status"
      aria-live="polite"
      aria-label={t('noe.slice.aria')}
    >
      <span className="portal-prompt__eyebrow">{t('noe.slice.eyebrow')}</span>
      <strong className="portal-prompt__region">{t('noe.slice.title')}</strong>
      <span className="portal-prompt__hint">{t('noe.slice.hint')}</span>
    </aside>
  )
}
