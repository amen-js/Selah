import { useMemo, useState } from 'react'
import { useTranslation, type TranslationFunction } from '../../../../i18n'

interface FalaMissaoNoe {
  personagem: string
  mensagem: string
}

function criarFalasMissaoNoe(t: TranslationFunction): readonly FalaMissaoNoe[] {
  return [
    {
      personagem: t('noe.mission.noah'),
      mensagem: t('noe.mission.line1'),
    },
    {
      personagem: t('noe.mission.sons'),
      mensagem: t('noe.mission.line2'),
    },
    {
      personagem: t('noe.mission.noah'),
      mensagem: t('noe.mission.line3'),
    },
  ]
}

export interface DialogoMissaoNoeProps {
  onConcluir: () => void
  onCancelar: () => void
}

/** Narrative briefing for M1, intentionally separate from the AI disclosure. */
export function DialogoMissaoNoe({
  onConcluir,
  onCancelar,
}: DialogoMissaoNoeProps) {
  const { t } = useTranslation()
  const falas = useMemo(() => criarFalasMissaoNoe(t), [t])
  const [indice, setIndice] = useState(0)
  const fala = falas[indice]
  const ultima = indice === falas.length - 1

  return (
    <section
      className="noe-mission-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="noe-mission-speaker"
      aria-describedby="noe-mission-message"
    >
      <div className="noe-mission-dialog__panel">
        <div className="noe-mission-dialog__portrait" aria-hidden="true">
          <span className="noe-mission-dialog__head" />
          <span className="noe-mission-dialog__beard" />
          <span className="noe-mission-dialog__robe" />
        </div>
        <div className="noe-mission-dialog__content">
          <span className="noe-mission-dialog__eyebrow">
            {t('noe.mission.eyebrow')}
          </span>
          <h2 id="noe-mission-speaker">{fala.personagem}</h2>
          <p id="noe-mission-message">{fala.mensagem}</p>
          <div className="noe-mission-dialog__steps" aria-hidden="true">
            {falas.map((_, passo) => (
              <span key={passo} className={passo <= indice ? 'is-active' : ''} />
            ))}
          </div>
          <div className="noe-mission-dialog__actions">
            <button type="button" onClick={onCancelar}>
              {t('noe.mission.later')}
            </button>
            <button
              type="button"
              className="is-primary"
              onClick={() => {
                if (ultima) {
                  onConcluir()
                  return
                }
                setIndice((atual) => Math.min(atual + 1, falas.length - 1))
              }}
            >
              {ultima ? t('noe.mission.start') : t('noe.mission.continue')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
