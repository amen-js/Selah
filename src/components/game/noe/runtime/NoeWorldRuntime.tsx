import { useEffect, useMemo, useState, type RefObject } from 'react'
import type { ColetavelMapa } from '../../../../mapas/types'
import type { PortalMapa } from '../../portals'
import { PortaisRegiao } from '../../portals'
import { ColetaveisRegiao } from '../../region'
import type { PosicaoJogador } from '../../creation/proximidade'
import { useGameStore } from '../../../../stores/gameStore'
import { obterRequisitosPendentesNoe } from '../progression'
import {
  CanteiroNoe,
  type CandidatoTarefaNoe as CandidatoTarefaCanteiroNoe,
} from '../world'
import {
  obterRequisitoSelahFinalNoe,
  selecionarColetaveisSelahFinalNoe,
  selecionarCandidatoInteracaoNoe,
  type CandidatoInteracaoNoe,
  type CandidatoPortalNoe,
  type CandidatoTarefaNoe,
} from './interacao'
import { InteracaoNoeRuntime } from './InteracaoNoeRuntime'
import type { TipoInteracaoNoe } from './NoeInteractionPrompt'
import { useProgressaoNoeRuntime } from './ProgressaoNoeRuntime'
import type { EstadoProgressaoNoe } from '../progression'

export interface SolicitacaoVedacaoNoe {
  unidadeId: string
  concluir: () => void
}

export interface SolicitacaoDialogoNoe {
  concluir: () => void
}

export interface NoeWorldRuntimeProps {
  coletaveis: readonly ColetavelMapa[]
  portais: readonly PortalMapa[]
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  enabled: boolean
  reducedMotion: boolean
  onPortalProximo: (portal: PortalMapa | null) => void
  onPortalAcionado: (portal: PortalMapa) => void
  onInteracaoProxima: (tipo: TipoInteracaoNoe | null) => void
  onProgressaoChange?: (estado: EstadoProgressaoNoe) => void
  onVedacaoSolicitada?: (solicitacao: SolicitacaoVedacaoNoe) => void
  onDialogoSolicitado?: (solicitacao: SolicitacaoDialogoNoe) => void
}

/**
 * Connects Noah's scene detectors to one progression state and one keyboard
 * arbiter. Other regions keep their existing interaction behavior untouched.
 */
export function NoeWorldRuntime({
  coletaveis,
  portais,
  posicaoJogadorRef,
  enabled,
  reducedMotion,
  onPortalProximo,
  onPortalAcionado,
  onInteracaoProxima,
  onProgressaoChange,
  onVedacaoSolicitada,
  onDialogoSolicitado,
}: NoeWorldRuntimeProps) {
  const { estado, emitir } = useProgressaoNoeRuntime(enabled)
  const selahsConcluidos = useGameStore((state) => state.selahsConcluidos)
  const [tarefaProxima, setTarefaProxima] =
    useState<CandidatoTarefaCanteiroNoe | null>(null)
  const [coletavelProximo, setColetavelProximo] =
    useState<ColetavelMapa | null>(null)
  const [portalAcionavel, setPortalAcionavel] = useState<PortalMapa | null>(null)
  const requisitosPendentes = useMemo(
    () => obterRequisitosPendentesNoe(estado),
    [estado],
  )
  const requisitoSelah = useMemo(
    () => obterRequisitoSelahFinalNoe(requisitosPendentes),
    [requisitosPendentes],
  )
  const coletaveisDisponiveis = useMemo(
    () =>
      selecionarColetaveisSelahFinalNoe(
        coletaveis,
        requisitosPendentes,
        selahsConcluidos,
      ),
    [coletaveis, requisitosPendentes, selahsConcluidos],
  )

  const candidatos = useMemo(() => {
    const proximos: CandidatoInteracaoNoe[] = []

    if (tarefaProxima) {
      const candidato: CandidatoTarefaNoe = {
        tipo: 'tarefa',
        id: tarefaProxima.id,
        acaoId: tarefaProxima.acaoId,
        unidadeId: tarefaProxima.unidadeId,
        // Each detector already publishes only its nearest candidate.
        distancia: 0,
        acionar: () => {
          const evento = {
            tipo: 'unidade-acao-concluida',
            acaoId: tarefaProxima.acaoId,
            unidadeId: tarefaProxima.unidadeId,
          } as const

          if (
            tarefaProxima.acaoId === 'noe.betume.aplicado' &&
            onVedacaoSolicitada
          ) {
            onVedacaoSolicitada({
              unidadeId: tarefaProxima.unidadeId,
              concluir: () => emitir(evento),
            })
            return
          }

          if (
            tarefaProxima.acaoId === 'noe.chamado.confirmado' &&
            onDialogoSolicitado
          ) {
            onDialogoSolicitado({ concluir: () => emitir(evento) })
            return
          }

          emitir(evento)
        },
      }
      proximos.push(candidato)
    }

    if (
      coletavelProximo &&
      requisitoSelah &&
      coletavelProximo.passagemId === requisitoSelah.passagemId &&
      !selahsConcluidos.includes(coletavelProximo.passagemId)
    ) {
      proximos.push({
        tipo: 'selah',
        id: coletavelProximo.id,
        passagemId: coletavelProximo.passagemId,
        distancia: 0,
        acionar: () =>
          useGameStore.getState().abrirSelah({
            historiaId: coletavelProximo.historiaId,
            passagemId: coletavelProximo.passagemId,
          }),
      })
    }

    if (portalAcionavel) {
      const candidato: CandidatoPortalNoe = {
        tipo: 'portal',
        id: portalAcionavel.id,
        distancia: 0,
        acionar: () => onPortalAcionado(portalAcionavel),
      }
      proximos.push(candidato)
    }

    return proximos
  }, [
    coletavelProximo,
    emitir,
    onPortalAcionado,
    onDialogoSolicitado,
    onVedacaoSolicitada,
    portalAcionavel,
    requisitoSelah,
    selahsConcluidos,
    tarefaProxima,
  ])
  const candidatoSelecionado = useMemo(
    () => selecionarCandidatoInteracaoNoe(candidatos),
    [candidatos],
  )
  const tipoInteracao =
    candidatoSelecionado?.tipo === 'tarefa' ||
    candidatoSelecionado?.tipo === 'selah'
      ? candidatoSelecionado.tipo
      : null
  useEffect(() => {
    onInteracaoProxima(tipoInteracao)
  }, [onInteracaoProxima, tipoInteracao])

  useEffect(
    () => () => onInteracaoProxima(null),
    [onInteracaoProxima],
  )

  useEffect(() => {
    onProgressaoChange?.(estado)
  }, [estado, onProgressaoChange])

  return (
    <>
      <CanteiroNoe
        momentoAtualId={estado.momentoAtualId}
        progressoMomentoAtual={estado.progressoMomentoAtual}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={enabled}
        onCandidatoChange={setTarefaProxima}
      />
      <ColetaveisRegiao
        coletaveis={coletaveisDisponiveis}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={enabled}
        reducedMotion={reducedMotion}
        confirmacaoExterna
        bloquearPassagensRespondidas={false}
        onColetavelProximo={setColetavelProximo}
      />
      <PortaisRegiao
        portais={portais}
        playerRef={posicaoJogadorRef}
        enabled={enabled}
        reducedMotion={reducedMotion}
        confirmacaoExterna
        onPortalProximo={onPortalProximo}
        onPortalAcionavel={setPortalAcionavel}
      />
      <InteracaoNoeRuntime candidatos={candidatos} enabled={enabled} />
    </>
  )
}
