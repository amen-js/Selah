import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'
import {
  criarEstadoProgressaoNoe,
  obterClimaNoe,
  obterRequisitosPendentesNoe,
  processarEventoProgressaoNoe,
} from './estado'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
  EventoProgressaoNoe,
  MomentoNoeId,
} from './types'

function concluirTarefasMomentoAtual(
  estado: EstadoProgressaoNoe,
): EstadoProgressaoNoe {
  const momento = momentosNoe.find(({ id }) => id === estado.momentoAtualId)
  if (!momento) return estado

  return momento.gatilhoConclusao.tarefas.reduce(
    (estadoTarefa, tarefa) =>
      tarefa.unidadesNecessarias.reduce(
        (atual, unidadeId) =>
          processarEventoProgressaoNoe(atual, {
            tipo: 'unidade-acao-concluida',
            acaoId: tarefa.acaoId,
            unidadeId,
          }),
        estadoTarefa,
      ),
    estado,
  )
}

function concluirMomentoAtual(
  estado: EstadoProgressaoNoe,
): EstadoProgressaoNoe {
  const momento = momentosNoe.find(({ id }) => id === estado.momentoAtualId)
  if (!momento) return estado

  const tarefasConcluidas = concluirTarefasMomentoAtual(estado)
  return momento.gatilhoConclusao.selahFinal
    ? processarEventoProgressaoNoe(tarefasConcluidas, {
        tipo: 'selah-concluido',
        passagemId: momento.gatilhoConclusao.selahFinal,
      })
    : tarefasConcluidas
}

function concluirAte(
  estado: EstadoProgressaoNoe,
  momentoId: EstadoProgressaoNoe['momentoAtualId'],
): EstadoProgressaoNoe {
  let atual = estado
  while (!atual.concluida && atual.momentoAtualId !== momentoId) {
    atual = concluirMomentoAtual(atual)
  }
  return atual
}

