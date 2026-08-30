import {
  selectTaxaAcertos,
  selectTaxaConclusao,
  useGameStore,
} from '../../stores/gameStore'

export function LocalDashboard() {
  const iniciados = useGameStore((state) => state.selahsIniciados)
  const completados = useGameStore((state) => state.selahsCompletados)
  const respostas = useGameStore((state) => state.historico.length)
  const taxaConclusao = useGameStore(selectTaxaConclusao)
  const taxaAcertos = useGameStore(selectTaxaAcertos)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)

  return (
    <div className="modal-backdrop overlay-interactive">
      <section className="panel" role="dialog" aria-modal="true" aria-labelledby="metrics-title">
        <header className="panel__header">
          <div>
            <p className="eyebrow">Não medimos tempo de tela</p>
            <h2 id="metrics-title">Medimos Momentos Selah</h2>
          </div>
          <button
            autoFocus
            className="secondary-button"
            type="button"
            aria-label="Fechar métricas"
            onClick={() => setPainelAberto(null)}
          >
            Fechar
          </button>
        </header>

        <div className="dashboard-grid">
          <article className="metric-card">
            <span className="muted">Selahs iniciados</span>
            <strong>{iniciados}</strong>
          </article>
          <article className="metric-card">
            <span className="muted">Selahs concluídos</span>
            <strong>{completados}</strong>
          </article>
          <article className="metric-card">
            <span className="muted">Taxa de conclusão</span>
            <strong data-testid="completion-rate">{taxaConclusao}%</strong>
          </article>
          <article className="metric-card">
            <span className="muted">Acertos em {respostas} quizzes</span>
            <strong data-testid="accuracy-rate">{taxaAcertos}%</strong>
          </article>
        </div>

        <p className="muted">
          Estes números são calculados localmente. O envio agregado só ocorre após consentimento do
          responsável.
        </p>
      </section>
    </div>
  )
}
