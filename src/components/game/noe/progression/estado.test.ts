import { describe, expect, it } from 'vitest'
import { momentosNoe } from './catalogo'
import {
  criarEstadoProgressaoNoe,
  obterClimaNoe,
  obterRequisitosPendentesNoe,
  processarEventoProgressaoNoe,
} from './estado'
import type { EstadoProgressaoNoe, EventoProgressaoNoe } from './types'

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

function concluirMomentoAtual(estado: EstadoProgressaoNoe): EstadoProgressaoNoe {
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
    const primeiraTabua: EventoProgressaoNoe = {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.madeira.coletada',
      unidadeId: 'tabua-1',
    }
    const comPrimeiraTabua = processarEventoProgressaoNoe(
      noSegundoMomento,
      primeiraTabua,
    )

    expect(
      processarEventoProgressaoNoe(comPrimeiraTabua, primeiraTabua),
    ).toBe(comPrimeiraTabua)
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
