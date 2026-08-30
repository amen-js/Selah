import { useEffect, useRef } from 'react'

import { useSelahFlow } from '../../hooks/useSelahFlow'
import type { SelahGateway } from '../../services/selahGateway'
import { useGameStore } from '../../stores/gameStore'
import type { Idioma } from '../../types/selah'

export interface TtsController {
  suportado: boolean
  falar: (texto: string, idioma: Idioma) => void
  pausar: () => void
  cancelar: () => void
}

interface SelahOverlayProps {
  gateway: SelahGateway
  tts?: TtsController
  appVersion?: string
}

export function SelahOverlay({ gateway, tts, appVersion }: SelahOverlayProps) {
  const { selahAtivo, mostrarQuiz, responder, concluir, cancelar } = useSelahFlow({
    gateway,
    appVersion,
  })
  const falandoRef = useRef(false)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const ttsAtivo = useGameStore((state) => state.ttsAtivo)

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
      tts.falar(versiculo.texto, versiculo.idioma)
      falandoRef.current = true
    }

    return () => {
      tts?.cancelar()
      falandoRef.current = false
    }
  }, [faixaEtaria, selahAtivo?.fase, selahAtivo?.versiculo, tts, ttsAtivo])

  if (!selahAtivo) return null

  const alternarTts = () => {
    const versiculo = selahAtivo.versiculo
    if (!tts?.suportado || !versiculo) return

    if (falandoRef.current) {
      tts.pausar()
      falandoRef.current = false
      return
    }

    tts.falar(versiculo.texto, versiculo.idioma)
    falandoRef.current = true
  }

  if (selahAtivo.erro) {
    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card" role="dialog" aria-modal="true" aria-labelledby="selah-error">
          <p className="eyebrow">Momento Selah</p>
          <h1 id="selah-error" ref={tituloRef} tabIndex={-1}>
            Vamos pausar por aqui
          </h1>
          <p className="feedback feedback--incorrect" role="alert">
            {selahAtivo.erro}
          </p>
          <button className="secondary-button" type="button" onClick={cancelar}>
            Sair do Momento Selah
          </button>
        </section>
      </div>
    )
  }

  if (selahAtivo.fase === 'carregando') {
    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card" role="dialog" aria-modal="true" aria-labelledby="selah-loading">
          <p className="eyebrow">Respire devagar</p>
          <h1 id="selah-loading" ref={tituloRef} tabIndex={-1}>
            Preparando este momento…
          </h1>
          <p className="muted" role="status">
            Buscando a passagem e um desafio seguro.
          </p>
        </section>
      </div>
    )
  }

  if (selahAtivo.fase === 'versiculo' && selahAtivo.versiculo) {
    const { versiculo, quiz } = selahAtivo
    const ttsDisponivel = Boolean(tts?.suportado)

    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card" role="dialog" aria-modal="true" aria-labelledby="selah-verse">
          <p className="eyebrow">Momento Selah · {versiculo.referencia}</p>
          <h1 id="selah-verse" ref={tituloRef} tabIndex={-1} className="selah-card__verse">
            {versiculo.texto}
          </h1>
          <p className="selah-card__attribution">
            {versiculo.versao} · {versiculo.atribuicao}
          </p>
          <div className="selah-card__actions">
            <button
              className="secondary-button"
              type="button"
              disabled={!ttsDisponivel}
              title={ttsDisponivel ? undefined : 'Leitura em voz alta indisponível neste dispositivo.'}
              aria-label="Ouvir versículo"
              onClick={alternarTts}
            >
              Ouvir / pausar
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!quiz}
              aria-label="Continuar para o quiz"
              onClick={mostrarQuiz}
            >
              Continuar
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
        <section className="selah-card" role="dialog" aria-modal="true" aria-labelledby="selah-question">
          <span className="status-chip">
            {quiz.origem === 'ia'
              ? 'Quiz criado por IA a partir da passagem aprovada'
              : 'Quiz local aprovado — IA desativada ou indisponível'}
          </span>
          <h1 id="selah-question" ref={tituloRef} tabIndex={-1}>
            {quiz.pergunta}
          </h1>
          <ol className="answer-list">
            {quiz.alternativas.map((alternativa) => (
              <li key={alternativa.id}>
                <button
                  className="answer-button"
                  type="button"
                  disabled={enviando}
                  aria-label={`Alternativa ${alternativa.id}: ${alternativa.texto}`}
                  onClick={() => void responder(alternativa.id)}
                >
                  <span className="answer-button__id">{alternativa.id}</span>
                  <span>{alternativa.texto}</span>
                </button>
              </li>
            ))}
          </ol>
          {enviando && <p role="status">Verificando resposta…</p>}
        </section>
      </div>
    )
  }

  if (selahAtivo.fase === 'feedback' && selahAtivo.avaliacao) {
    const { avaliacao } = selahAtivo

    return (
      <div className="modal-backdrop overlay-interactive selah-backdrop">
        <section className="selah-card" role="dialog" aria-modal="true" aria-labelledby="selah-feedback">
          <p className="eyebrow">{avaliacao.referencia}</p>
          <h1 id="selah-feedback" ref={tituloRef} tabIndex={-1}>
            {avaliacao.acertou ? 'Você acertou' : 'Vamos aprender juntos'}
          </h1>
          <p className={`feedback${avaliacao.acertou ? '' : ' feedback--incorrect'}`} role="status">
            {avaliacao.explicacao}
          </p>
          <button className="primary-button" type="button" onClick={concluir}>
            Iniciar Pausa Selah
          </button>
        </section>
      </div>
    )
  }

  return null
}
