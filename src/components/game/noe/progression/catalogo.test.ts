import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'

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
    expect(momentosNoe.map(({ ordem }) => ordem)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
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
})
