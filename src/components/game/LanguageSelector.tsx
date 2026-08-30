import { useGameStore } from '../../stores/gameStore'
import type { Idioma } from '../../types/selah'

const idiomas: Array<{ value: Idioma; label: string }> = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'English' },
  { value: 'es-ES', label: 'Español' },
]

export function LanguageSelector() {
  const idioma = useGameStore((state) => state.idioma)
  const setIdioma = useGameStore((state) => state.setIdioma)

  return (
    <label className="language-selector overlay-interactive">
      <span aria-hidden="true">◎</span>
      <span className="sr-only">Idioma do jogo</span>
      <select
        aria-label="Idioma do jogo"
        value={idioma}
        onChange={(event) => setIdioma(event.target.value as Idioma)}
      >
        {idiomas.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
