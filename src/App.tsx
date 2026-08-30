import { useEffect, useRef, useState } from 'react'
import { GameCanvas } from './components/game/GameCanvas'
import { GameOverlay } from './components/game/GameOverlay'
import { ResponsibleOnboarding } from './components/game/ResponsibleOnboarding'
import { useTranslation } from './i18n'
import { useSelahAudio } from './hooks/useSelahAudio'
import { selectExploracaoBloqueada, useGameStore } from './stores/gameStore'
import './App.css'

function App() {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exploracaoBloqueada = useGameStore(selectExploracaoBloqueada)
  const configuracaoInicialConcluida = useGameStore(
    (state) => state.configuracaoInicialConcluida,
  )
  const interfaceBloqueada = exploracaoBloqueada || !configuracaoInicialConcluida
  const exploracaoAtiva = playing && !interfaceBloqueada

  useSelahAudio()

  useEffect(() => {
    const handlePointerLockChange = () => {
      const isPlaying = document.pointerLockElement === canvasRef.current

      setPlaying(isPlaying)
      if (isPlaying) setHasStarted(true)
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [])

  useEffect(() => {
    if (!playing) return

    const handlePauseShortcut = (event: KeyboardEvent) => {
      if (event.code !== 'KeyP') return

      event.preventDefault()
      if (document.pointerLockElement === canvasRef.current) {
        document.exitPointerLock()
      }
    }

    document.addEventListener('keydown', handlePauseShortcut)
    return () => {
      document.removeEventListener('keydown', handlePauseShortcut)
    }
  }, [playing])

  useEffect(() => {
    if (interfaceBloqueada && document.pointerLockElement === canvasRef.current) {
      document.exitPointerLock()
    }
  }, [interfaceBloqueada])

  const enterWorld = () => {
    if (!configuracaoInicialConcluida) return
    void canvasRef.current?.requestPointerLock()
  }

  return (
    <main
      className={`game-shell${exploracaoAtiva ? ' is-playing' : ''}${
        interfaceBloqueada ? ' is-overlay-active' : ''
      }`}
    >
      <GameCanvas
        playing={exploracaoAtiva}
        onCanvasReady={(canvas) => {
          canvasRef.current = canvas
        }}
      />
      <span className="camera-reticle" aria-hidden="true" />
      {configuracaoInicialConcluida && <GameOverlay />}

      {configuracaoInicialConcluida ? (
        <section
          className="start-screen"
          aria-label={hasStarted ? t('app.paused.aria') : t('app.start.aria')}
          aria-hidden={playing || exploracaoBloqueada}
        >
          <div className="start-screen__panel">
            <div className="start-screen__brand" aria-label="Selah">
              <span className="start-screen__brand-mark" aria-hidden="true">
                ✦
              </span>
              <span className="start-screen__brand-name">Selah</span>
              <span className="start-screen__brand-divider" aria-hidden="true" />
              <span className="start-screen__brand-caption">
                {t('app.brand.caption')}
              </span>
              <span className="start-screen__state">
                <span aria-hidden="true" />
                {hasStarted ? t('app.paused.state') : t('app.start.state')}
              </span>
            </div>

            <div className="start-screen__hero">
              <span className="start-screen__eyebrow">
                {hasStarted ? t('app.paused.eyebrow') : t('app.start.eyebrow')}
              </span>
              <h1>
                Selah<span aria-hidden="true">.</span>
              </h1>
              <p>
                {hasStarted
                  ? t('app.paused.description')
                  : t('app.start.description')}
              </p>
            </div>

            <section className="start-screen__journey" aria-labelledby="journey-title">
              <div className="start-screen__section-heading">
                <h2 id="journey-title">{t('app.journey.eyebrow')}</h2>
                <span>{t('app.journey.progress')}</span>
              </div>
              <div className="start-screen__journey-list">
                <article className="start-screen__journey-card is-available">
                  <span className="start-screen__journey-index" aria-hidden="true">
                    01
                  </span>
                  <div>
                    <div className="start-screen__journey-card-heading">
                      <h3>{t('app.journey.creation.title')}</h3>
                      <span className="start-screen__journey-badge">
                        {t('app.journey.current')}
                      </span>
                    </div>
                    <p>{t('app.journey.creation.description')}</p>
                  </div>
                </article>
                <article className="start-screen__journey-card is-future">
                  <span className="start-screen__journey-index" aria-hidden="true">
                    02
                  </span>
                  <div>
                    <div className="start-screen__journey-card-heading">
                      <h3>{t('app.journey.noe.title')}</h3>
                      <span className="start-screen__journey-badge">
                        {t('app.journey.future')}
                      </span>
                    </div>
                    <p>{t('app.journey.noe.description')}</p>
                  </div>
                </article>
                <article className="start-screen__journey-card is-future">
                  <span className="start-screen__journey-index" aria-hidden="true">
                    03
                  </span>
                  <div>
                    <div className="start-screen__journey-card-heading">
                      <h3>{t('app.journey.jose.title')}</h3>
                      <span className="start-screen__journey-badge">
                        {t('app.journey.future')}
                      </span>
                    </div>
                    <p>{t('app.journey.jose.description')}</p>
                  </div>
                </article>
              </div>
            </section>

            <div className="start-screen__actions">
              <button className="start-screen__primary" type="button" onClick={enterWorld}>
                <span>{hasStarted ? t('app.resume') : t('app.enter')}</span>
                <span className="start-screen__primary-icon" aria-hidden="true">
                  →
                </span>
              </button>
              <span className="start-screen__pointer-hint">
                <kbd>⏎</kbd> {t('app.start.pointerHint')}
              </span>
            </div>

            <div className="start-screen__controls" aria-label={t('app.controls.aria')}>
              <div className="start-screen__controls-heading">
                <span className="start-screen__controls-line" aria-hidden="true" />
                <span>{t('app.controls.title')}</span>
                <span className="start-screen__controls-line" aria-hidden="true" />
              </div>
              <div className="start-screen__controls-list">
                <span>
                  <kbd>WASD</kbd> {t('app.controls.move')}
                </span>
                <span>
                  <kbd>{t('app.controls.space')}</kbd> {t('app.controls.jump')}
                </span>
                <span>
                  <kbd>{t('app.controls.shift')}</kbd> {t('app.controls.run')}
                </span>
                <span>
                  <kbd>{t('app.controls.mouse')}</kbd> {t('app.controls.camera')}
                </span>
                <span>
                  <kbd>P</kbd> {t('app.controls.pause')}
                </span>
              </div>
            </div>

            <small>{t('app.controls.pauseHint')}</small>
          </div>
        </section>
      ) : (
        <ResponsibleOnboarding />
      )}
    </main>
  )
}

export default App
