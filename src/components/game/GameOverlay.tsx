import { useCreationNarration } from '../../hooks/useCreationNarration'
import { useTranslation } from '../../i18n'
import { selahGateway, type SelahGateway } from '../../services/selahGateway'
import { ttsController, type TtsController } from '../../services/tts'
import { useGameStore } from '../../stores/gameStore'
import { CreationGuide } from './CreationGuide'
import type { SnapshotProgressaoCriacao } from './creation/progression'
import { DialogBox } from './DialogBox'
import { Hud } from './Hud'
import { Journal } from './Journal'
import { LocalDashboard } from './LocalDashboard'
import { ParentalPause } from './ParentalPause'
import { ParentSettings } from './ParentSettings'
import { SelahOverlay } from './SelahOverlay'

interface GameOverlayProps {
  gateway?: SelahGateway
  tts?: TtsController
  appVersion?: string
  progressaoCriacao?: SnapshotProgressaoCriacao
  exploracaoAtiva?: boolean
  inatividadeCriacao?: boolean
  dialogo?: {
    personagem: string
    mensagem: string
  }
}

export function GameOverlay({
  gateway = selahGateway,
  tts = ttsController,
  appVersion,
  progressaoCriacao,
  exploracaoAtiva = false,
  inatividadeCriacao = false,
  dialogo,
}: GameOverlayProps) {
  const { t } = useTranslation()
  const selahAtivo = useGameStore((state) => state.selahAtivo)
  const pausaParentalAtiva = useGameStore((state) => state.pausaParentalAtiva)
  const dialogoAberto = useGameStore((state) => state.dialogoAberto)
  const painelAberto = useGameStore((state) => state.painelAberto)
  const guiaAtiva = Boolean(
    progressaoCriacao &&
      exploracaoAtiva &&
      !pausaParentalAtiva &&
      !selahAtivo &&
      !dialogoAberto &&
      painelAberto === null,
  )
  const { linha } = useCreationNarration({
    snapshot: progressaoCriacao,
    inatividade: inatividadeCriacao,
    ativo: guiaAtiva,
    tts,
  })
  const dialogoAtual = dialogo ?? {
    personagem: 'Lumi',
    mensagem: t('dialog.default.message'),
  }

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
      <Hud snapshot={progressaoCriacao} />
      {progressaoCriacao && guiaAtiva && (
        <CreationGuide
          snapshot={progressaoCriacao}
          exploracaoAtiva={guiaAtiva}
          linha={linha}
        />
      )}
      {dialogoAberto && <DialogBox {...dialogoAtual} />}
      {painelAberto === 'diario' && <Journal />}
      {painelAberto === 'configuracoes' && <ParentSettings />}
      {painelAberto === 'metricas' && <LocalDashboard />}
    </div>
  )
}
