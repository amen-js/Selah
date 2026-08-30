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
      momento.gatilhoConclusao.marcos.flatMap((marco) =>
        marco.tipo === 'selah-concluido'
          ? [{ momentoId: momento.id, passagemId: marco.passagemId }]
          : [],
      ),
    )

    expect(selahs).toEqual([
      { momentoId: 'coleta-vedacao', passagemId: 'genesis-6-14' },
      { momentoId: 'acomodacao-animais', passagemId: 'genesis-6-19' },
      { momentoId: 'fechamento-porta', passagemId: 'genesis-7-1' },
      { momentoId: 'refugio-tempestade', passagemId: 'genesis-8-1' },
      { momentoId: 'nova-terra-arco-iris', passagemId: 'genesis-9-13' },
    ])
  })

  it('declara todos os fechamentos como marcos compostos não vazios', () => {
    for (const momento of momentosNoe) {
      expect(momento.gatilhoConclusao.tipo).toBe('todos-os-marcos')
      expect(momento.gatilhoConclusao.marcos.length).toBeGreaterThan(0)
    }
  })
})
