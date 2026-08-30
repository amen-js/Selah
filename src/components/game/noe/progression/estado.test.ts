import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'
import {
  criarEstadoProgressaoNoe,
  obterClimaNoe,
  processarEventoProgressaoNoe,
} from './estado'
import type { EstadoProgressaoNoe, EventoProgressaoNoe } from './types'

function concluirMomentoAtual(estado: EstadoProgressaoNoe): EstadoProgressaoNoe {
  const momento = momentosNoe.find(({ id }) => id === estado.momentoAtualId)
  if (!momento) return estado

  return momento.gatilhoConclusao.marcos.reduce(
    (atual, marco) => processarEventoProgressaoNoe(atual, marco),
    estado,
  )
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
  it('ignora marcos de momentos futuros e conclui somente o momento atual', () => {
    const inicial = criarEstadoProgressaoNoe()
    const futuro: EventoProgressaoNoe = {
      tipo: 'selah-concluido',
      passagemId: 'genesis-9-13',
    }

    expect(processarEventoProgressaoNoe(inicial, futuro)).toBe(inicial)

    const chamado = processarEventoProgressaoNoe(inicial, {
      tipo: 'acao-concluida',
      acaoId: 'noe.chamado.confirmado',
    })
    expect(chamado.momentoAtualId).toBe('coleta-vedacao')
    expect(chamado.momentosConcluidos).toEqual(['chamado-canteiro'])
  })

  it('exige todos os marcos do composto e trata duplicatas como idempotentes', () => {
    const noSegundoMomento = concluirMomentoAtual(criarEstadoProgressaoNoe())
    const madeira: EventoProgressaoNoe = {
      tipo: 'acao-concluida',
      acaoId: 'noe.madeira.coletada',
    }
    const comMadeira = processarEventoProgressaoNoe(noSegundoMomento, madeira)

    expect(processarEventoProgressaoNoe(comMadeira, madeira)).toBe(comMadeira)

    const comRampa = processarEventoProgressaoNoe(comMadeira, {
      tipo: 'acao-concluida',
      acaoId: 'noe.rampa.reparada',
    })
    const semSelah = processarEventoProgressaoNoe(comRampa, {
      tipo: 'acao-concluida',
      acaoId: 'noe.betume.aplicado',
    })

    expect(semSelah.momentoAtualId).toBe('coleta-vedacao')
    expect(semSelah.marcosMomentoAtualConcluidos).toHaveLength(3)

    const terceiroMomento = processarEventoProgressaoNoe(semSelah, {
      tipo: 'selah-concluido',
      passagemId: 'genesis-6-14',
    })
    expect(terceiroMomento.momentoAtualId).toBe('estoque-mantimentos')
    expect(terceiroMomento.marcosMomentoAtualConcluidos).toEqual([])
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

  it('projeta o clima 0/33/66/100, com chuva somente após M6 e luz após M8', () => {
    let estado = criarEstadoProgressaoNoe()
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 0,
      fase: 'calmo',
      chuvaAtiva: false,
    })

    estado = concluirAte(estado, 'estoque-mantimentos')
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 33,
      fase: 'nuvens-leves',
      chuvaAtiva: false,
    })

    estado = concluirAte(estado, 'acomodacao-animais')
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 66,
      fase: 'vento-suave',
      chuvaAtiva: false,
    })

    estado = concluirAte(estado, 'fechamento-porta')
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 100,
      fase: 'abrigo-pronto',
      chuvaAtiva: false,
    })

    estado = concluirAte(estado, 'refugio-tempestade')
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 100,
      fase: 'chuva-segura',
      chuvaAtiva: true,
    })

    estado = concluirAte(estado, 'nova-terra-arco-iris')
    expect(obterClimaNoe(estado)).toEqual({
      percentualPreparacao: 100,
      fase: 'luz-retornando',
      chuvaAtiva: false,
    })
  })
})
