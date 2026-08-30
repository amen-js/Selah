import { useEffect, useMemo, useState } from 'react'

import { momentosCriacao } from '../components/game/creation/progression/catalogo'
import type {
  MomentoCriacaoId,
  SnapshotProgressaoCriacao,
} from '../components/game/creation/progression/types'
import { traduzirJornadaCriacao } from '../components/game/creationJourneyUi'
import { GameOverlay } from '../components/game/GameOverlay'
import { useTranslation, type TranslationKey } from '../i18n'
import { createTtsController, type TtsController } from '../services/tts'
import { useGameStore } from '../stores/gameStore'
import { createLabGateway, type CenarioLab, versiculoLab } from './fixtures'

const cenarioKeys: Record<CenarioLab, TranslationKey> = {
  sucesso: 'lab.scenario.success',
  fallback: 'lab.scenario.fallback',
  erro: 'lab.scenario.error',
}

interface LabPageProps {
  tts?: TtsController
}

export function LabPage({ tts: ttsInjetado }: LabPageProps = {}) {
  const { idioma, t } = useTranslation()
  const [cenario, setCenario] = useState<CenarioLab>('sucesso')
  const [momentoSelecionadoId, setMomentoSelecionadoId] =
    useState<MomentoCriacaoId>('vazio')
  const [inatividadeCriacao, setInatividadeCriacao] = useState(false)
  const gateway = useMemo(() => createLabGateway(cenario), [cenario])
  const ttsFallback = useMemo(() => createTtsController(), [])
  const tts = ttsInjetado ?? ttsFallback
  const setRegiao = useGameStore((state) => state.setRegiao)
  const abrirSelah = useGameStore((state) => state.abrirSelah)
  const setDialogoAberto = useGameStore((state) => state.setDialogoAberto)
  const apagarProgresso = useGameStore((state) => state.apagarProgresso)

  useEffect(() => {
    setRegiao('criacao')
  }, [setRegiao])

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

  const selecionarMomento = (momentoId: MomentoCriacaoId) => {
    setMomentoSelecionadoId(momentoId)
    setInatividadeCriacao(false)
  }

  const reiniciar = () => {
    setMomentoSelecionadoId('vazio')
    setInatividadeCriacao(false)
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
              selecionarMomento(event.target.value as MomentoCriacaoId)
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
          aria-pressed={inatividadeCriacao}
          onClick={() => setInatividadeCriacao((inativa) => !inativa)}
        >
          {t(
            inatividadeCriacao
              ? 'lab.creationActivity.resume'
              : 'lab.creationActivity.pause',
          )}
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
        inatividadeCriacao={inatividadeCriacao}
        dialogo={{
          personagem: 'Lumi',
          mensagem: t('lab.dialog.message'),
        }}
      />
    </main>
  )
}
