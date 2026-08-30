import { useMemo, useState } from 'react'

import { GameOverlay } from '../components/game/GameOverlay'
import type { TtsController } from '../components/game/SelahOverlay'
import { useGameStore } from '../stores/gameStore'
import { createLabGateway, type CenarioLab, versiculoLab } from './fixtures'

const createLabTts = (): TtsController => {
  const suportado =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window

  return {
    suportado,
    falar: (texto, idioma) => {
      if (!suportado) return
      window.speechSynthesis.cancel()
      const fala = new SpeechSynthesisUtterance(texto)
      fala.lang = idioma
      window.speechSynthesis.speak(fala)
    },
    pausar: () => {
      if (suportado) window.speechSynthesis.pause()
    },
    cancelar: () => {
      if (suportado) window.speechSynthesis.cancel()
    },
  }
}

export function LabPage() {
  const [cenario, setCenario] = useState<CenarioLab>('sucesso')
  const gateway = useMemo(() => createLabGateway(cenario), [cenario])
  const tts = useMemo(() => createLabTts(), [])
  const setRegiao = useGameStore((state) => state.setRegiao)
  const abrirSelah = useGameStore((state) => state.abrirSelah)
  const setDialogoAberto = useGameStore((state) => state.setDialogoAberto)
  const apagarProgresso = useGameStore((state) => state.apagarProgresso)

  const iniciarSelah = () => {
    setRegiao('criacao')
    abrirSelah({ historiaId: 'criacao', passagemId: versiculoLab.passagemId })
  }

  const reiniciar = () => {
    apagarProgresso()
    useGameStore.getState().setRegiao('criacao')
  }

  return (
    <main className="lab-page">
      <section className="lab-controls" aria-label="Controles do laboratório">
        <strong>Laboratório da UI</strong>
        <label>
          <span className="sr-only">Cenário do laboratório</span>
          <select
            aria-label="Cenário do laboratório"
            value={cenario}
            onChange={(event) => setCenario(event.target.value as CenarioLab)}
          >
            <option value="sucesso">Sucesso com IA</option>
            <option value="fallback">Fallback aprovado</option>
            <option value="erro">Erro de rede</option>
          </select>
        </label>
        <button className="primary-button" type="button" onClick={iniciarSelah}>
          Iniciar Momento Selah
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setDialogoAberto(true)}
        >
          Mostrar diálogo
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => useGameStore.setState({ pausaParentalAtiva: true })}
        >
          Ativar pausa parental
        </button>
        <button
          className="secondary-button"
          type="button"
          aria-label="Reiniciar laboratório"
          onClick={reiniciar}
        >
          Reiniciar
        </button>
      </section>

      <section className="lab-canvas-placeholder" aria-label="Área simulada do jogo">
        <div>
          <p className="eyebrow">Rota independente</p>
          <h1>Nenhum Canvas 3D é necessário aqui.</h1>
          <p>Use os controles acima ou o HUD para testar cada camada da interface.</p>
        </div>
      </section>

      <GameOverlay
        gateway={gateway}
        tts={tts}
        appVersion="lab"
        dialogo={{
          personagem: 'Lumi',
          mensagem: 'Sou um personagem virtual automatizado. Vamos observar a criação da luz.',
        }}
      />
    </main>
  )
}
