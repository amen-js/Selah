import { useTranslation } from '../../../../i18n'

export type TipoInteracaoCriacao = 'selah' | 'ponto-criacao'

export interface CreationInteractionPromptProps {
  tipo: TipoInteracaoCriacao | null
  touch?: boolean
}

/** Accessible DOM feedback for deliberate Creation interactions. */
export function CreationInteractionPrompt({
  tipo,
  touch = false,
}: CreationInteractionPromptProps) {
  const { t } = useTranslation()

  if (!tipo) return null

  const alvo = t(
    tipo === 'selah'
      ? 'creation.interaction.selah'
      : 'creation.interaction.point',
  )

  return (
    <aside
      className="portal-prompt creation-interaction-prompt"
      role="status"
      aria-live="polite"
      aria-label={t('creation.interaction.aria', { target: alvo })}
    >
      <span className="portal-prompt__eyebrow">
        {t('creation.interaction.eyebrow')}
      </span>
      <strong className="portal-prompt__region">{alvo}</strong>
      <span className="portal-prompt__hint">
        {t(
          touch
            ? 'creation.interaction.touch'
            : 'creation.interaction.enter',
        )}
      </span>
    </aside>
  )
}
