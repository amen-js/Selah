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
        marcosMomentoAtualConcluidos: [],
      }),
    ).toEqual(criarEstadoProgressaoNoe())
  })

  it('mantém o maior prefixo e somente marcos do momento atual', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: [
        'chamado-canteiro',
        'coleta-vedacao',
        'fora-da-rota',
        'estoque-mantimentos',
      ],
      marcosMomentoAtualConcluidos: [
        'acao:noe.estoque.organizado',
        'acao:noe.familias.guiadas',
        'selah:genesis-6-14',
        'acao:noe.estoque.organizado',
      ],
    })

    expect(reconstruido.momentosConcluidos).toEqual([
      'chamado-canteiro',
      'coleta-vedacao',
    ])
    expect(reconstruido.momentoAtualId).toBe('estoque-mantimentos')
    expect(reconstruido.marcosMomentoAtualConcluidos).toEqual([
      { tipo: 'acao-concluida', acaoId: 'noe.estoque.organizado' },
    ])
  })

  it('serializa somente o progresso parcial do momento ativo', () => {
    const depoisDoChamado = processarEventoProgressaoNoe(
      criarEstadoProgressaoNoe(),
      { tipo: 'acao-concluida', acaoId: 'noe.chamado.confirmado' },
    )
    const parcial = processarEventoProgressaoNoe(depoisDoChamado, {
      tipo: 'acao-concluida',
      acaoId: 'noe.madeira.coletada',
    })

    expect(criarCheckpointProgressaoNoe(parcial)).toEqual({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: ['chamado-canteiro'],
      marcosMomentoAtualConcluidos: ['acao:noe.madeira.coletada'],
    })
  })

  it('restaura também o progresso parcial do primeiro momento', () => {
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: [],
      marcosMomentoAtualConcluidos: ['acao:noe.chamado.confirmado'],
    })

    expect(reconstruido).toMatchObject({
      momentoAtualId: 'chamado-canteiro',
      momentosConcluidos: [],
      marcosMomentoAtualConcluidos: [
        { tipo: 'acao-concluida', acaoId: 'noe.chamado.confirmado' },
      ],
    })
  })

  it('reconstrói o final canônico sem progresso parcial', () => {
    const final = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: momentosNoe.map(({ id }) => id),
      marcosMomentoAtualConcluidos: ['acao:noe.arco-iris.contemplado'],
    })

    expect(final.concluida).toBe(true)
    expect(final.marcosMomentoAtualConcluidos).toEqual([])
  })
})
