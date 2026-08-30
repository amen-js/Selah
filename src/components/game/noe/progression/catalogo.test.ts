import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'

const tarefasDetalhadasM3aM9 = [
  {
    momentoId: 'estoque-mantimentos',
    tarefas: [
      ['noe.mantimento.feno-armazenado', 'feno-estabulos-inferiores', 1],
      ['noe.mantimento.graos-armazenados', 'graos-poleiros-superiores', 1],
      ['noe.mantimento.agua-armazenada', 'agua-reserva-central', 1],
      ['noe.mantimento.frutas-armazenadas', 'frutas-despensa-central', 1],
    ],
  },
  {
    momentoId: 'conducao-animais',
    tarefas: [
      ['noe.animais.aves-guiadas', 'aves-trilha-sementes', 1],
      [
        'noe.animais.herbivoros-guiados',
        'grandes-herbivoros-ponte-alinhada',
        1,
      ],
      ['noe.animais.mamiferos-guiados', 'pequenos-mamiferos-cestos', 1],
    ],
  },
  {
    momentoId: 'acomodacao-animais',
    tarefas: [
      [
        'noe.habitat.grandes-animais-preparado',
        'nivel-inferior-elefantes',
        1,
      ],
      [
        'noe.habitat.pequenos-mamiferos-preparado',
        'nivel-medio-coelhos',
        1,
      ],
      ['noe.habitat.aves-preparado', 'nivel-superior-aves', 1],
      ['noe.habitat.familia-noe-preparado', 'nivel-superior-familia-noe', 1],
    ],
  },
  {
    momentoId: 'fechamento-porta',
    tarefas: [
      ['noe.abrigo.chamado-ouvido', 'chamado-final-noe', 1],
      ['noe.abrigo.entrada-concluida', 'entrada-segura-na-arca', 2],
      ['noe.porta.fechada', 'porta-da-arca-fechada', 3],
    ],
  },
  {
    momentoId: 'refugio-tempestade',
    tarefas: [
      ['noe.cuidado.filhotes-aves', 'filhotes-aves-alimentados', 1],
      ['noe.cuidado.filhotes-herbivoros', 'filhotes-herbivoros-alimentados', 1],
      ['noe.cuidado.filhotes-mamiferos', 'filhotes-mamiferos-alimentados', 1],
    ],
  },
  {
    momentoId: 'retorno-pomba',
    tarefas: [
      ['noe.pomba.enviada', 'envio-janela-superior', 1],
      ['noe.pomba.retornou', 'retorno-com-oliveira', 2],
    ],
  },
  {
    momentoId: 'nova-terra-arco-iris',
    tarefas: [
      ['noe.desembarque.aves', 'aves-desembarcadas-em-grupo', 1],
      ['noe.desembarque.herbivoros', 'herbivoros-desembarcados-em-grupo', 1],
      ['noe.desembarque.mamiferos', 'mamiferos-desembarcados-em-grupo', 1],
      ['noe.altar.construido', 'altar-de-gratidao', 2],
      ['noe.arco-iris.contemplado', 'contemplacao-da-alianca', 3],
    ],
  },
] as const

describe('catálogo da jornada de Noé', () => {
  it('expõe os nove momentos canônicos em ordem', () => {
    expect(momentosNoe.map(({ id }) => id)).toEqual([
      'chamado-canteiro',
      'coleta-vedacao',
      'estoque-mantimentos',
      'conducao-animais',
      'acomodacao-animais',
      'fechamento-porta',
      'refugio-tempestade',
      'retorno-pomba',
      'nova-terra-arco-iris',
    ])
    expect(momentosNoe.map(({ ordem }) => ordem)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ])
  })

  it('reusa somente as cinco passagens já aprovadas nos marcos previstos', () => {
    const selahs = momentosNoe.flatMap((momento) =>
      momento.gatilhoConclusao.selahFinal
        ? [
            {
              momentoId: momento.id,
              passagemId: momento.gatilhoConclusao.selahFinal,
            },
          ]
        : [],
    )

    expect(selahs).toEqual([
      { momentoId: 'coleta-vedacao', passagemId: 'genesis-6-14' },
      { momentoId: 'acomodacao-animais', passagemId: 'genesis-6-19' },
      { momentoId: 'fechamento-porta', passagemId: 'genesis-7-1' },
      { momentoId: 'refugio-tempestade', passagemId: 'genesis-8-1' },
      { momentoId: 'nova-terra-arco-iris', passagemId: 'genesis-9-13' },
    ])
  })

  it('declara área e unidades estáveis para todas as tarefas', () => {
    expect(momentosNoe.map(({ areaId }) => areaId)).toEqual([
      'canteiro-vale',
      'canteiro-vale',
      'interior-arca',
      'campo-animais',
      'interior-arca',
      'canteiro-vale',
      'interior-arca',
      'interior-arca',
      'ararate-nova-terra',
    ])

    for (const momento of momentosNoe) {
      expect(momento.gatilhoConclusao.tipo).toBe(
        'tarefas-locais-e-selah-opcional',
      )
      expect(momento.gatilhoConclusao.tarefas.length).toBeGreaterThan(0)
      for (const tarefa of momento.gatilhoConclusao.tarefas) {
        expect(tarefa.unidadesNecessarias.length).toBeGreaterThan(0)
        expect(new Set(tarefa.unidadesNecessarias).size).toBe(
          tarefa.unidadesNecessarias.length,
        )
      }
    }
  })

  it('mantém M2 em quatro tábuas, uma rampa e três fendas', () => {
    const momento = momentosNoe.find(({ id }) => id === 'coleta-vedacao')

    expect(
      momento?.gatilhoConclusao.tarefas.map(
        ({ acaoId, unidadesNecessarias }) => ({
          acaoId,
          quantidade: unidadesNecessarias.length,
        }),
      ),
    ).toEqual([
      { acaoId: 'noe.madeira.coletada', quantidade: 4 },
      { acaoId: 'noe.rampa.reparada', quantidade: 1 },
      { acaoId: 'noe.betume.aplicado', quantidade: 3 },
    ])
  })

  it.each(tarefasDetalhadasM3aM9)(
    'detalha ações, destinos e estágios de $momentoId',
    ({ momentoId, tarefas }) => {
      const momento = momentosNoe.find(({ id }) => id === momentoId)

      expect(
        momento?.gatilhoConclusao.tarefas.map((tarefa) => [
          tarefa.acaoId,
          tarefa.unidadesNecessarias[0],
          tarefa.etapa,
        ]),
      ).toEqual(tarefas)
    },
  )

  it('acomoda famílias por espécie nos três níveis da Arca', () => {
    const momento = momentosNoe.find(({ id }) => id === 'acomodacao-animais')

    expect(
      momento?.gatilhoConclusao.tarefas.map(
        ({ acaoId, unidadesNecessarias }) => ({
          acaoId,
          unidadesNecessarias,
        }),
      ),
    ).toEqual([
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadesNecessarias: [
          'nivel-inferior-elefantes',
          'nivel-inferior-girafas',
          'nivel-inferior-leoes',
          'nivel-inferior-ovelhas',
          'nivel-inferior-zebras',
        ],
      },
      {
        acaoId: 'noe.habitat.pequenos-mamiferos-preparado',
        unidadesNecessarias: ['nivel-medio-coelhos'],
      },
      {
        acaoId: 'noe.habitat.aves-preparado',
        unidadesNecessarias: ['nivel-superior-aves'],
      },
      {
        acaoId: 'noe.habitat.familia-noe-preparado',
        unidadesNecessarias: ['nivel-superior-familia-noe'],
      },
    ])
  })
})
