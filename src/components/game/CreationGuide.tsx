import { useTranslation } from '../../i18n'
import type { SnapshotProgressaoCriacao } from './creation/progression'
import { traduzirJornadaCriacao } from './creationJourneyUi'
import { TypewriterText } from './TypewriterText'

const GUIDE_START_DELAY_MS = 180
const GUIDE_CHARACTER_DELAY_MS = 58

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
  const mensagem = linha?.texto ?? texto.objetivo

  return (
    <aside
      className="creation-guide creation-guide--enter"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={rotulo}
    >
      <span className="creation-guide__label">{rotulo}</span>
      <strong className="creation-guide__title">{texto.titulo}</strong>
      <p aria-label={mensagem}>
        <TypewriterText
          key={mensagem}
          text={mensagem}
          characterDelayMs={GUIDE_CHARACTER_DELAY_MS}
          startDelayMs={GUIDE_START_DELAY_MS}
        />
      </p>
    </aside>
  )
}
