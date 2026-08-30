import { useEffect, useRef } from 'react'

import { useTranslation } from '../../i18n'
import { useGameStore } from '../../stores/gameStore'
import type { FaixaEtaria } from '../../types/selah'
import { LanguageSelector } from './LanguageSelector'

interface OnboardingToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function OnboardingToggle({
  label,
  description,
  checked,
  onChange,
}: OnboardingToggleProps) {
  return (
    <label className="setting-row">
      <span>
        <strong>{label}</strong>
        <p>{description}</p>
      </span>
      <span className="toggle-control">
        <input
          className="toggle-control__input"
          type="checkbox"
          role="switch"
          aria-label={label}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="toggle-control__track" aria-hidden="true">
          <span className="toggle-control__thumb" />
        </span>
      </span>
    </label>
  )
}

export function ResponsibleOnboarding() {
  const { t } = useTranslation()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const iaAtiva = useGameStore((state) => state.iaAtiva)
  const salvarProgresso = useGameStore((state) => state.salvarProgresso)
  const compartilharMetricas = useGameStore((state) => state.compartilharMetricas)
  const setFaixaEtaria = useGameStore((state) => state.setFaixaEtaria)
  const setIaAtiva = useGameStore((state) => state.setIaAtiva)
  const setSalvarProgresso = useGameStore((state) => state.setSalvarProgresso)
  const setCompartilharMetricas = useGameStore((state) => state.setCompartilharMetricas)
  const concluirConfiguracaoInicial = useGameStore(
    (state) => state.concluirConfiguracaoInicial,
  )

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <div className="modal-backdrop onboarding-backdrop overlay-interactive">
      <section
        className="panel onboarding-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
      >
        <header className="onboarding-panel__header">
          <div>
            <p className="eyebrow">{t('onboarding.eyebrow')}</p>
            <h1 id="onboarding-title" ref={titleRef} tabIndex={-1}>
              {t('onboarding.title')}
            </h1>
          </div>
          <LanguageSelector />
        </header>

        <p id="onboarding-description" className="onboarding-panel__lead">
          {t('onboarding.description')}
        </p>

        <div className="onboarding-callouts">
          <article>
            <strong>{t('onboarding.pause.title')}</strong>
            <p>{t('onboarding.pause.description')}</p>
          </article>
          <article>
            <strong>{t('onboarding.privacy.title')}</strong>
            <p>{t('onboarding.privacy.description')}</p>
          </article>
        </div>

        <div className="settings-list">
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

          <OnboardingToggle
            label={t('settings.ai.label')}
            description={t('settings.ai.description')}
            checked={iaAtiva}
            onChange={setIaAtiva}
          />
          <OnboardingToggle
            label={t('settings.save.label')}
            description={t('settings.save.description')}
            checked={salvarProgresso}
            onChange={setSalvarProgresso}
          />
          <OnboardingToggle
            label={t('settings.metrics.label')}
            description={t('settings.metrics.description')}
            checked={compartilharMetricas}
            onChange={setCompartilharMetricas}
          />
        </div>

        <footer className="panel__footer onboarding-panel__footer">
          <p className="muted">{t('onboarding.footer')}</p>
          <button
            className="primary-button onboarding-panel__action"
            type="button"
            onClick={concluirConfiguracaoInicial}
          >
            {salvarProgresso
              ? t('onboarding.action.save')
              : t('onboarding.action.withoutSave')}
          </button>
        </footer>
      </section>
    </div>
  )
}
