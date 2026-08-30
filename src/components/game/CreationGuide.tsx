import { useTranslation } from '../../i18n'
import type { SnapshotProgressaoCriacao } from './creation/progression'
import { traduzirJornadaCriacao } from './creationJourneyUi'

interface CreationGuideProps {
  snapshot: SnapshotProgressaoCriacao
  exploracaoAtiva: boolean
  linha?: {
    readonly texto: string
  }
}

export function CreationGuide({
  snapshot,
  exploracaoAtiva,
  linha,
}: CreationGuideProps) {
  const { idioma, t } = useTranslation()

  if (!exploracaoAtiva) return null

  const texto = snapshot.estado.concluida
    ? {
        titulo: t('creation.complete.title'),
        objetivo: t('creation.complete.objective'),
      }
    : traduzirJornadaCriacao(snapshot.momento.id, idioma)
  const rotulo = t('creation.guide.label')

  return (
    <aside
      className="creation-guide"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={rotulo}
    >
      <span className="creation-guide__label">{rotulo}</span>
      <strong className="creation-guide__title">{texto.titulo}</strong>
      <p>{linha?.texto ?? texto.objetivo}</p>
    </aside>
  )
}
