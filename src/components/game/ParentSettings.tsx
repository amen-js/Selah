import { useState } from 'react'

import { useTranslation } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'
import type { FaixaEtaria } from '../../types/selah'
import { LanguageSelector } from './LanguageSelector'

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="setting-row">
      <span>
        <strong>{label}</strong>
        <p>{description}</p>
      </span>
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

export function ParentSettings() {
  const { t } = useTranslation()
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const ttsAtivo = useGameStore((state) => state.ttsAtivo)
  const iaAtiva = useGameStore((state) => state.iaAtiva)
  const salvarProgresso = useGameStore((state) => state.salvarProgresso)
  const compartilharMetricas = useGameStore((state) => state.compartilharMetricas)
  const setFaixaEtaria = useGameStore((state) => state.setFaixaEtaria)
  const setTtsAtivo = useGameStore((state) => state.setTtsAtivo)
  const setIaAtiva = useGameStore((state) => state.setIaAtiva)
  const setSalvarProgresso = useGameStore((state) => state.setSalvarProgresso)
  const setCompartilharMetricas = useGameStore((state) => state.setCompartilharMetricas)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)
  const apagarProgresso = useGameStore((state) => state.apagarProgresso)

  return (
    <div className="modal-backdrop overlay-interactive">
      <section
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="panel__header">
          <div>
            <p className="eyebrow">{t('settings.eyebrow')}</p>
            <h2 id="settings-title">{t('settings.title')}</h2>
          </div>
          <button
            autoFocus
            className="secondary-button"
            type="button"
            aria-label={t('settings.closeAria')}
            onClick={() => setPainelAberto(null)}
          >
            {t('common.close')}
          </button>
        </header>

        <div className="settings-list">
          <section className="setting-row" aria-labelledby="privacy-title">
            <div>
              <strong id="privacy-title">{t('settings.privacy.title')}</strong>
              <p>{t('settings.privacy.description')}</p>
            </div>
          </section>

          <div className="setting-row">
            <div>
              <strong>{t('settings.language.title')}</strong>
              <p>{t('settings.language.description')}</p>
            </div>
            <LanguageSelector />
          </div>

          <label className="setting-row">
            <span>
              <strong>{t('settings.age.title')}</strong>
              <p>{t('settings.age.description')}</p>
            </span>
            <select
              aria-label={t('settings.age.label')}
              value={faixaEtaria}
              onChange={(event) => setFaixaEtaria(event.target.value as FaixaEtaria)}
            >
              <option value="geral">{t('settings.age.general')}</option>
              <option value="crianca">{t('settings.age.child')}</option>
            </select>
          </label>

          <ToggleRow
            label={t('settings.tts.label')}
            description={t('settings.tts.description')}
            checked={ttsAtivo}
            onChange={setTtsAtivo}
          />
          <ToggleRow
            label={t('settings.ai.label')}
            description={t('settings.ai.description')}
            checked={iaAtiva}
            onChange={setIaAtiva}
          />
          <ToggleRow
            label={t('settings.save.label')}
            description={t('settings.save.description')}
            checked={salvarProgresso}
            onChange={setSalvarProgresso}
          />
          <ToggleRow
            label={t('settings.metrics.label')}
            description={t('settings.metrics.description')}
            checked={compartilharMetricas}
            onChange={setCompartilharMetricas}
          />

          <section className="setting-row">
            <div>
              <strong>{t('settings.delete.title')}</strong>
              <p>{t('settings.delete.description')}</p>
            </div>
            {confirmandoExclusao ? (
              <div className="hud__actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                >
                  {t('settings.delete.cancel')}
                </button>
                <button
                  className="secondary-button danger-button"
                  type="button"
                  aria-label={t('settings.delete.confirmAria')}
                  onClick={apagarProgresso}
                >
                  {t('settings.delete.confirm')}
                </button>
              </div>
            ) : (
              <button
                className="secondary-button danger-button"
                type="button"
                aria-label={t('settings.delete.aria')}
                onClick={() => setConfirmandoExclusao(true)}
              >
                {t('settings.delete.action')}
              </button>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}
