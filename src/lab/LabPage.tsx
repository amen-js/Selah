import { useMemo, useState } from 'react'

import { momentosCriacao } from '../components/game/creation/progression/catalogo'
import type {
  MomentoCriacaoId,
  SnapshotProgressaoCriacao,
} from '../components/game/creation/progression/types'
import { traduzirJornadaCriacao } from '../components/game/creationJourneyUi'
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
  const { idioma, t } = useTranslation()
  const [cenario, setCenario] = useState<CenarioLab>('sucesso')
  const [momentoSelecionadoId, setMomentoSelecionadoId] =
    useState<MomentoCriacaoId>('vazio')
  const gateway = useMemo(() => createLabGateway(cenario), [cenario])
  const tts = useMemo(() => createTtsController(), [])
  const setRegiao = useGameStore((state) => state.setRegiao)
  const abrirSelah = useGameStore((state) => state.abrirSelah)
  const setDialogoAberto = useGameStore((state) => state.setDialogoAberto)
  const apagarProgresso = useGameStore((state) => state.apagarProgresso)
  const momentoSelecionado =
    momentosCriacao.find((momento) => momento.id === momentoSelecionadoId) ??
    momentosCriacao[0]
  const snapshotProgressaoCriacao: SnapshotProgressaoCriacao = {
    momento: momentoSelecionado,
    estado: {
      momentoAtualId: momentoSelecionado.id,
      momentosConcluidos: momentosCriacao
        .filter((momento) => momento.ordem < momentoSelecionado.ordem)
        .map((momento) => momento.id),
      concluida: false,
    },
  }

  const iniciarSelah = () => {
    setRegiao('criacao')
    abrirSelah({ historiaId: 'criacao', passagemId: versiculoLab.passagemId })
  }

  const reiniciar = () => {
    setMomentoSelecionadoId('vazio')
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
        <label>
          <span className="sr-only">{t('lab.creationMoment.label')}</span>
          <select
            aria-label={t('lab.creationMoment.label')}
            value={momentoSelecionadoId}
            onChange={(event) =>
              setMomentoSelecionadoId(event.target.value as MomentoCriacaoId)
            }
          >
            {momentosCriacao.map((momento) => (
              <option key={momento.id} value={momento.id}>
                {traduzirJornadaCriacao(momento.id, idioma).titulo}
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
        progressaoCriacao={snapshotProgressaoCriacao}
        exploracaoAtiva
        dialogo={{
          personagem: 'Lumi',
          mensagem: t('lab.dialog.message'),
        }}
      />
    </main>
  )
}
