import { useTranslation } from '../../i18n'
import {
  selectTaxaAcertos,
  selectTaxaConclusao,
  useGameStore,
} from '../../stores/gameStore'

export function LocalDashboard() {
  const { t } = useTranslation()
  const iniciados = useGameStore((state) => state.selahsIniciados)
  const completados = useGameStore((state) => state.selahsCompletados)
  const respostas = useGameStore((state) => state.historico.length)
  const taxaConclusao = useGameStore(selectTaxaConclusao)
  const taxaAcertos = useGameStore(selectTaxaAcertos)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)
  const acertosLabel = t(
    respostas === 1 ? 'dashboard.accuracy.one' : 'dashboard.accuracy.other',
    { count: respostas },
  )

  return (
    <div className="modal-backdrop overlay-interactive">
      <section className="panel" role="dialog" aria-modal="true" aria-labelledby="metrics-title">
        <header className="panel__header">
          <div>
            <p className="eyebrow">{t('dashboard.eyebrow')}</p>
            <h2 id="metrics-title">{t('dashboard.title')}</h2>
          </div>
          <button
            autoFocus
            className="secondary-button"
            type="button"
            aria-label={t('dashboard.closeAria')}
            onClick={() => setPainelAberto(null)}
          >
            {t('common.close')}
          </button>
        </header>

        <div className="dashboard-grid">
          <article className="metric-card">
            <span className="muted">{t('dashboard.started')}</span>
            <strong>{iniciados}</strong>
          </article>
          <article className="metric-card">
            <span className="muted">{t('dashboard.completed')}</span>
            <strong>{completados}</strong>
          </article>
          <article className="metric-card">
            <span className="muted">{t('dashboard.completionRate')}</span>
            <strong data-testid="completion-rate">{taxaConclusao}%</strong>
          </article>
          <article className="metric-card">
            <span className="muted">{acertosLabel}</span>
            <strong data-testid="accuracy-rate">{taxaAcertos}%</strong>
          </article>
        </div>

        <p className="muted">{t('dashboard.note')}</p>
      </section>
    </div>
  )
}
