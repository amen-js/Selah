import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'
import {
  criarCheckpointProgressaoNoe,
  reconstruirProgressaoNoe,
  VERSAO_CHECKPOINT_NOE,
} from './checkpoint'
import { criarEstadoProgressaoNoe, processarEventoProgressaoNoe } from './estado'

describe('checkpoint da jornada de Noé', () => {
  it('rejeita checkpoints ausentes ou de outra versão', () => {
    expect(reconstruirProgressaoNoe(undefined)).toEqual(criarEstadoProgressaoNoe())
    expect(
      reconstruirProgressaoNoe({
        versao: 0,
        momentosConcluidos: ['chamado-canteiro'],
        progressoMomentoAtual: [],
      }),
    ).toEqual(criarEstadoProgressaoNoe())
  })

  it('mantém o maior prefixo e somente unidades declaradas do momento atual', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: [
        'chamado-canteiro',
        'coleta-vedacao',
        'fora-da-rota',
        'estoque-mantimentos',
      ],
      progressoMomentoAtual: [
        {
          acaoId: 'noe.estoque.organizado',
          unidadesConcluidas: ['desconhecida'],
        },
        {
          acaoId: 'noe.familias.guiadas',
          unidadesConcluidas: ['familias-do-campo'],
        },
      ],
    })

    expect(reconstruido.momentosConcluidos).toEqual([
      'chamado-canteiro',
      'coleta-vedacao',
    ])
    expect(reconstruido.momentoAtualId).toBe('estoque-mantimentos')
    expect(reconstruido.progressoMomentoAtual).toEqual([])
  })

  it('não atravessa uma lacuna não textual no prefixo persistido', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: ['chamado-canteiro', 7, 'coleta-vedacao'],
      progressoMomentoAtual: [],
    })

    expect(reconstruido.momentosConcluidos).toEqual(['chamado-canteiro'])
    expect(reconstruido.momentoAtualId).toBe('coleta-vedacao')
  })

  it('serializa e restaura progresso M2 parcial com IDs idempotentes', () => {
    const depoisDoChamado = processarEventoProgressaoNoe(
      criarEstadoProgressaoNoe(),
      {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.chamado.confirmado',
        unidadeId: 'chamado-noe',
      },
    )
    const parcial = processarEventoProgressaoNoe(depoisDoChamado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.madeira.coletada',
      unidadeId: 'tabua-1',
    })
    const checkpoint = criarCheckpointProgressaoNoe(parcial)

    expect(checkpoint).toEqual({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: ['chamado-canteiro'],
      progressoMomentoAtual: [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesConcluidas: ['tabua-1'],
        },
      ],
    })
    expect(reconstruirProgressaoNoe(checkpoint)).toEqual(parcial)
  })

  it('normaliza um M1 totalmente marcado para M2 em vez de restaurar deadlock', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: [],
      progressoMomentoAtual: [
        {
          acaoId: 'noe.chamado.confirmado',
          unidadesConcluidas: ['chamado-noe'],
        },
      ],
    })

    expect(reconstruido).toEqual({
      momentoAtualId: 'coleta-vedacao',
      momentosConcluidos: ['chamado-canteiro'],
      progressoMomentoAtual: [],
      concluida: false,
    })
  })

  it('deduplica, filtra e limita progresso M2 pela allowlist do catálogo', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: ['chamado-canteiro'],
      progressoMomentoAtual: [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesConcluidas: [
            'tabua-1',
            'tabua-1',
            'inventada',
            'tabua-2',
            'tabua-3',
            'tabua-4',
            'tabua-5',
          ],
        },
        {
          acaoId: 'noe.rampa.reparada',
          unidadesConcluidas: ['rampa-falsa', 'rampa-principal'],
        },
      ],
    })

    expect(reconstruido.progressoMomentoAtual).toEqual([
      {
        acaoId: 'noe.madeira.coletada',
        unidadesConcluidas: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
      },
      {
        acaoId: 'noe.rampa.reparada',
        unidadesConcluidas: ['rampa-principal'],
      },
    ])
  })

  it('preserva M2 com tarefas completas enquanto aguarda o Selah final', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: ['chamado-canteiro'],
      progressoMomentoAtual: [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesConcluidas: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
        },
        {
          acaoId: 'noe.rampa.reparada',
          unidadesConcluidas: ['rampa-principal'],
        },
        {
          acaoId: 'noe.betume.aplicado',
          unidadesConcluidas: ['fenda-casco-1', 'fenda-casco-2', 'fenda-casco-3'],
        },
      ],
    })

    expect(reconstruido.momentoAtualId).toBe('coleta-vedacao')
    expect(reconstruido.momentosConcluidos).toEqual(['chamado-canteiro'])
    expect(reconstruido.progressoMomentoAtual).toHaveLength(3)
  })

  it('reconstrói o final canônico sem progresso parcial', () => {
    const final = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: momentosNoe.map(({ id }) => id),
      progressoMomentoAtual: [
        {
          acaoId: 'noe.arco-iris.contemplado',
          unidadesConcluidas: ['contemplacao-da-alianca'],
        },
      ],
    })

    expect(final.concluida).toBe(true)
    expect(final.progressoMomentoAtual).toEqual([])
  })
})
