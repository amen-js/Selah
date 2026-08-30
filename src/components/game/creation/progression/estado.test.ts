import { describe, expect, it } from 'vitest'
import { momentosCriacao } from './catalogo'
import {
  aplicarSelahsConcluidos,
  criarEstadoProgressaoCriacao,
  processarEventoProgressaoCriacao,
  reconstruirProgressaoCriacao,
} from './estado'
import type { EventoProgressaoCriacao } from './types'

const eventosJornada: EventoProgressaoCriacao[] = [
  { tipo: 'distancia-percorrida', distancia: 4 },
  { tipo: 'selah-concluido', passagemId: 'genesis-1-3' },
  { tipo: 'zona-narrativa', zonaId: 'mirante-dos-rios' },
  { tipo: 'selah-concluido', passagemId: 'genesis-1-11' },
  { tipo: 'zona-narrativa', zonaId: 'observatorio-do-ceu' },
  { tipo: 'selah-concluido', passagemId: 'genesis-1-24' },
  { tipo: 'zona-narrativa', zonaId: 'coracao-do-eden' },
  { tipo: 'selah-concluido', passagemId: 'genesis-1-27' },
  { tipo: 'zona-narrativa', zonaId: 'arvore-do-conhecimento' },
]

describe('catálogo da progressão da Criação', () => {
  it('representa os nove momentos do GDD em ordem e sem IDs repetidos', () => {
    expect(momentosCriacao).toHaveLength(9)
    expect(momentosCriacao.map(({ ordem }) => ordem)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(new Set(momentosCriacao.map(({ id }) => id)).size).toBe(9)
    for (const momento of momentosCriacao) {
      expect(momento.falaInicial.length).toBeGreaterThan(20)
      expect(momento.falaApoio.length).toBeGreaterThan(20)
      expect(momento.assets.length).toBeGreaterThan(0)
    }
  })
})

describe('estado da progressão da Criação', () => {
  it('percorre a jornada inteira sem pular momentos', () => {
    let estado = criarEstadoProgressaoCriacao()

    eventosJornada.forEach((evento, indice) => {
      estado = processarEventoProgressaoCriacao(estado, evento)
      expect(estado.momentosConcluidos).toHaveLength(indice + 1)
    })

    expect(estado.momentoAtualId).toBe('fruto-escolha')
    expect(estado.concluida).toBe(true)
  })

  it('ignora zonas futuras, distância curta e eventos repetidos', () => {
    const inicial = criarEstadoProgressaoCriacao()
    const zonaFutura = processarEventoProgressaoCriacao(inicial, {
      tipo: 'zona-narrativa',
      zonaId: 'coracao-do-eden',
    })
    const distanciaCurta = processarEventoProgressaoCriacao(inicial, {
      tipo: 'distancia-percorrida',
      distancia: 3.9,
    })

    expect(zonaFutura).toBe(inicial)
    expect(distanciaCurta).toBe(inicial)

    const luz = processarEventoProgressaoCriacao(inicial, eventosJornada[0])
    expect(processarEventoProgressaoCriacao(luz, eventosJornada[0])).toBe(luz)
  })

  it('reconstrói o marco seguro mais distante apenas pelas respostas registradas', () => {
    expect(reconstruirProgressaoCriacao([]).momentoAtualId).toBe('vazio')
    expect(reconstruirProgressaoCriacao(['genesis-1-3']).momentoAtualId).toBe(
      'ceu-terra-aguas',
    )
    expect(
      reconstruirProgressaoCriacao(['genesis-1-24', 'genesis-1-1']).momentoAtualId,
    ).toBe('vazio')
    expect(
      reconstruirProgressaoCriacao([
        'genesis-1-3',
        'genesis-1-11',
        'genesis-1-24',
        'genesis-1-27',
      ]).momentosConcluidos,
    ).toEqual(momentosCriacao.slice(0, 8).map(({ id }) => id))
  })

  it('consome resposta antecipada somente depois do gatilho intermediário', () => {
    let estado = criarEstadoProgressaoCriacao()
    estado = processarEventoProgressaoCriacao(estado, eventosJornada[0])
    estado = aplicarSelahsConcluidos(estado, ['genesis-1-3', 'genesis-1-11'])

    expect(estado.momentoAtualId).toBe('ceu-terra-aguas')

    estado = processarEventoProgressaoCriacao(estado, eventosJornada[2])
    estado = aplicarSelahsConcluidos(estado, ['genesis-1-3', 'genesis-1-11'])

    expect(estado.momentoAtualId).toBe('ceu-ritmo')
  })
})
