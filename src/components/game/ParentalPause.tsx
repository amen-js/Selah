import { useEffect, useRef, useState } from 'react'

import { useTranslation } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'

const HOLD_DURATION_MS = 3_000

export function ParentalPause() {
  const { t } = useTranslation()
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
        <p className="eyebrow">{t('pause.eyebrow')}</p>
        <h1 id="parental-pause-title">{t('pause.title')}</h1>
        <p>{t('pause.description')}</p>
        <p>{t('pause.instruction')}</p>
        <button
          className={`hold-button${segurando ? ' hold-button--active' : ''}`}
          type="button"
          autoFocus
          aria-label={t('pause.holdAria')}
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
          {t('pause.holdAction')}
        </button>
        <p className="muted" role="status">
          {segurando ? t('pause.statusHolding') : t('pause.statusIdle')}
        </p>
      </section>
    </div>
  )
}
