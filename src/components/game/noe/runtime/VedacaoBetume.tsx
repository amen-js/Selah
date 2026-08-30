import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from '../../../../i18n'
import {
  TOTAL_SEGMENTOS_VEDACAO,
  vedacaoBetumeConcluida,
} from './vedacao'

export interface VedacaoBetumeProps {
  unidadeId: string
  onConcluir: () => void
  onCancelar: () => void
}

/**
 * Calm tactile activity: pointer/touch can paint across the crack while each
 * segment remains keyboard-focusable. Progress is local until confirmation,
 * so closing a partial attempt never mutates the journey checkpoint.
 */
export function VedacaoBetume({
  unidadeId,
  onConcluir,
  onCancelar,
}: VedacaoBetumeProps) {
  const { t } = useTranslation()
  const [pintando, setPintando] = useState(false)
  const [segmentos, setSegmentos] = useState<ReadonlySet<number>>(
    () => new Set(),
  )
  const concluida = vedacaoBetumeConcluida(segmentos)
  const percentual = Math.round((segmentos.size / TOTAL_SEGMENTOS_VEDACAO) * 100)
  const ids = useMemo(
    () => Array.from({ length: TOTAL_SEGMENTOS_VEDACAO }, (_, indice) => indice),
    [],
  )

  const preencher = (indice: number) => {
    setSegmentos((atuais) => {
      if (atuais.has(indice)) return atuais
      return new Set([...atuais, indice])
    })
  }

  useEffect(() => {
    const encerrarPincel = () => setPintando(false)
    window.addEventListener('pointerup', encerrarPincel)
    window.addEventListener('pointercancel', encerrarPincel)
    return () => {
      window.removeEventListener('pointerup', encerrarPincel)
      window.removeEventListener('pointercancel', encerrarPincel)
    }
  }, [])

  return (
    <section
      className="noe-sealing"
      role="dialog"
      aria-modal="true"
      aria-labelledby="noe-sealing-title"
      data-unidade-id={unidadeId}
    >
      <div className="noe-sealing__panel">
        <header className="noe-sealing__header">
          <span>{t('noe.sealing.eyebrow')}</span>
          <h2 id="noe-sealing-title">{t('noe.sealing.title')}</h2>
          <p>{t('noe.sealing.instructions')}</p>
        </header>

        <div className="noe-sealing__workbench">
          <div
            className="noe-sealing__crack"
            aria-label={t('noe.sealing.pathAria')}
            onPointerDown={(event) => {
              event.preventDefault()
              setPintando(true)
            }}
          >
            <span className="noe-sealing__wood-grain" aria-hidden="true" />
            {ids.map((indice) => {
              const preenchido = segmentos.has(indice)
              return (
                <button
                  key={indice}
                  type="button"
                  className={`noe-sealing__segment${
                    preenchido ? ' is-filled' : ''
                  }`}
                  aria-label={t('noe.sealing.segmentAria', {
                    current: indice + 1,
                    total: TOTAL_SEGMENTOS_VEDACAO,
                  })}
                  aria-pressed={preenchido}
                  style={{
                    '--segment-index': indice,
                    '--segment-turn': `${
                      Math.sin(indice * 1.55) * 12
                    }deg`,
                  } as CSSProperties}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    setPintando(true)
                    preencher(indice)
                  }}
                  onPointerEnter={() => {
                    if (pintando) preencher(indice)
                  }}
                  onClick={() => preencher(indice)}
                />
              )
            })}
          </div>

          <div className="noe-sealing__progress">
            <div>
              <span>{t('noe.sealing.progress')}</span>
              <strong>{percentual}%</strong>
            </div>
            <progress
              value={segmentos.size}
              max={TOTAL_SEGMENTOS_VEDACAO}
              aria-label={t('noe.sealing.progressAria', { progress: percentual })}
            />
          </div>
        </div>

        <footer className="noe-sealing__actions">
          <button type="button" className="noe-sealing__cancel" onClick={onCancelar}>
            {t('noe.sealing.cancel')}
          </button>
          <button
            type="button"
            className="noe-sealing__complete"
            disabled={!concluida}
            onClick={onConcluir}
          >
            {concluida
              ? t('noe.sealing.complete')
              : t('noe.sealing.keepPainting')}
          </button>
        </footer>
      </div>
    </section>
  )
}
