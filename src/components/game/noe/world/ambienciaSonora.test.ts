import { describe, expect, it } from 'vitest'
import type {
  EstadoProgressaoNoe,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from '../progression/types'
import {
  projetarAmbienciaSonoraNoe,
  VOLUME_MAXIMO_AMBIENCIA_NOE,
} from './ambienciaSonora'

const ATE_M1 = ['chamado-canteiro'] as const
const ATE_M2 = [...ATE_M1, 'coleta-vedacao'] as const
const ATE_M3 = [...ATE_M2, 'estoque-mantimentos'] as const
const ATE_M4 = [...ATE_M3, 'conducao-animais'] as const
const ATE_M5 = [...ATE_M4, 'acomodacao-animais'] as const
const ATE_M6 = [...ATE_M5, 'fechamento-porta'] as const
const ATE_M7 = [...ATE_M6, 'refugio-tempestade'] as const
const ATE_M8 = [...ATE_M7, 'retorno-pomba'] as const

function estadoNoMomento(
  momentoAtualId: MomentoNoeId,
  momentosConcluidos: readonly MomentoNoeId[],
  progressoMomentoAtual: readonly ProgressoAcaoNoe[] = [],
): EstadoProgressaoNoe {
  return {
    momentoAtualId,
    momentosConcluidos,
    progressoMomentoAtual,
    concluida: false,
  }
}

describe('ambiência sonora climática de Noé', () => {
  it.each([
    ['calmo', estadoNoMomento('chamado-canteiro', []), 0],
    ['nuvens-leves', estadoNoMomento('estoque-mantimentos', ATE_M2), 0.01],
    ['vento-suave', estadoNoMomento('acomodacao-animais', ATE_M4), 0.019],
    ['abrigo-pronto', estadoNoMomento('fechamento-porta', ATE_M5), 0.028],
  ] as const)(
    'aumenta o vento gradualmente na fase %s sem antecipar a chuva',
    (fase, estado, volumeVento) => {
      expect(projetarAmbienciaSonoraNoe(estado, true)).toMatchObject({
        fase,
        volumeVento,
        volumeChuva: 0,
        trovaoAtivo: false,
      })
    },
  )

  it('só introduz chuva suave depois da entrada e da porta segura', () => {
    const antesDaPorta = estadoNoMomento('fechamento-porta', ATE_M5, [
      {
        acaoId: 'noe.abrigo.chamado-ouvido',
        unidadesConcluidas: ['chamado-final-noe'],
      },
      {
        acaoId: 'noe.abrigo.entrada-concluida',
        unidadesConcluidas: ['entrada-segura-na-arca'],
      },
    ])
    const depoisDaPorta = estadoNoMomento('fechamento-porta', ATE_M5, [
      ...antesDaPorta.progressoMomentoAtual,
      {
        acaoId: 'noe.porta.fechada',
        unidadesConcluidas: ['porta-da-arca-fechada'],
      },
    ])

    expect(projetarAmbienciaSonoraNoe(antesDaPorta, true).volumeChuva).toBe(0)
    expect(projetarAmbienciaSonoraNoe(depoisDaPorta, true)).toMatchObject({
      fase: 'chuva-segura',
      volumeVento: 0.016,
      volumeChuva: 0.034,
      trovaoAtivo: false,
    })
  })

  it('mantém a textura exterior em M7 e encerra vento e chuva em M8/M9', () => {
    const m7 = projetarAmbienciaSonoraNoe(
      estadoNoMomento('refugio-tempestade', ATE_M6),
      true,
    )
    const m8 = projetarAmbienciaSonoraNoe(
      estadoNoMomento('retorno-pomba', ATE_M7),
      true,
    )
    const m9 = projetarAmbienciaSonoraNoe(
      estadoNoMomento('nova-terra-arco-iris', ATE_M8),
      true,
    )

    expect(m7).toMatchObject({ fase: 'chuva-segura', ativa: true })
    expect(m8).toMatchObject({
      fase: 'luz-retornando',
      volumeVento: 0,
      volumeChuva: 0,
      ativa: false,
    })
    expect(m9).toMatchObject({
      fase: 'nova-terra',
      volumeVento: 0,
      volumeChuva: 0,
      ativa: false,
    })
  })

  it('fica rapidamente em silêncio quando o runtime é desabilitado', () => {
    expect(
      projetarAmbienciaSonoraNoe(
        estadoNoMomento('refugio-tempestade', ATE_M6),
        false,
      ),
    ).toMatchObject({
      volumeVento: 0,
      volumeChuva: 0,
      duracaoFadeMs: 120,
      ativa: false,
      trovaoAtivo: false,
    })
  })

  it('mantém todas as misturas abaixo do teto de volume infantil', () => {
    const estados = [
      estadoNoMomento('chamado-canteiro', []),
      estadoNoMomento('estoque-mantimentos', ATE_M2),
      estadoNoMomento('acomodacao-animais', ATE_M4),
      estadoNoMomento('fechamento-porta', ATE_M5),
      estadoNoMomento('refugio-tempestade', ATE_M6),
      estadoNoMomento('retorno-pomba', ATE_M7),
      estadoNoMomento('nova-terra-arco-iris', ATE_M8),
    ]

    for (const estado of estados) {
      const projecao = projetarAmbienciaSonoraNoe(estado, true)
      expect(projecao.volumeVento).toBeLessThanOrEqual(
        VOLUME_MAXIMO_AMBIENCIA_NOE,
      )
      expect(projecao.volumeChuva).toBeLessThanOrEqual(
        VOLUME_MAXIMO_AMBIENCIA_NOE,
      )
      expect(projecao.trovaoAtivo).toBe(false)
    }
  })
})
