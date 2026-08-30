import { useTranslation } from '../../i18n'

interface SceneLoadingOverlayProps {
  state: 'loading' | 'error'
  progress: number
  onRetry?: () => void
}

const normalizarProgresso = (progress: number): number => {
  if (!Number.isFinite(progress)) return 0
  return Math.round(Math.min(100, Math.max(0, progress)))
}

export function SceneLoadingOverlay({
  state,
  progress,
  onRetry,
}: SceneLoadingOverlayProps) {
  const { t } = useTranslation()
  const progresso = normalizarProgresso(progress)
  const comErro = state === 'error'

  return (
    <section
      className={`scene-loading${comErro ? ' scene-loading--error' : ''}`}
      role={comErro ? 'alert' : 'status'}
      aria-live={comErro ? 'assertive' : 'polite'}
      aria-label={t(comErro ? 'scene.error.aria' : 'scene.loading.aria')}
    >
      <div className="scene-loading__atmosphere" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="scene-loading__content">
        <div className="scene-loading__brand" aria-label="Selah">
          <span className="scene-loading__brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>Selah</span>
        </div>

        <div className="scene-loading__orb" aria-hidden="true">
          <span className="scene-loading__orbit scene-loading__orbit--outer" />
          <span className="scene-loading__orbit scene-loading__orbit--inner" />
          <span className="scene-loading__orb-core">✦</span>
          <span className="scene-loading__spark scene-loading__spark--one" />
          <span className="scene-loading__spark scene-loading__spark--two" />
          <span className="scene-loading__spark scene-loading__spark--three" />
        </div>

        <div className="scene-loading__copy">
          <p className="scene-loading__eyebrow">
            {t(comErro ? 'scene.error.eyebrow' : 'scene.loading.eyebrow')}
          </p>
          <h1>{t(comErro ? 'scene.error.title' : 'scene.loading.title')}</h1>
          <p className="scene-loading__description">
            {t(comErro ? 'scene.error.description' : 'scene.loading.description')}
          </p>
        </div>

        {comErro ? (
          <button className="scene-loading__retry" type="button" onClick={onRetry}>
            <span>{t('scene.error.retry')}</span>
            <span aria-hidden="true">↻</span>
          </button>
        ) : (
          <div className="scene-loading__progress-block">
            <div
              className="scene-loading__progress"
              role="progressbar"
              aria-label={t('scene.loading.progressLabel')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progresso}
              aria-valuetext={t('scene.loading.progressAria', { progress: progresso })}
            >
              <span style={{ transform: `scaleX(${progresso / 100})` }} />
            </div>
            <div className="scene-loading__progress-meta">
              <span>{t('scene.loading.status')}</span>
              <strong>{t('scene.loading.progress', { progress: progresso })}</strong>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

