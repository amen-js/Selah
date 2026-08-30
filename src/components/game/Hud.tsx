import { useTranslation, type TranslationKey } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'
import type { Regiao } from '../../types/selah'
import { LanguageSelector } from './LanguageSelector'

const rotulosRegiao: Record<Regiao, TranslationKey> = {
  hub: 'hud.region.hub',
  criacao: 'hud.region.criacao',
  noe: 'hud.region.noe',
  jose: 'hud.region.jose',
}

export function Hud() {
  const { t } = useTranslation()
  const regiao = useGameStore((state) => state.regiao)
  const totalPassagens = useGameStore((state) => state.versiculosColetados.length)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)
  const passagens = t(
    totalPassagens === 1 ? 'hud.passages.one' : 'hud.passages.other',
    { count: totalPassagens },
  )

  return (
    <header className="hud" aria-label={t('hud.aria')}>
      <div className="hud__cluster">
        <div className="hud__brand">
          <strong>Selah</strong>
          <span className="hud__region">{t(rotulosRegiao[regiao])}</span>
        </div>
        <div className="hud__stat" aria-label={passagens}>
          <span aria-hidden="true">✦</span>
          <span>{passagens}</span>
        </div>
      </div>

      <nav
        className="hud__actions overlay-interactive"
        aria-label={t('hud.actions.aria')}
      >
        <LanguageSelector />
        <button
          className="icon-button"
          type="button"
          aria-label={t('hud.journal.open')}
          onClick={() => setPainelAberto('diario')}
        >
          <span aria-hidden="true">▤</span>
          <span className="icon-button__label">{t('hud.journal.label')}</span>
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label={t('hud.metrics.open')}
          onClick={() => setPainelAberto('metricas')}
        >
          <span aria-hidden="true">◫</span>
          <span className="icon-button__label">{t('hud.metrics.label')}</span>
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label={t('hud.settings.open')}
          onClick={() => setPainelAberto('configuracoes')}
        >
          <span aria-hidden="true">⚙</span>
          <span className="icon-button__label">{t('hud.settings.label')}</span>
        </button>
      </nav>
    </header>
  )
}
