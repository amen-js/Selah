import { useTranslation } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'

interface DialogBoxProps {
  personagem: string
  mensagem: string
}

export function DialogBox({ personagem, mensagem }: DialogBoxProps) {
  const { t } = useTranslation()
  const setDialogoAberto = useGameStore((state) => state.setDialogoAberto)

  return (
    <section
      className="dialog-box overlay-interactive"
      aria-label={t('dialog.aria', { character: personagem })}
    >
      <div className="dialog-box__speaker">
        <div>
          <strong>{personagem}</strong>
          <p className="eyebrow">{t('dialog.disclosure')}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          aria-label={t('dialog.continueAria')}
          onClick={() => setDialogoAberto(false)}
        >
          {t('dialog.continue')}
        </button>
      </div>
      <p>{mensagem}</p>
    </section>
  )
}
