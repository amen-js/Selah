import { useCallback, useEffect, useRef, useState } from 'react'

import {
  buscarNarracaoCriacao,
  type FaseNarracaoCriacao,
  type NarracaoCriacaoId,
} from '../content/creationNarrations'
import type { SnapshotProgressaoCriacao } from '../components/game/creation/progression'
import { traduzirJornadaCriacao } from '../components/game/creationJourneyUi'
import type { TtsController, TtsEstado } from '../services/tts'
import { useGameStore } from '../stores/gameStore'
import type { Idioma } from '../types/selah'

const TEMPO_LINHA_SILENCIOSA_MS = 4_000
const ESTADOS_TERMINAIS = new Set<TtsEstado>(['idle', 'error'])

export interface LinhaGuiaCriacao {
  fase: 'objetivo' | FaseNarracaoCriacao
  texto: string
  narracaoId?: NarracaoCriacaoId
}

interface UseCreationNarrationOptions {
  snapshot?: SnapshotProgressaoCriacao
  inatividade: boolean
  ativo: boolean
  tts: TtsController
}

const criarObjetivo = (
  snapshot: SnapshotProgressaoCriacao | undefined,
  idioma: Idioma,
): LinhaGuiaCriacao | undefined =>
  snapshot
    ? {
        fase: 'objetivo',
        texto: traduzirJornadaCriacao(snapshot.momento.id, idioma).objetivo,
      }
    : undefined

const criarLinha = (
  narracaoId: NarracaoCriacaoId,
  idioma: Idioma,
): LinhaGuiaCriacao | undefined => {
  const narracao = buscarNarracaoCriacao(narracaoId, idioma)
  return narracao
    ? {
        fase: narracao.fase,
        texto: narracao.texto,
        narracaoId: narracao.narracaoId,
      }
    : undefined
}

const idNarracao = (
  momentoId: SnapshotProgressaoCriacao['momento']['id'],
  fase: FaseNarracaoCriacao,
): NarracaoCriacaoId => `criacao.${momentoId}.${fase}`

