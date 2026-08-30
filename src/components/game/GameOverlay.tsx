import { selahGateway, type SelahGateway } from '../../services/selahGateway'
import { useGameStore } from '../../stores/gameStore'
import { DialogBox } from './DialogBox'
import { Hud } from './Hud'
import { Journal } from './Journal'
import { LocalDashboard } from './LocalDashboard'
import { ParentalPause } from './ParentalPause'
import { ParentSettings } from './ParentSettings'
import { SelahOverlay, type TtsController } from './SelahOverlay'

interface GameOverlayProps {
  gateway?: SelahGateway
  tts?: TtsController
  appVersion?: string
  dialogo?: {
    personagem: string
    mensagem: string
  }
}

const dialogoPadrao = {
  personagem: 'Lumi',
  mensagem: 'Sou um personagem virtual. Posso ajudar você a observar esta parte da jornada.',
}

export function GameOverlay({
  gateway = selahGateway,
  tts,
  appVersion,
  dialogo = dialogoPadrao,
}: GameOverlayProps) {
  const selahAtivo = useGameStore((state) => state.selahAtivo)
  const pausaParentalAtiva = useGameStore((state) => state.pausaParentalAtiva)
  const dialogoAberto = useGameStore((state) => state.dialogoAberto)
  const painelAberto = useGameStore((state) => state.painelAberto)

  if (pausaParentalAtiva) {
    return (
      <div className="game-overlay">
        <ParentalPause />
      </div>
    )
  }

  if (selahAtivo) {
    return (
      <div className="game-overlay">
        <SelahOverlay gateway={gateway} tts={tts} appVersion={appVersion} />
      </div>
    )
  }

  return (
    <div className="game-overlay">
      <Hud />
      {dialogoAberto && <DialogBox {...dialogo} />}
      {painelAberto === 'diario' && <Journal />}
      {painelAberto === 'configuracoes' && <ParentSettings />}
      {painelAberto === 'metricas' && <LocalDashboard />}
    </div>
  )
}
