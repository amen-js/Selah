import { useGameStore } from '../../stores/gameStore'
import type { Regiao } from '../../types/selah'
import { LanguageSelector } from './LanguageSelector'

const rotulosRegiao: Record<Regiao, string> = {
  hub: 'Vale Central',
  criacao: 'A Criação',
  noe: 'Noé e a Arca',
  jose: 'José, o Sonhador',
}

export function Hud() {
  const regiao = useGameStore((state) => state.regiao)
  const totalPassagens = useGameStore((state) => state.versiculosColetados.length)
  const setPainelAberto = useGameStore((state) => state.setPainelAberto)

  return (
    <header className="hud" aria-label="Informações do jogo">
      <div className="hud__cluster">
        <div className="hud__brand">
          <strong>Selah</strong>
          <span className="hud__region">{rotulosRegiao[regiao]}</span>
        </div>
        <div className="hud__stat" aria-label={`${totalPassagens} passagens coletadas`}>
          <span aria-hidden="true">✦</span>
          <span>
            {totalPassagens} {totalPassagens === 1 ? 'passagem' : 'passagens'}
          </span>
        </div>
      </div>

      <nav className="hud__actions overlay-interactive" aria-label="Ações do jogo">
        <LanguageSelector />
        <button
          className="icon-button"
          type="button"
          aria-label="Abrir diário"
          onClick={() => setPainelAberto('diario')}
        >
          <span aria-hidden="true">▤</span>
          <span className="icon-button__label">Diário</span>
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Abrir métricas"
          onClick={() => setPainelAberto('metricas')}
        >
          <span aria-hidden="true">◫</span>
          <span className="icon-button__label">Métricas</span>
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Abrir configurações"
          onClick={() => setPainelAberto('configuracoes')}
        >
          <span aria-hidden="true">⚙</span>
          <span className="icon-button__label">Responsáveis</span>
        </button>
      </nav>
    </header>
  )
}
