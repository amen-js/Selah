import { useMemo, useState } from 'react'

import { GameOverlay } from '../components/game/GameOverlay'
import { useTranslation, type TranslationKey } from '../i18n'
import { createTtsController } from '../services/tts'
import { useGameStore } from '../stores/gameStore'
import { createLabGateway, type CenarioLab, versiculoLab } from './fixtures'

const cenarioKeys: Record<CenarioLab, TranslationKey> = {
  sucesso: 'lab.scenario.success',
  fallback: 'lab.scenario.fallback',
  erro: 'lab.scenario.error',
}

export function LabPage() {
  const { t } = useTranslation()
  const [cenario, setCenario] = useState<CenarioLab>('sucesso')
  const gateway = useMemo(() => createLabGateway(cenario), [cenario])
  const tts = useMemo(() => createTtsController(), [])
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
      <section className="lab-controls" aria-label={t('lab.controls.aria')}>
        <strong>{t('lab.title')}</strong>
        <label>
          <span className="sr-only">{t('lab.scenario.label')}</span>
          <select
            aria-label={t('lab.scenario.label')}
            value={cenario}
            onChange={(event) => setCenario(event.target.value as CenarioLab)}
          >
            {(Object.keys(cenarioKeys) as CenarioLab[]).map((value) => (
              <option key={value} value={value}>
                {t(cenarioKeys[value])}
              </option>
            ))}
          </select>
        </label>
        <button className="primary-button" type="button" onClick={iniciarSelah}>
          {t('lab.startSelah')}
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setDialogoAberto(true)}
        >
          {t('lab.showDialog')}
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => useGameStore.setState({ pausaParentalAtiva: true })}
        >
          {t('lab.activatePause')}
        </button>
        <button
          className="secondary-button"
          type="button"
          aria-label={t('lab.resetAria')}
          onClick={reiniciar}
        >
          {t('lab.reset')}
        </button>
      </section>

      <section
        className="lab-canvas-placeholder"
        aria-label={t('lab.areaAria')}
      >
        <div>
          <p className="eyebrow">{t('lab.routeEyebrow')}</p>
          <h1>{t('lab.placeholder.title')}</h1>
          <p>{t('lab.placeholder.description')}</p>
        </div>
      </section>

      <GameOverlay
        gateway={gateway}
        tts={tts}
        appVersion="lab"
        dialogo={{
          personagem: 'Lumi',
          mensagem: t('lab.dialog.message'),
        }}
      />
    </main>
  )
}
