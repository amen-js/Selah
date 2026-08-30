import { useEffect, useRef, useState } from 'react'
import { GameCanvas } from './components/game/GameCanvas'
import './App.css'

function App() {
  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  const enterWorld = () => {
    void canvasRef.current?.requestPointerLock()
  }

  return (
    <main className={`game-shell${playing ? ' is-playing' : ''}`}>
      <GameCanvas
        playing={playing}
        onCanvasReady={(canvas) => {
          canvasRef.current = canvas
        }}
      />
      <span className="camera-reticle" aria-hidden="true" />

      <section
        className="start-screen"
        aria-label={hasStarted ? 'Jogo pausado' : 'Iniciar jogo'}
        aria-hidden={playing}
      >
        <div className="start-screen__panel">
          <span className="start-screen__eyebrow">
            {hasStarted ? 'Exploração pausada' : 'Uma jornada de reflexão'}
          </span>
          <h1>{hasStarted ? 'Selah.' : 'Selah'}</h1>
          <p>
            {hasStarted
              ? 'Respire. Quando estiver pronto, retorne ao jardim.'
              : 'Pare em meio ao barulho. Entre na jornada.'}
          </p>

          <button type="button" onClick={enterWorld}>
            {hasStarted ? 'Continuar jornada' : 'Entrar no mundo'}
          </button>

          <div className="start-screen__controls" aria-label="Controles">
            <span>
              <kbd>WASD</kbd> Mover
            </span>
            <span>
              <kbd>Espaço</kbd> Pular
            </span>
            <span>
              <kbd>Shift</kbd> Correr
            </span>
            <span>
              <kbd>Mouse</kbd> Câmera
            </span>
            <span>
              <kbd>P</kbd> Pausar
            </span>
          </div>

          <small>Use P para pausar sem sair da tela cheia.</small>
        </div>
      </section>
    </main>
  )
}

export default App
