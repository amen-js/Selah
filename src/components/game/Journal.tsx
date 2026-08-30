import { useGameStore } from '../../stores/gameStore'

export function Journal() {
  const passagens = useGameStore((state) => state.versiculosColetados)
  const historico = useGameStore((state) => state.historico)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)

  return (
    <div className="modal-backdrop overlay-interactive">
      <section className="panel" role="dialog" aria-modal="true" aria-labelledby="journal-title">
        <header className="panel__header">
          <div>
            <p className="eyebrow">Progresso neste dispositivo</p>
            <h2 id="journal-title">Diário da jornada</h2>
          </div>
          <button
            autoFocus
            className="secondary-button"
            type="button"
            aria-label="Fechar diário"
            onClick={() => setPainelAberto(null)}
          >
            Fechar
          </button>
        </header>

        {passagens.length === 0 && historico.length === 0 ? (
          <p className="empty-state">Ainda não há passagens nesta jornada. Explore com calma.</p>
        ) : (
          <div className="panel__stack">
            <section aria-labelledby="passagens-title">
              <h3 id="passagens-title">Passagens encontradas</h3>
              {passagens.length === 0 ? (
                <p className="muted">Nenhuma passagem encontrada.</p>
              ) : (
                <div className="panel__stack">
                  {passagens.map((passagemId) => (
                    <article className="journal-entry" key={passagemId}>
                      <span className="eyebrow">Passagem</span>
                      <p>{passagemId}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="respostas-title">
              <h3 id="respostas-title">Quizzes respondidos</h3>
              {historico.length === 0 ? (
                <p className="muted">Nenhum quiz respondido.</p>
              ) : (
                <div className="panel__stack">
                  {historico.map((resultado) => (
                    <article className="journal-entry" key={resultado.quizId}>
                      <strong>{resultado.passagemId}</strong>
                      <p>
                        Alternativa {resultado.alternativaId} ·{' '}
                        {resultado.acertou ? 'Acertou' : 'Continue tentando'}
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
