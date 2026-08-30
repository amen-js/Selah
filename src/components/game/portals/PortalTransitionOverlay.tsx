import { useTranslation, type TranslationKey } from '../../../i18n'
import type { Regiao } from '../../../types/selah'

export type FasePortalTransicao = 'inativo' | 'saindo' | 'trocando' | 'entrando'

export interface PortalTransitionOverlayProps {
  fase: FasePortalTransicao
  destino?: Regiao | null
}

const mensagensPorFase: Record<Exclude<FasePortalTransicao, 'inativo'>, TranslationKey> = {
  saindo: 'portal.transition.exiting',
  trocando: 'portal.transition.switching',
  entrando: 'portal.transition.entering',
}

const rotulosRegiao: Record<Regiao, TranslationKey> = {
  hub: 'hud.region.hub',
  criacao: 'hud.region.criacao',
  noe: 'hud.region.noe',
  jose: 'hud.region.jose',
}

/** Camada visual pura; a troca de região continua sob responsabilidade do integrador. */
export function PortalTransitionOverlay({
  fase,
  destino = null,
}: PortalTransitionOverlayProps) {
  const { t } = useTranslation()

  if (fase === 'inativo') return null

  const mensagem = t(mensagensPorFase[fase], {
    region: destino ? t(rotulosRegiao[destino]) : '',
  })

  return (
    <div
      className={`portal-transition-overlay portal-transition-overlay--${fase}`}
      role="status"
      aria-live="assertive"
      aria-label={t('portal.transition.aria')}
    >
      <span className="portal-transition-overlay__mark" aria-hidden="true">
        ✦
      </span>
      <p>{mensagem}</p>
    </div>
  )
}
