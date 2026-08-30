import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { useSelahFlow } from '../../hooks/useSelahFlow'
import { useTranslation } from '../../i18n'
import type { SelahGateway } from '../../services/selahGateway'
import type { TtsController, TtsEstado } from '../../services/tts'
import { useGameStore } from '../../stores/gameStore'

export type { TtsController }

interface SelahOverlayProps {
  gateway: SelahGateway
  tts?: TtsController
  appVersion?: string
}

const estadoTtsVazio = (): TtsEstado => 'idle'
const assinarTtsVazio = () => () => undefined
const PASSAGE_START_DELAY_MS = 300
const PASSAGE_CHARACTER_DELAY_MS = 58
const QUIZ_START_DELAY_MS = 260
const QUIZ_CHARACTER_DELAY_MS = 34
const QUIZ_ANSWER_GAP_MS = 180
const QUIZ_ANSWER_STAGGER_MS = 120
const FEEDBACK_CHARACTER_DELAY_MS = 28

interface TypewriterTextProps {
  text: string
  characterDelayMs: number
  startDelayMs?: number
  paused?: boolean
}

function TypewriterText({
  text,
  characterDelayMs,
  startDelayMs = 0,
  paused = false,
}: TypewriterTextProps) {
  const characters = Array.from(text)
  const [visibleCount, setVisibleCount] = useState(0)
  const visibleCountRef = useRef(0)
  const completed = visibleCount >= characters.length

  useEffect(() => {
    if (paused || visibleCountRef.current >= characters.length) return

    let interval: number | undefined
    const revealNextCharacter = () => {
      const nextCount = Math.min(visibleCountRef.current + 1, characters.length)
      visibleCountRef.current = nextCount
      setVisibleCount(nextCount)

      if (nextCount >= characters.length && interval !== undefined) {
        window.clearInterval(interval)
      }
    }
    const delay = visibleCountRef.current === 0 ? startDelayMs : characterDelayMs
    const timeout = window.setTimeout(() => {
      revealNextCharacter()
      if (visibleCountRef.current < characters.length) {
        interval = window.setInterval(revealNextCharacter, characterDelayMs)
      }
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [characterDelayMs, characters.length, paused, startDelayMs])

  return (
    <span className="typewriter-text">
      <span className="typewriter-text__measure" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter-text__visible" aria-hidden="true">
        {characters.slice(0, visibleCount).join('')}
        {!completed && <span className="typewriter-text__cursor" />}
      </span>
    </span>
  )
}

export function SelahOverlay({ gateway, tts, appVersion }: SelahOverlayProps) {
  const { t } = useTranslation()
  const { selahAtivo, mostrarQuiz, responder, concluir, cancelar } = useSelahFlow({
    gateway,
    appVersion,
  })
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const ttsAtivo = useGameStore((state) => state.ttsAtivo)
  const setNarracaoAtiva = useGameStore((state) => state.setNarracaoAtiva)
  const ttsEstado = useSyncExternalStore(
    tts?.assinar ?? assinarTtsVazio,
    tts?.estado ?? estadoTtsVazio,
    estadoTtsVazio,
  )
  const narracaoAtiva = ttsEstado === 'playing' || ttsEstado === 'fallback'

  useEffect(() => {
    tituloRef.current?.focus()
  }, [selahAtivo?.fase])

  useEffect(() => {
    const versiculo = selahAtivo?.versiculo
    if (
      selahAtivo?.fase === 'versiculo' &&
      versiculo &&
      tts?.suportado &&
      (faixaEtaria === 'crianca' || ttsAtivo)
    ) {
      void tts.falar(versiculo)
    }

    return () => {
      tts?.cancelar()
    }
  }, [faixaEtaria, selahAtivo?.fase, selahAtivo?.versiculo, tts, ttsAtivo])

  useEffect(() => {
    setNarracaoAtiva(narracaoAtiva)
    return () => setNarracaoAtiva(false)
  }, [narracaoAtiva, setNarracaoAtiva])

  if (!selahAtivo) return null

  const alternarTts = () => {
    const versiculo = selahAtivo.versiculo
    if (!tts?.suportado || !versiculo) return

    if (ttsEstado === 'playing' || ttsEstado === 'fallback') {
      tts.pausar()
      return
    }

    if (ttsEstado === 'paused') {
      tts.retomar()
      return
    }

    void tts.falar(versiculo)
  }

  if (selahAtivo.erro) {
    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card selah-card--enter" role="dialog" aria-modal="true" aria-labelledby="selah-error">
          <p className="eyebrow">{t('selah.moment')}</p>
          <h1 id="selah-error" ref={tituloRef} tabIndex={-1}>
            {t('selah.error.title')}
          </h1>
          <p className="feedback feedback--incorrect" role="alert">
            {selahAtivo.erro}
          </p>
          <button className="secondary-button" type="button" onClick={cancelar}>
            {t('selah.error.exit')}
          </button>
        </section>
      </div>
    )
  }

  if (selahAtivo.fase === 'carregando') {
    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card selah-card--enter" role="dialog" aria-modal="true" aria-labelledby="selah-loading">
          <p className="eyebrow">{t('selah.loading.eyebrow')}</p>
          <h1 id="selah-loading" ref={tituloRef} tabIndex={-1}>
            {t('selah.loading.title')}
          </h1>
          <p className="muted" role="status">
            {t('selah.loading.status')}
          </p>
        </section>
      </div>
    )
  }

  if (selahAtivo.fase === 'versiculo' && selahAtivo.versiculo) {
    const { versiculo, quiz } = selahAtivo
    const ttsDisponivel = Boolean(tts?.suportado)
    const ttsCarregando = ttsEstado === 'loading'
    const ttsPausavel = ttsEstado === 'playing' || ttsEstado === 'fallback'
    const ttsRetomavel = ttsEstado === 'paused'
    const ttsAria = ttsPausavel
      ? t('selah.tts.pauseAria')
      : ttsRetomavel
        ? t('selah.tts.resumeAria')
        : ttsCarregando
          ? t('selah.tts.preparingAria')
          : t('selah.tts.listenAria')
    const ttsAction = ttsPausavel
      ? t('selah.tts.pauseAction')
      : ttsRetomavel
        ? t('selah.tts.resumeAction')
        : ttsCarregando
          ? t('selah.tts.preparingAction')
          : t('selah.tts.action')

    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card selah-card--enter" role="dialog" aria-modal="true" aria-labelledby="selah-verse">
          <p className="eyebrow">
            {t('selah.verse.eyebrow', { reference: versiculo.referencia })}
          </p>
          <h1
            id="selah-verse"
            ref={tituloRef}
            tabIndex={-1}
            className="selah-card__verse"
            aria-label={versiculo.texto}
          >
            <TypewriterText
              key={versiculo.texto}
              text={versiculo.texto}
              characterDelayMs={PASSAGE_CHARACTER_DELAY_MS}
              startDelayMs={PASSAGE_START_DELAY_MS}
              paused={ttsEstado === 'loading' || ttsEstado === 'paused'}
            />
          </h1>
          <p className="selah-card__attribution">
            {versiculo.versao} · {versiculo.atribuicao}
          </p>
          {ttsEstado === 'fallback' && (
            <p className="muted" role="status">
              {t('selah.tts.fallbackStatus')}
            </p>
          )}
          {ttsEstado === 'error' && (
            <p className="muted" role="status">
              {t('selah.tts.error')}
            </p>
          )}
          {!ttsDisponivel && (
            <p id="selah-tts-unavailable" className="sr-only">
              {t('selah.tts.unavailable')}
            </p>
          )}
          <div className="selah-card__actions">
            <button
              className="secondary-button"
              type="button"
              disabled={!ttsDisponivel || ttsCarregando}
              title={ttsDisponivel ? undefined : t('selah.tts.unavailable')}
              aria-label={ttsAria}
              aria-describedby={
                ttsDisponivel ? undefined : 'selah-tts-unavailable'
              }
              onClick={alternarTts}
            >
              {ttsAction}
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!quiz}
              aria-label={t('selah.quiz.continueAria')}
              onClick={mostrarQuiz}
            >
              {t('selah.continue')}
            </button>
          </div>
        </section>
      </div>
    )
  }

  if ((selahAtivo.fase === 'quiz' || selahAtivo.fase === 'enviando') && selahAtivo.quiz) {
    const { quiz } = selahAtivo
    const enviando = selahAtivo.fase === 'enviando'

    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card selah-card--enter" role="dialog" aria-modal="true" aria-labelledby="selah-question">
          <span className="status-chip">
            {quiz.origem === 'ia'
              ? t('selah.quiz.aiStatus')
              : t('selah.quiz.fallbackStatus')}
          </span>
          <h1
            id="selah-question"
            ref={tituloRef}
            tabIndex={-1}
            aria-label={quiz.pergunta}
          >
            <TypewriterText
              key={quiz.pergunta}
              text={quiz.pergunta}
              characterDelayMs={QUIZ_CHARACTER_DELAY_MS}
              startDelayMs={QUIZ_START_DELAY_MS}
            />
          </h1>
          <ol className="answer-list">
            {quiz.alternativas.map((alternativa, index) => (
              <li key={alternativa.id}>
                <button
                  className="answer-button"
                  type="button"
                  disabled={enviando}
                  aria-label={t('selah.quiz.alternativeAria', {
                    id: alternativa.id,
                    text: alternativa.texto,
                  })}
                  onClick={() => void responder(alternativa.id)}
                >
                  <span className="answer-button__id">{alternativa.id}</span>
                  <TypewriterText
                    key={alternativa.texto}
                    text={alternativa.texto}
                    characterDelayMs={QUIZ_CHARACTER_DELAY_MS}
                    startDelayMs={
                      QUIZ_START_DELAY_MS +
                      Array.from(quiz.pergunta).length * QUIZ_CHARACTER_DELAY_MS +
                      QUIZ_ANSWER_GAP_MS +
                      index * QUIZ_ANSWER_STAGGER_MS
                    }
                  />
                </button>
              </li>
            ))}
          </ol>
          {enviando && <p role="status">{t('selah.quiz.checking')}</p>}
        </section>
      </div>
    )
  }

  if (selahAtivo.fase === 'feedback' && selahAtivo.avaliacao) {
    const { avaliacao } = selahAtivo

    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card selah-card--enter" role="dialog" aria-modal="true" aria-labelledby="selah-feedback">
          <p className="eyebrow">{avaliacao.referencia}</p>
          <h1 id="selah-feedback" ref={tituloRef} tabIndex={-1}>
            {avaliacao.acertou
              ? t('selah.feedback.correct')
              : t('selah.feedback.incorrect')}
          </h1>
          <p
            className={`feedback${avaliacao.acertou ? '' : ' feedback--incorrect'}`}
            role="status"
            aria-label={avaliacao.explicacao}
          >
            <TypewriterText
              key={avaliacao.explicacao}
              text={avaliacao.explicacao}
              characterDelayMs={FEEDBACK_CHARACTER_DELAY_MS}
              startDelayMs={QUIZ_START_DELAY_MS}
            />
          </p>
          <button className="primary-button" type="button" onClick={concluir}>
            {t('selah.feedback.startPause')}
          </button>
        </section>
      </div>
    )
  }

  return null
}
