import { useTranslation } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'

export function Journal() {
  const { t } = useTranslation()
  const passagens = useGameStore((state) => state.versiculosColetados)
  const historico = useGameStore((state) => state.historico)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)

  return (
    <div className="modal-backdrop overlay-interactive">
      <section className="panel" role="dialog" aria-modal="true" aria-labelledby="journal-title">
        <header className="panel__header">
          <div>
            <p className="eyebrow">{t('journal.eyebrow')}</p>
            <h2 id="journal-title">{t('journal.title')}</h2>
          </div>
          <button
            autoFocus
            className="secondary-button"
            type="button"
            aria-label={t('journal.closeAria')}
            onClick={() => setPainelAberto(null)}
          >
            {t('common.close')}
          </button>
        </header>

        {passagens.length === 0 && historico.length === 0 ? (
          <p className="empty-state">{t('journal.empty')}</p>
        ) : (
          <div className="panel__stack">
            <section aria-labelledby="passagens-title">
              <h3 id="passagens-title">{t('journal.passages.title')}</h3>
              {passagens.length === 0 ? (
                <p className="muted">{t('journal.passages.none')}</p>
              ) : (
                <div className="panel__stack">
                  {passagens.map((passagemId) => (
                    <article
                      className="journal-entry"
                      key={passagemId}
                      aria-label={t('journal.passage.label', {
                        passageId: passagemId,
                      })}
                    >
                      <span className="eyebrow">{t('journal.passage.eyebrow')}</span>
                      <p>{passagemId}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="respostas-title">
              <h3 id="respostas-title">{t('journal.quizzes.title')}</h3>
              {historico.length === 0 ? (
                <p className="muted">{t('journal.quizzes.none')}</p>
              ) : (
                <div className="panel__stack">
                  {historico.map((resultado) => (
                    <article className="journal-entry" key={resultado.quizId}>
                      <strong>{resultado.passagemId}</strong>
                      <p>
                        {t('journal.result', {
                          answer: resultado.alternativaId,
                          result: resultado.acertou
                            ? t('journal.result.correct')
                            : t('journal.result.tryAgain'),
                        })}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  )
}
