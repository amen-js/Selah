import { useEffect, useRef, useState } from 'react'

import { useGameStore } from '../../stores/gameStore'

const HOLD_DURATION_MS = 3_000

export function ParentalPause() {
  const [segurando, setSegurando] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pausaParentalAtiva = useGameStore((state) => state.pausaParentalAtiva)
  const liberarPausaParental = useGameStore((state) => state.liberarPausaParental)

  const cancelarPressao = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setSegurando(false)
  }

  const iniciarPressao = () => {
    if (timerRef.current) return

    setSegurando(true)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setSegurando(false)
      liberarPausaParental()
    }, HOLD_DURATION_MS)
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  if (!pausaParentalAtiva) return null

  return (
    <div className="parent-pause overlay-interactive">
      <section
        className="parent-pause__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="parental-pause-title"
      >
        <p className="eyebrow">Pausa Selah</p>
        <h1 id="parental-pause-title">Agora a pausa acontece fora da tela</h1>
        <p>
          Respirem, conversem sobre a passagem ou observem algo ao redor. Não há recompensa por
          manter esta tela aberta, e o navegador sempre pode ser fechado.
        </p>
        <p>Quando for o momento de voltar, peça para um responsável segurar o botão abaixo.</p>
        <button
          className={`hold-button${segurando ? ' hold-button--active' : ''}`}
          type="button"
          autoFocus
          aria-label="Segure para liberar a exploração"
          onPointerDown={(event) => {
            event.preventDefault()
            iniciarPressao()
          }}
          onPointerUp={cancelarPressao}
          onPointerLeave={cancelarPressao}
          onPointerCancel={cancelarPressao}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
              event.preventDefault()
              iniciarPressao()
            }
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter' || event.key === ' ') cancelarPressao()
          }}
        >
          Segure para continuar
        </button>
        <p className="muted" role="status">
          {segurando ? 'Continue segurando…' : 'A liberação acontece somente neste dispositivo.'}
        </p>
      </section>
    </div>
  )
}
