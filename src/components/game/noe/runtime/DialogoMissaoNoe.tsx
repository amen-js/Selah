import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { NarracaoMissaoNoeId } from '../../../../content/narrations'
import { useTranslation, type TranslationFunction } from '../../../../i18n'
import {
  ttsController,
  type TtsController,
  type TtsEstado,
} from '../../../../services/tts'
import { useGameStore } from '../../../../stores/gameStore'

interface FalaMissaoNoe {
  narracaoId: NarracaoMissaoNoeId
  personagem: string
  mensagem: string
}

function criarFalasMissaoNoe(t: TranslationFunction): readonly FalaMissaoNoe[] {
  return [
    {
      narracaoId: 'noe.mission.line1',
      personagem: t('noe.mission.noah'),
      mensagem: t('noe.mission.line1'),
    },
    {
      narracaoId: 'noe.mission.line2',
      personagem: t('noe.mission.sons'),
      mensagem: t('noe.mission.line2'),
    },
    {
      narracaoId: 'noe.mission.line3',
      personagem: t('noe.mission.noah'),
      mensagem: t('noe.mission.line3'),
    },
  ]
}

export interface DialogoMissaoNoeProps {
  tts?: TtsController
  onConcluir: () => void
  onCancelar: () => void
}

const estadoTtsVazio = (): TtsEstado => 'idle'

/** Narrative briefing for M1, intentionally separate from the AI disclosure. */
export function DialogoMissaoNoe({
  tts = ttsController,
  onConcluir,
  onCancelar,
}: DialogoMissaoNoeProps) {
  const { idioma, t } = useTranslation()
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const ttsAtivo = useGameStore((state) => state.ttsAtivo)
  const setNarracaoAtiva = useGameStore((state) => state.setNarracaoAtiva)
  const falas = useMemo(() => criarFalasMissaoNoe(t), [t])
  const [indice, setIndice] = useState(0)
  const fala = falas[indice]
  const ultima = indice === falas.length - 1
  const narracaoAutomatica =
    tts.suportado && (faixaEtaria === 'crianca' || ttsAtivo)
  const ttsEstado = useSyncExternalStore(
    tts.assinar,
    tts.estado,
    estadoTtsVazio,
  )
  const narracaoAtiva = ttsEstado === 'playing' || ttsEstado === 'fallback'

  useEffect(() => {
    const timer = narracaoAutomatica
      ? setTimeout(() => {
          void tts.narrar({
            narracaoId: fala.narracaoId,
            idioma,
            textoFallback: fala.mensagem,
          })
        }, 0)
      : undefined

    return () => {
      if (timer !== undefined) clearTimeout(timer)
      tts.cancelar()
    }
  }, [fala.mensagem, fala.narracaoId, idioma, narracaoAutomatica, tts])

  useEffect(() => {
    setNarracaoAtiva(narracaoAtiva)
    return () => setNarracaoAtiva(false)
  }, [narracaoAtiva, setNarracaoAtiva])

  const cancelar = () => {
    tts.cancelar()
    onCancelar()
  }

  const continuar = () => {
    if (ultima) {
      tts.cancelar()
      onConcluir()
      return
    }
    setIndice((atual) => Math.min(atual + 1, falas.length - 1))
  }

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
            <button type="button" onClick={cancelar}>
              {t('noe.mission.later')}
            </button>
            <button
              type="button"
              className="is-primary"
              onClick={continuar}
            >
              {ultima ? t('noe.mission.start') : t('noe.mission.continue')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
