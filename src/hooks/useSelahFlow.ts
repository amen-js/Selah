import { useEffect, useRef } from 'react'

import type { SelahGateway } from '../services/selahGateway'
import { useGameStore } from '../stores/gameStore'
import type { AlternativaId } from '../types/selah'

interface UseSelahFlowOptions {
  gateway: SelahGateway
  appVersion?: string
}

export function useSelahFlow({
  gateway,
  appVersion = import.meta.env.VITE_APP_VERSION ?? 'dev',
}: UseSelahFlowOptions) {
  const selahAtivo = useGameStore((state) => state.selahAtivo)
  const idioma = useGameStore((state) => state.idioma)
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const iaAtiva = useGameStore((state) => state.iaAtiva)
  const compartilharMetricas = useGameStore((state) => state.compartilharMetricas)
  const carregarVersiculo = useGameStore((state) => state.carregarVersiculo)
  const carregarQuiz = useGameStore((state) => state.carregarQuiz)
  const mostrarQuiz = useGameStore((state) => state.mostrarQuiz)
  const iniciarEnvioResposta = useGameStore((state) => state.iniciarEnvioResposta)
  const registrarResultado = useGameStore((state) => state.registrarResultado)
  const definirErroSelah = useGameStore((state) => state.definirErroSelah)
  const cancelarSelah = useGameStore((state) => state.cancelarSelah)
  const concluirSelah = useGameStore((state) => state.concluirSelah)
  const carregamentoAtual = useRef<string | null>(null)

  useEffect(() => {
    if (!selahAtivo) {
      carregamentoAtual.current = null
      return
    }
    if (selahAtivo.fase !== 'carregando') return

    const chave = `${selahAtivo.gatilho.historiaId}:${selahAtivo.gatilho.passagemId}`
    if (carregamentoAtual.current === chave) return
    carregamentoAtual.current = chave
    let cancelado = false

    if (compartilharMetricas) {
      void gateway.enviarMetricas(
        [
          {
            tipo: 'selah_iniciado',
            historiaId: selahAtivo.gatilho.historiaId,
            versaoApp: appVersion,
          },
        ],
        true,
      )
    }

    void Promise.all([
      gateway.buscarVersiculo(selahAtivo.gatilho, idioma),
      gateway.gerarQuiz({
        ...selahAtivo.gatilho,
        idioma,
        faixaEtaria,
        dificuldade: faixaEtaria === 'crianca' ? 'facil' : 'medio',
        iaAtiva,
      }),
    ])
      .then(([versiculo, quiz]) => {
        if (cancelado) return
        carregarVersiculo(versiculo)
        carregarQuiz(quiz)
      })
      .catch(() => {
        if (cancelado) return
        definirErroSelah(
          'Não foi possível carregar este Momento Selah. Tente novamente mais tarde.',
        )
      })

    return () => {
      cancelado = true
    }
  }, [
    appVersion,
    carregarQuiz,
    carregarVersiculo,
    compartilharMetricas,
    definirErroSelah,
    faixaEtaria,
    gateway,
    iaAtiva,
    idioma,
    selahAtivo,
  ])

  const responder = async (alternativaId: AlternativaId) => {
    const ativo = useGameStore.getState().selahAtivo
    if (ativo?.fase !== 'quiz' || !ativo.quiz) return

    iniciarEnvioResposta(alternativaId)
    try {
      const avaliacao = await gateway.responderQuiz({ quizId: ativo.quiz.id, alternativaId })
      registrarResultado(avaliacao)

      if (useGameStore.getState().compartilharMetricas) {
        await gateway.enviarMetricas(
          [
            {
              tipo: 'quiz_respondido',
              historiaId: ativo.gatilho.historiaId,
              versaoApp: appVersion,
              acertou: avaliacao.acertou,
            },
          ],
          true,
        )
      }
    } catch {
      definirErroSelah('Não foi possível verificar a resposta. Tente novamente.')
    }
  }

  const concluir = () => {
    const ativo = useGameStore.getState().selahAtivo
    if (ativo?.fase !== 'feedback') return

    concluirSelah()
    if (useGameStore.getState().compartilharMetricas) {
      void gateway.enviarMetricas(
        [
          {
            tipo: 'selah_concluido',
            historiaId: ativo.gatilho.historiaId,
            versaoApp: appVersion,
          },
        ],
        true,
      )
    }
  }

  return {
    selahAtivo,
    mostrarQuiz,
    responder,
    concluir,
    cancelar: cancelarSelah,
  }
}
