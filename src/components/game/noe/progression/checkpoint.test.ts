import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'
import {
  criarCheckpointProgressaoNoe,
  reconstruirProgressaoNoe,
  VERSAO_CHECKPOINT_NOE,
} from './checkpoint'
import {
  criarEstadoProgressaoNoe,
  processarEventoProgressaoNoe,
} from './estado'

describe('checkpoint da jornada de Noé', () => {
  it('rejeita checkpoints ausentes ou de outra versão', () => {
    expect(reconstruirProgressaoNoe(undefined)).toEqual(
      criarEstadoProgressaoNoe(),
    )
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
          unidadesConcluidas: [
            'fenda-casco-1',
            'fenda-casco-2',
            'fenda-casco-3',
          ],
        },
      ],
    })

    expect(reconstruido.momentoAtualId).toBe('coleta-vedacao')
    expect(reconstruido.momentosConcluidos).toEqual(['chamado-canteiro'])
    expect(reconstruido.progressoMomentoAtual).toHaveLength(3)
  })

  it.each([
    {
      momentoId: 'estoque-mantimentos',
      acaoId: 'noe.estoque.organizado',
      unidadeId: 'estoque-principal',
      momentoEsperado: 'conducao-animais',
      acoesRestauradas: [],
    },
    {
      momentoId: 'conducao-animais',
      acaoId: 'noe.familias.guiadas',
      unidadeId: 'familias-do-campo',
      momentoEsperado: 'acomodacao-animais',
      acoesRestauradas: [],
    },
    {
      momentoId: 'acomodacao-animais',
      acaoId: 'noe.habitats.organizados',
      unidadeId: 'habitats-da-arca',
      momentoEsperado: 'acomodacao-animais',
      acoesRestauradas: [
        'noe.habitat.grandes-animais-preparado',
        'noe.habitat.pequenos-mamiferos-preparado',
        'noe.habitat.aves-preparado',
        'noe.habitat.familia-noe-preparado',
      ],
    },
    {
      momentoId: 'fechamento-porta',
      acaoId: 'noe.porta.atravessada',
      unidadeId: 'entrada-segura',
      momentoEsperado: 'fechamento-porta',
      acoesRestauradas: [
        'noe.abrigo.chamado-ouvido',
        'noe.abrigo.entrada-concluida',
        'noe.porta.fechada',
      ],
    },
    {
      momentoId: 'refugio-tempestade',
      acaoId: 'noe.filhotes.cuidados',
      unidadeId: 'cuidado-dos-filhotes',
      momentoEsperado: 'refugio-tempestade',
      acoesRestauradas: [
        'noe.cuidado.filhotes-aves',
        'noe.cuidado.filhotes-herbivoros',
        'noe.cuidado.filhotes-mamiferos',
      ],
    },
    {
      momentoId: 'retorno-pomba',
      acaoId: 'noe.pomba.retornou',
      unidadeId: 'retorno-com-oliveira',
      momentoEsperado: 'nova-terra-arco-iris',
      acoesRestauradas: [],
    },
  ] as const)(
    'migra checkpoint v1 detalhado de $momentoId sem perder progresso',
    ({ momentoId, acaoId, unidadeId, momentoEsperado, acoesRestauradas }) => {
      const indiceMomento = momentosNoe.findIndex(({ id }) => id === momentoId)
      const reconstruido = reconstruirProgressaoNoe({
        versao: VERSAO_CHECKPOINT_NOE,
        momentosConcluidos: momentosNoe
          .slice(0, indiceMomento)
          .map(({ id }) => id),
        progressoMomentoAtual: [
          {
            acaoId,
            unidadesConcluidas: [unidadeId],
          },
        ],
      })

      expect(reconstruido.momentoAtualId).toBe(momentoEsperado)
      expect(
        reconstruido.progressoMomentoAtual.map(({ acaoId: id }) => id),
      ).toEqual(acoesRestauradas)
      expect(
        reconstruirProgressaoNoe(criarCheckpointProgressaoNoe(reconstruido)),
      ).toEqual(reconstruido)
    },
  )

  it('serializa tarefas paralelas em ordem canônica e permanece idempotente', () => {
    let estado = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: ['chamado-canteiro', 'coleta-vedacao'],
      progressoMomentoAtual: [],
    })
    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.mantimento.frutas-armazenadas',
      unidadeId: 'frutas-despensa-central',
    })
    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.mantimento.feno-armazenado',
      unidadeId: 'feno-estabulos-inferiores',
    })

    const checkpoint = criarCheckpointProgressaoNoe(estado)
    expect(checkpoint.progressoMomentoAtual).toEqual([
      {
        acaoId: 'noe.mantimento.feno-armazenado',
        unidadesConcluidas: ['feno-estabulos-inferiores'],
      },
      {
        acaoId: 'noe.mantimento.frutas-armazenadas',
        unidadesConcluidas: ['frutas-despensa-central'],
      },
    ])

    const restaurado = reconstruirProgressaoNoe(checkpoint)
    expect(criarCheckpointProgressaoNoe(restaurado)).toEqual(checkpoint)
  })

  it('migra M9 v1 completo para aguardar somente o Selah final', () => {
    const indiceMomento = momentosNoe.findIndex(
      ({ id }) => id === 'nova-terra-arco-iris',
    )
    const reconstruido = reconstruirProgressaoNoe({
      versao: VERSAO_CHECKPOINT_NOE,
      momentosConcluidos: momentosNoe
        .slice(0, indiceMomento)
        .map(({ id }) => id),
      progressoMomentoAtual: [
        {
          acaoId: 'noe.animais.desembarcados',
          unidadesConcluidas: ['desembarque-seguro'],
        },
        {
          acaoId: 'noe.arco-iris.contemplado',
          unidadesConcluidas: ['contemplacao-da-alianca'],
        },
      ],
    })

    expect(reconstruido.momentoAtualId).toBe('nova-terra-arco-iris')
    expect(
      reconstruido.progressoMomentoAtual.map(({ acaoId }) => acaoId),
    ).toEqual([
      'noe.desembarque.aves',
      'noe.desembarque.herbivoros',
      'noe.desembarque.mamiferos',
      'noe.altar.construido',
      'noe.arco-iris.contemplado',
    ])
    expect(reconstruido.concluida).toBe(false)
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
