import { useEffect, useRef, useState } from 'react'
import { GameCanvas } from './components/game/GameCanvas'
import { GameOverlay } from './components/game/GameOverlay'
import { useTranslation } from './i18n'
import { selectExploracaoBloqueada, useGameStore } from './stores/gameStore'
import './App.css'

function App() {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exploracaoBloqueada = useGameStore(selectExploracaoBloqueada)
  const exploracaoAtiva = playing && !exploracaoBloqueada

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
    if (exploracaoBloqueada && document.pointerLockElement === canvasRef.current) {
      document.exitPointerLock()
    }
  }, [exploracaoBloqueada])

  const enterWorld = () => {
    void canvasRef.current?.requestPointerLock()
  }

  return (
    <main
      className={`game-shell${exploracaoAtiva ? ' is-playing' : ''}${
        exploracaoBloqueada ? ' is-overlay-active' : ''
      }`}
    >
      <GameCanvas
        playing={exploracaoAtiva}
        onCanvasReady={(canvas) => {
          canvasRef.current = canvas
        }}
      />
      <span className="camera-reticle" aria-hidden="true" />
      <GameOverlay />

      <section
        className="start-screen"
        aria-label={hasStarted ? t('app.paused.aria') : t('app.start.aria')}
        aria-hidden={playing || exploracaoBloqueada}
      >
        <div className="start-screen__panel">
          <span className="start-screen__eyebrow">
            {hasStarted ? t('app.paused.eyebrow') : t('app.start.eyebrow')}
          </span>
          <h1>{hasStarted ? 'Selah.' : 'Selah'}</h1>
          <p>
            {hasStarted
              ? t('app.paused.description')
              : t('app.start.description')}
          </p>

          <button type="button" onClick={enterWorld}>
            {hasStarted ? t('app.resume') : t('app.enter')}
          </button>

          <div
            className="start-screen__controls"
            aria-label={t('app.controls.aria')}
          >
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

          <small>{t('app.controls.pauseHint')}</small>
        </div>
      </section>
    </main>
  )
}

export default App