describe('estado da jornada de Noé', () => {
  it('ignora unidades desconhecidas e ações de momentos futuros', () => {
    const inicial = criarEstadoProgressaoNoe()
    const futuro: EventoProgressaoNoe = {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.arco-iris.contemplado',
      unidadeId: 'contemplacao-da-alianca',
    }

    expect(processarEventoProgressaoNoe(inicial, futuro)).toBe(inicial)
    expect(
      processarEventoProgressaoNoe(inicial, {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.chamado.confirmado',
        unidadeId: 'inventado',
      }),
    ).toBe(inicial)

    const chamado = concluirMomentoAtual(inicial)
    expect(chamado.momentoAtualId).toBe('coleta-vedacao')
    expect(chamado.momentosConcluidos).toEqual(['chamado-canteiro'])
  })

  it('contabiliza M2 em 4/1/3 e trata a mesma unidade como idempotente', () => {
    const noSegundoMomento = concluirMomentoAtual(criarEstadoProgressaoNoe())
    expect(
      processarEventoProgressaoNoe(noSegundoMomento, {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.rampa.reparada',
        unidadeId: 'rampa-principal',
      }),
    ).toBe(noSegundoMomento)

    const primeiraTabua: EventoProgressaoNoe = {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.madeira.coletada',
      unidadeId: 'tabua-1',
    }
    const comPrimeiraTabua = processarEventoProgressaoNoe(
      noSegundoMomento,
      primeiraTabua,
    )

    expect(processarEventoProgressaoNoe(comPrimeiraTabua, primeiraTabua)).toBe(
      comPrimeiraTabua,
    )
    expect(obterRequisitosPendentesNoe(comPrimeiraTabua)[0]).toMatchObject({
      acaoId: 'noe.madeira.coletada',
      quantidadeConcluida: 1,
      quantidadeNecessaria: 4,
    })

    const aguardandoSelah = concluirTarefasMomentoAtual(comPrimeiraTabua)
    expect(aguardandoSelah.momentoAtualId).toBe('coleta-vedacao')
    expect(obterRequisitosPendentesNoe(aguardandoSelah)).toEqual([
      { tipo: 'selah-final', passagemId: 'genesis-6-14' },
    ])

    const terceiroMomento = processarEventoProgressaoNoe(aguardandoSelah, {
      tipo: 'selah-concluido',
      passagemId: 'genesis-6-14',
    })
    expect(terceiroMomento.momentoAtualId).toBe('estoque-mantimentos')
    expect(terceiroMomento.progressoMomentoAtual).toEqual([])
  })

  it('não deixa estado forjado liberar Selah nem pular a ordem local', () => {
    const segundoMomento = concluirMomentoAtual(criarEstadoProgressaoNoe())
    const corrompido: EstadoProgressaoNoe = {
      ...segundoMomento,
      progressoMomentoAtual: [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesConcluidas: [
            'inventada-1',
            'inventada-2',
            'tabua-1',
            'tabua-1',
          ],
        },
      ],
    }

    expect(
      processarEventoProgressaoNoe(corrompido, {
        tipo: 'selah-concluido',
        passagemId: 'genesis-6-14',
      }),
    ).toBe(corrompido)
    expect(
      processarEventoProgressaoNoe(corrompido, {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.betume.aplicado',
        unidadeId: 'fenda-casco-1',
      }),
    ).toBe(corrompido)
  })

  it('exige desembarque antes da contemplação do arco-íris', () => {
    const ultimoMomento = concluirAte(
      criarEstadoProgressaoNoe(),
      'nova-terra-arco-iris',
    )

    expect(
      processarEventoProgressaoNoe(ultimoMomento, {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.arco-iris.contemplado',
        unidadeId: 'contemplacao-da-alianca',
      }),
    ).toBe(ultimoMomento)
  })

  it('aceita ações cooperativas do mesmo estágio em qualquer ordem', () => {
    const casos: readonly {
      momentoId: MomentoNoeId
      acaoId: AcaoNoeId
      unidadeId: string
    }[] = [
      {
        momentoId: 'estoque-mantimentos',
        acaoId: 'noe.mantimento.frutas-armazenadas',
        unidadeId: 'frutas-despensa-central',
      },
      {
        momentoId: 'conducao-animais',
        acaoId: 'noe.animais.mamiferos-guiados',
        unidadeId: 'pequenos-mamiferos-cestos',
      },
      {
        momentoId: 'acomodacao-animais',
        acaoId: 'noe.habitat.familia-noe-preparado',
        unidadeId: 'nivel-superior-familia-noe',
      },
      {
        momentoId: 'refugio-tempestade',
        acaoId: 'noe.cuidado.filhotes-mamiferos',
        unidadeId: 'filhotes-mamiferos-alimentados',
      },
      {
        momentoId: 'nova-terra-arco-iris',
        acaoId: 'noe.desembarque.mamiferos',
        unidadeId: 'mamiferos-desembarcados-em-grupo',
      },
    ]

    for (const caso of casos) {
      const estado = concluirAte(criarEstadoProgressaoNoe(), caso.momentoId)
      const atualizado = processarEventoProgressaoNoe(estado, {
        tipo: 'unidade-acao-concluida',
        acaoId: caso.acaoId,
        unidadeId: caso.unidadeId,
      })

      expect(atualizado).not.toBe(estado)
      expect(atualizado.progressoMomentoAtual).toContainEqual({
        acaoId: caso.acaoId,
        unidadesConcluidas: [caso.unidadeId],
      })
    }
  })

  it('bloqueia etapas narrativas futuras até concluir a anterior', () => {
    const casos: readonly {
      momentoId: MomentoNoeId
      acaoId: AcaoNoeId
      unidadeId: string
    }[] = [
      {
        momentoId: 'fechamento-porta',
        acaoId: 'noe.abrigo.entrada-concluida',
        unidadeId: 'entrada-segura-na-arca',
      },
      {
        momentoId: 'retorno-pomba',
        acaoId: 'noe.pomba.retornou',
        unidadeId: 'retorno-com-oliveira',
      },
      {
        momentoId: 'nova-terra-arco-iris',
        acaoId: 'noe.altar.construido',
        unidadeId: 'altar-de-gratidao',
      },
    ]

    for (const caso of casos) {
      const estado = concluirAte(criarEstadoProgressaoNoe(), caso.momentoId)
      expect(
        processarEventoProgressaoNoe(estado, {
          tipo: 'unidade-acao-concluida',
          acaoId: caso.acaoId,
          unidadeId: caso.unidadeId,
        }),
      ).toBe(estado)
    }
  })

  it('expõe somente o estágio acionável nos requisitos pendentes', () => {
    let estado = concluirAte(criarEstadoProgressaoNoe(), 'fechamento-porta')
    expect(obterRequisitosPendentesNoe(estado)).toEqual([
      {
        tipo: 'tarefa-local',
        acaoId: 'noe.abrigo.chamado-ouvido',
        quantidadeConcluida: 0,
        quantidadeNecessaria: 1,
      },
    ])

    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.abrigo.chamado-ouvido',
      unidadeId: 'chamado-final-noe',
    })
    expect(obterRequisitosPendentesNoe(estado)).toEqual([
      {
        tipo: 'tarefa-local',
        acaoId: 'noe.abrigo.entrada-concluida',
        quantidadeConcluida: 0,
        quantidadeNecessaria: 1,
      },
    ])
  })

  it('expande evento v1 em etapas canônicas uma única vez', () => {
    const noFechamento = concluirAte(
      criarEstadoProgressaoNoe(),
      'fechamento-porta',
    )
    const eventoLegado: EventoProgressaoNoe = {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.porta.atravessada',
      unidadeId: 'entrada-segura',
    }
    const migrado = processarEventoProgressaoNoe(noFechamento, eventoLegado)

    expect(migrado.progressoMomentoAtual.map(({ acaoId }) => acaoId)).toEqual([
      'noe.abrigo.chamado-ouvido',
      'noe.abrigo.entrada-concluida',
      'noe.porta.fechada',
    ])
    expect(processarEventoProgressaoNoe(migrado, eventoLegado)).toBe(migrado)
    expect(obterClimaNoe(migrado).chuvaAtiva).toBe(true)
  })

  it('ignora cada Selah final quando recebido antes das tarefas locais', () => {
    let estado = criarEstadoProgressaoNoe()

    for (const momento of momentosNoe) {
      expect(estado.momentoAtualId).toBe(momento.id)
      if (momento.gatilhoConclusao.selahFinal) {
        const antecipado = processarEventoProgressaoNoe(estado, {
          tipo: 'selah-concluido',
          passagemId: momento.gatilhoConclusao.selahFinal,
        })
        expect(antecipado).toBe(estado)
      }
      estado = concluirMomentoAtual(estado)
    }

    expect(estado.concluida).toBe(true)
  })

  it('conclui a rota com o prefixo canônico e permanece estável ao final', () => {
    let estado = criarEstadoProgressaoNoe()
    while (!estado.concluida) estado = concluirMomentoAtual(estado)

    expect(estado.momentosConcluidos).toEqual(momentosNoe.map(({ id }) => id))
    expect(estado.momentoAtualId).toBe('nova-terra-arco-iris')
    expect(
      processarEventoProgressaoNoe(estado, {
        tipo: 'selah-concluido',
        passagemId: 'genesis-9-13',
      }),
    ).toBe(estado)
  })

  it.each([
    ['chamado-canteiro', 0, 'calmo', false],
    ['coleta-vedacao', 0, 'calmo', false],
    ['estoque-mantimentos', 33, 'nuvens-leves', false],
    ['conducao-animais', 33, 'nuvens-leves', false],
    ['acomodacao-animais', 66, 'vento-suave', false],
    ['fechamento-porta', 100, 'abrigo-pronto', false],
    ['refugio-tempestade', 100, 'chuva-segura', true],
    ['retorno-pomba', 100, 'luz-retornando', false],
    ['nova-terra-arco-iris', 100, 'nova-terra', false],
  ] as const)(
    'projeta clima canônico ao iniciar %s',
    (momentoId, percentualPreparacao, fase, chuvaAtiva) => {
      const estado = concluirAte(criarEstadoProgressaoNoe(), momentoId)

      expect(obterClimaNoe(estado)).toEqual({
        percentualPreparacao,
        fase,
        chuvaAtiva,
      })
    },
  )

  it('só inicia a chuva em M6 depois do chamado, entrada e porta segura', () => {
    let estado = concluirAte(criarEstadoProgressaoNoe(), 'fechamento-porta')
    const eventos: readonly EventoProgressaoNoe[] = [
      {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.abrigo.chamado-ouvido',
        unidadeId: 'chamado-final-noe',
      },
      {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.abrigo.entrada-concluida',
        unidadeId: 'entrada-segura-na-arca',
      },
      {
        tipo: 'unidade-acao-concluida',
        acaoId: 'noe.porta.fechada',
        unidadeId: 'porta-da-arca-fechada',
      },
    ]

    for (const evento of eventos.slice(0, -1)) {
      estado = processarEventoProgressaoNoe(estado, evento)
      expect(obterClimaNoe(estado).chuvaAtiva).toBe(false)
    }

    estado = processarEventoProgressaoNoe(estado, eventos[2])
    expect(estado.momentoAtualId).toBe('fechamento-porta')
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 100,
      fase: 'chuva-segura',
      chuvaAtiva: true,
    })
  })
})
