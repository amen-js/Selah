import { useState } from 'react'

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
            <p className="eyebrow">Área local para responsáveis</p>
            <h2 id="settings-title">Configurações da experiência</h2>
          </div>
          <button
            autoFocus
            className="secondary-button"
            type="button"
            aria-label="Fechar configurações"
            onClick={() => setPainelAberto(null)}
          >
            Fechar
          </button>
        </header>

        <div className="settings-list">
          <section className="setting-row" aria-labelledby="privacy-title">
            <div>
              <strong id="privacy-title">Privacidade por padrão</strong>
              <p>
                Sem cadastro infantil, nomes, escola, igreja ou histórico enviado. O progresso fica
                somente neste navegador quando você permitir.
              </p>
            </div>
          </section>

          <div className="setting-row">
            <div>
              <strong>Idioma</strong>
              <p>Define o texto bíblico, o quiz e a voz disponível.</p>
            </div>
            <LanguageSelector />
          </div>

          <label className="setting-row">
            <span>
              <strong>Faixa etária</strong>
              <p>Para crianças, a leitura do versículo pode começar automaticamente.</p>
            </span>
            <select
              aria-label="Faixa etária"
              value={faixaEtaria}
              onChange={(event) => setFaixaEtaria(event.target.value as FaixaEtaria)}
            >
              <option value="geral">Leitura geral</option>
              <option value="crianca">Criança</option>
            </select>
          </label>

          <ToggleRow
            label="Leitura em voz alta"
            description="Permite ouvir o versículo e os textos do Momento Selah."
            checked={ttsAtivo}
            onChange={setTtsAtivo}
          />
          <ToggleRow
            label="Usar IA para novos quizzes"
            description="Quando desligado, somente um fallback aprovado é usado."
            checked={iaAtiva}
            onChange={setIaAtiva}
          />
          <ToggleRow
            label="Salvar progresso neste dispositivo"
            description="Guarda apenas IDs, contadores e respostas A/B/C/D."
            checked={salvarProgresso}
            onChange={setSalvarProgresso}
          />
          <ToggleRow
            label="Compartilhar métricas agregadas"
            description="Envia somente totais de Selahs e acertos, sem perfil ou identificador."
            checked={compartilharMetricas}
            onChange={setCompartilharMetricas}
          />

          <section className="setting-row">
            <div>
              <strong>Apagar dados locais</strong>
              <p>Remove preferências, passagens, contadores e histórico deste navegador.</p>
            </div>
            {confirmandoExclusao ? (
              <div className="hud__actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                >
                  Cancelar
                </button>
                <button
                  className="secondary-button danger-button"
                  type="button"
                  aria-label="Confirmar exclusão do progresso"
                  onClick={apagarProgresso}
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                className="secondary-button danger-button"
                type="button"
                aria-label="Apagar progresso"
                onClick={() => setConfirmandoExclusao(true)}
              >
                Apagar progresso
              </button>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}
