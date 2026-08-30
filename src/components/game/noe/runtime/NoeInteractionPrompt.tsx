import { useTranslation } from '../../../../i18n'

export type TipoInteracaoNoe = 'tarefa' | 'selah'

export interface NoeInteractionPromptProps {
  tipo: TipoInteracaoNoe | null
}

/** Accessible DOM feedback for Noah's externally arbitrated interactions. */
export function NoeInteractionPrompt({ tipo }: NoeInteractionPromptProps) {
  const { t } = useTranslation()

  if (!tipo) return null

  const alvo = t(
    tipo === 'tarefa' ? 'noe.interaction.task' : 'noe.interaction.selah',
  )

  return (
    <aside
      className="portal-prompt noe-interaction-prompt"
      role="status"
      aria-live="polite"
      aria-label={t('noe.interaction.aria', { target: alvo })}
    >
      <span className="portal-prompt__eyebrow">
        {t('noe.interaction.eyebrow')}
      </span>
      <strong className="portal-prompt__region">{alvo}</strong>
      <span className="portal-prompt__hint">
        {t('noe.interaction.enter')}
      </span>
    </aside>
  )
}
