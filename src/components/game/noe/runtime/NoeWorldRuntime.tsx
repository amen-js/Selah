import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react'
import type { ColetavelMapa } from '../../../../mapas/types'
import type { PortalMapa } from '../../portals'
import { PortaisRegiao } from '../../portals'
import { ColetaveisRegiao } from '../../region'
import type { PosicaoJogador } from '../../creation/proximidade'
import { useGameStore } from '../../../../stores/gameStore'
import { obterRequisitosPendentesNoe } from '../progression'
import {
  AbrigoTempestadeNoe,
  AmbienciaSonoraNoe,
  AtmosferaNoe,
  CampoAnimaisNoe,
  CanteiroNoe,
  type CandidatoAbrigoTempestadeNoe,
  type CandidatoCampoAnimaisNoe,
  type CandidatoHabitatNoe,
  type CandidatoNovaTerraNoe,
  type CandidatoPombaEsperancaNoe,
  type CandidatoTarefaNoe as CandidatoTarefaCanteiroNoe,
  HabitatsArcaNoe,
  MantimentosArcaNoe,
  type CandidatoMantimentoNoe,
  NovaTerraNoe,
  PombaEsperancaNoe,
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
  const [mantimentoProximo, setMantimentoProximo] =
    useState<CandidatoMantimentoNoe | null>(null)
  const [grupoAnimalProximo, setGrupoAnimalProximo] =
    useState<CandidatoCampoAnimaisNoe | null>(null)
  const [habitatProximo, setHabitatProximo] =
    useState<CandidatoHabitatNoe | null>(null)
  const [abrigoProximo, setAbrigoProximo] =
    useState<CandidatoAbrigoTempestadeNoe | null>(null)
  const [pombaProxima, setPombaProxima] =
    useState<CandidatoPombaEsperancaNoe | null>(null)
  const [novaTerraProxima, setNovaTerraProxima] =
    useState<CandidatoNovaTerraNoe | null>(null)
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

    if (mantimentoProximo) {
      proximos.push({
        tipo: 'tarefa',
        id: mantimentoProximo.id,
        acaoId: mantimentoProximo.acaoId,
        unidadeId: mantimentoProximo.unidadeId,
        distancia: 0,
        acionar: mantimentoProximo.acionar,
      })
    }

    if (grupoAnimalProximo) {
      proximos.push({
        tipo: 'tarefa',
        id: grupoAnimalProximo.id,
        acaoId: grupoAnimalProximo.acaoId,
        unidadeId: grupoAnimalProximo.unidadeId,
        distancia: grupoAnimalProximo.distancia,
        acionar: grupoAnimalProximo.acionar,
      })
    }

    if (habitatProximo) {
      proximos.push({
        tipo: 'tarefa',
        id: habitatProximo.id,
        acaoId: habitatProximo.acaoId,
        unidadeId: habitatProximo.unidadeId,
        distancia: habitatProximo.distancia,
        acionar: habitatProximo.acionar,
      })
    }

    if (abrigoProximo) {
      proximos.push({
        tipo: 'tarefa',
        id: abrigoProximo.id,
        acaoId: abrigoProximo.acaoId,
        unidadeId: abrigoProximo.unidadeId,
        distancia: abrigoProximo.distancia,
        acionar: abrigoProximo.acionar,
      })
    }

    if (pombaProxima) {
      proximos.push({
        tipo: 'tarefa',
        id: pombaProxima.id,
        acaoId: pombaProxima.acaoId,
        unidadeId: pombaProxima.unidadeId,
        distancia: pombaProxima.distancia,
        acionar: pombaProxima.acionar,
      })
    }

    if (novaTerraProxima) {
      proximos.push({
        tipo: 'tarefa',
        id: novaTerraProxima.id,
        acaoId: novaTerraProxima.acaoId,
        unidadeId: novaTerraProxima.unidadeId,
        distancia: novaTerraProxima.distancia,
        acionar: novaTerraProxima.acionar,
      })
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
    abrigoProximo,
    coletavelProximo,
    emitir,
    grupoAnimalProximo,
    habitatProximo,
    mantimentoProximo,
    novaTerraProxima,
    onPortalAcionado,
    onDialogoSolicitado,
    onVedacaoSolicitada,
    portalAcionavel,
    pombaProxima,
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

  const concluirUnidade = useCallback(
    (acaoId: CandidatoTarefaNoe['acaoId'], unidadeId: string) => {
      emitir({ tipo: 'unidade-acao-concluida', acaoId, unidadeId })
    },
    [emitir],
  )

  return (
    <>
      <AtmosferaNoe estado={estado} reducedMotion={reducedMotion} />
      <AmbienciaSonoraNoe estado={estado} enabled={enabled} />
      <CanteiroNoe
        momentoAtualId={estado.momentoAtualId}
        progressoMomentoAtual={estado.progressoMomentoAtual}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={enabled}
        onCandidatoChange={setTarefaProxima}
      />
      <MantimentosArcaNoe
        momentoAtualId={estado.momentoAtualId}
        progressoMomentoAtual={estado.progressoMomentoAtual}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={enabled}
        onCandidatoChange={setMantimentoProximo}
        onConcluirUnidade={concluirUnidade}
      />
      <CampoAnimaisNoe
        momentoAtualId={estado.momentoAtualId}
        progressoMomentoAtual={estado.progressoMomentoAtual}
        playerRef={posicaoJogadorRef}
        enabled={enabled}
        onCandidatoChange={setGrupoAnimalProximo}
        onConcluirUnidade={concluirUnidade}
      />
      <HabitatsArcaNoe
        momentoAtualId={estado.momentoAtualId}
        progressoMomentoAtual={estado.progressoMomentoAtual}
        playerRef={posicaoJogadorRef}
        enabled={enabled}
        onCandidatoChange={setHabitatProximo}
        onConcluirUnidade={concluirUnidade}
      />
      <AbrigoTempestadeNoe
        estado={estado}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={enabled}
        reducedMotion={reducedMotion}
        onCandidatoChange={setAbrigoProximo}
        onConcluirUnidade={concluirUnidade}
      />
      <PombaEsperancaNoe
        estado={estado}
        playerRef={posicaoJogadorRef}
        enabled={enabled}
        reducedMotion={reducedMotion}
        onCandidatoChange={setPombaProxima}
        onConcluirUnidade={concluirUnidade}
      />
      <NovaTerraNoe
        estado={estado}
        playerRef={posicaoJogadorRef}
        enabled={enabled}
        reducedMotion={reducedMotion}
        onCandidatoChange={setNovaTerraProxima}
        onConcluirUnidade={concluirUnidade}
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