export function useCreationNarration({
  snapshot,
  inatividade,
  ativo,
  tts,
}: UseCreationNarrationOptions): { linha: LinhaGuiaCriacao | undefined } {
  const idioma = useGameStore((state) => state.idioma)
  const faixaEtaria = useGameStore((state) => state.faixaEtaria)
  const ttsAtivo = useGameStore((state) => state.ttsAtivo)
  const narracaoAutomatica =
    tts.suportado && (faixaEtaria === 'crianca' || ttsAtivo)

  const snapshotRef = useRef(snapshot)
  const idiomaRef = useRef(idioma)
  const idiomaAnteriorRef = useRef(idioma)
  const filaRef = useRef<NarracaoCriacaoId[]>([])
  const geracaoRef = useRef(0)
  const momentoAnteriorRef = useRef(snapshot?.momento.id)
  const concluidaAnteriorRef = useRef(snapshot?.estado.concluida ?? false)
  const ativoAnteriorRef = useRef(ativo)
  const inatividadeAnteriorRef = useRef(inatividade)
  const apoioConsumidoRef = useRef(false)

  const [linha, setLinha] = useState<LinhaGuiaCriacao | undefined>(() => {
    if (!ativo || !snapshot) return criarObjetivo(snapshot, idioma)
    return criarLinha(idNarracao(snapshot.momento.id, 'inicial'), idioma)
  })

  const mostrarObjetivo = useCallback(() => {
    filaRef.current = []
    setLinha(criarObjetivo(snapshotRef.current, idiomaRef.current))
  }, [])

  const iniciarSequencia = useCallback(
    (ids: NarracaoCriacaoId[]) => {
      geracaoRef.current += 1
      tts.cancelar()
      const [primeira, ...restante] = ids
      filaRef.current = restante
      if (!primeira) {
        mostrarObjetivo()
        return
      }
      setLinha(criarLinha(primeira, idiomaRef.current))
    },
    [mostrarObjetivo, tts],
  )

  useEffect(() => {
    const momentoAtual = snapshot?.momento.id
    const momentoAnterior = momentoAnteriorRef.current
    const idiomaMudou = idiomaAnteriorRef.current !== idioma
    const ficouAtivo = ativo && !ativoAnteriorRef.current
    const ficouInativo = !ativo && ativoAnteriorRef.current

    snapshotRef.current = snapshot
    idiomaRef.current = idioma

    if (!ativo || !snapshot) {
      if (ficouInativo || !snapshot) {
        geracaoRef.current += 1
        filaRef.current = []
        tts.cancelar()
      }
      // The visible line is the hook's state-machine output, synchronized here
      // when an external overlay deactivates the guide.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLinha(criarObjetivo(snapshot, idioma))
      momentoAnteriorRef.current = momentoAtual
      concluidaAnteriorRef.current = snapshot?.estado.concluida ?? false
      ativoAnteriorRef.current = ativo
      inatividadeAnteriorRef.current = inatividade
      idiomaAnteriorRef.current = idioma
      apoioConsumidoRef.current = false
      return
    }

    const momentoAtivo = snapshot.momento.id

    if (idiomaMudou) {
      const atualId = linha?.narracaoId
      const ids = atualId ? [atualId, ...filaRef.current] : []
      if (ids.length > 0) iniciarSequencia(ids)
      else setLinha(criarObjetivo(snapshot, idioma))
    } else if (ficouAtivo || momentoAnterior === undefined) {
      apoioConsumidoRef.current = false
      iniciarSequencia([idNarracao(momentoAtivo, 'inicial')])
    } else if (momentoAnterior !== momentoAtual) {
      apoioConsumidoRef.current = false
      iniciarSequencia([
        idNarracao(momentoAnterior, 'transicao'),
        idNarracao(momentoAtivo, 'inicial'),
      ])
    } else if (
      snapshot.estado.concluida &&
      !concluidaAnteriorRef.current
    ) {
      iniciarSequencia([idNarracao(momentoAtivo, 'transicao')])
    } else if (inatividade && !inatividadeAnteriorRef.current) {
      if (!apoioConsumidoRef.current) {
        apoioConsumidoRef.current = true
        const apoioId = idNarracao(momentoAtivo, 'apoio')
        if (linha?.narracaoId) filaRef.current.push(apoioId)
        else iniciarSequencia([apoioId])
      }
    } else if (!inatividade && inatividadeAnteriorRef.current) {
      apoioConsumidoRef.current = false
    }

    momentoAnteriorRef.current = momentoAtual
    concluidaAnteriorRef.current = snapshot.estado.concluida
    ativoAnteriorRef.current = ativo
    inatividadeAnteriorRef.current = inatividade
    idiomaAnteriorRef.current = idioma
  }, [
    ativo,
    idioma,
    inatividade,
    iniciarSequencia,
    linha?.narracaoId,
    snapshot,
    tts,
  ])

  useEffect(() => {
    if (!ativo || !snapshot || !linha?.narracaoId) return

    const geracao = ++geracaoRef.current
    let timer: ReturnType<typeof setTimeout> | undefined
    let desassinar: (() => void) | undefined
    let finalizada = false

    const avancar = () => {
      if (finalizada || geracao !== geracaoRef.current) return
      finalizada = true
      desassinar?.()
      desassinar = undefined
      const proxima = filaRef.current.shift()
      if (proxima) setLinha(criarLinha(proxima, idiomaRef.current))
      else setLinha(criarObjetivo(snapshotRef.current, idiomaRef.current))
    }

    if (!narracaoAutomatica) {
      timer = setTimeout(avancar, TEMPO_LINHA_SILENCIOSA_MS)
    } else {
      timer = setTimeout(() => {
        const narracao = buscarNarracaoCriacao(linha.narracaoId!, idiomaRef.current)
        if (!narracao) {
          avancar()
          return
        }

        void tts
          .narrar({
            narracaoId: narracao.narracaoId,
            idioma: narracao.idioma,
            textoFallback: narracao.texto,
          })
          .then(() => {
            if (finalizada || geracao !== geracaoRef.current) return
            const observar = (estado: TtsEstado) => {
              if (ESTADOS_TERMINAIS.has(estado)) avancar()
            }
            desassinar = tts.assinar(observar)
            observar(tts.estado())
          })
      }, 0)
    }

    return () => {
      finalizada = true
      if (timer !== undefined) clearTimeout(timer)
      desassinar?.()
      if (geracao === geracaoRef.current) {
        geracaoRef.current += 1
        tts.cancelar()
      }
    }
  }, [ativo, linha?.narracaoId, linha?.texto, narracaoAutomatica, snapshot, tts])

  return { linha }
}
