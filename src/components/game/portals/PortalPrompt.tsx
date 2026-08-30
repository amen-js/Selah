import { useTranslation, type TranslationKey } from '../../../i18n'
import { portalDisponivel } from './proximidade'
import type { PortalMapa } from './types'
import type { Regiao } from '../../../types/selah'

const rotulosRegiao: Record<Regiao, TranslationKey> = {
  hub: 'hud.region.hub',
  criacao: 'hud.region.criacao',
  noe: 'hud.region.noe',
  jose: 'hud.region.jose',
}

export interface PortalPromptProps {
  portal: PortalMapa | null
}

/** Feedback DOM acessível para o portal detectado mais próximo. */
export function PortalPrompt({ portal }: PortalPromptProps) {
  const { t } = useTranslation()

  if (!portal) return null

  const regiao = t(rotulosRegiao[portal.destino])
  const disponivel = portalDisponivel(portal)

  return (
    <aside
      className={`portal-prompt${disponivel ? '' : ' portal-prompt--unavailable'}`}
      role="status"
      aria-live="polite"
      aria-label={t('portal.prompt.aria', { region: regiao })}
      data-portal-id={portal.id}
    >
      <span className="portal-prompt__eyebrow">{t('portal.prompt.eyebrow')}</span>
      <strong className="portal-prompt__region">{regiao}</strong>
      {disponivel ? (
        <span className="portal-prompt__hint">{t('portal.prompt.enter')}</span>
      ) : (
        <span className="portal-prompt__hint">{t('portal.prompt.soon')}</span>
      )}
    </aside>
  )
}
