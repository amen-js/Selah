import { useTranslation, type TranslationKey } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'
import type { Regiao } from '../../types/selah'
import { momentosCriacao } from './creation/progression/catalogo'
import type { SnapshotProgressaoCriacao } from './creation/progression/types'
import { traduzirJornadaCriacao } from './creationJourneyUi'
import { LanguageSelector } from './LanguageSelector'

const rotulosRegiao: Record<Regiao, TranslationKey> = {
  hub: 'hud.region.hub',
  criacao: 'hud.region.criacao',
  noe: 'hud.region.noe',
  jose: 'hud.region.jose',
}

interface HudProps {
  snapshot?: SnapshotProgressaoCriacao
}

export function Hud({ snapshot }: HudProps) {
  const { idioma, t } = useTranslation()
  const regiao = useGameStore((state) => state.regiao)
  const totalPassagens = useGameStore((state) => state.versiculosColetados.length)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)
  const passagens = t(
    totalPassagens === 1 ? 'hud.passages.one' : 'hud.passages.other',
    { count: totalPassagens },
  )
  const totalMomentos = momentosCriacao.length
  const textoJornada = snapshot
    ? traduzirJornadaCriacao(snapshot.momento.id, idioma)
    : null
  const momentosConcluidos = snapshot
    ? snapshot.estado.concluida
      ? totalMomentos
      : snapshot.estado.momentosConcluidos.length
    : 0

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

      {snapshot && textoJornada && (
        <div className="hud__journey">
          <div className="hud__journey-copy">
            <span className="hud__journey-position">
              {t('hud.creation.moment', {
                current: snapshot.momento.ordem,
                total: totalMomentos,
              })}
            </span>
            <strong>{textoJornada.titulo}</strong>
          </div>
          <progress
            max={totalMomentos}
            value={momentosConcluidos}
            aria-label={t('hud.creation.progressAria', {
              completed: momentosConcluidos,
              total: totalMomentos,
            })}
          />
        </div>
      )}

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
