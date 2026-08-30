import { useGameStore } from '../../stores/gameStore'

interface DialogBoxProps {
  personagem: string
  mensagem: string
}

export function DialogBox({ personagem, mensagem }: DialogBoxProps) {
  const setDialogoAberto = useGameStore((state) => state.setDialogoAberto)

  return (
    <section className="dialog-box overlay-interactive" aria-label={`Diálogo com ${personagem}`}>
      <div className="dialog-box__speaker">
        <div>
          <strong>{personagem}</strong>
          <p className="eyebrow">Personagem virtual automatizado</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          aria-label="Continuar exploração"
          onClick={() => setDialogoAberto(false)}
        >
          Continuar
        </button>
      </div>
      <p>{mensagem}</p>
    </section>
  )
}
