import { describe, expect, it } from 'vitest'
import {
  criarCheckpointProgressaoNoe,
  reconstruirProgressaoNoe,
} from '../progression/checkpoint'
import { processarEventoProgressaoNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
} from '../progression/types'
import {
  arcoIrisVisivelNoe,
  descreverTarefasNovaTerraNoe,
  obterEstadoVisualNovaTerraNoe,
  resolverCandidatoNovaTerraNoe,
} from './novaTerra'

const MOMENTOS_ANTES_DA_NOVA_TERRA = [
  'chamado-canteiro',
  'coleta-vedacao',
  'estoque-mantimentos',
  'conducao-animais',
  'acomodacao-animais',
  'fechamento-porta',
  'refugio-tempestade',
  'retorno-pomba',
] as const

const DESEMBARQUES = [
  ['noe.desembarque.aves', 'aves-desembarcadas-em-grupo'],
  ['noe.desembarque.herbivoros', 'herbivoros-desembarcados-em-grupo'],
  ['noe.desembarque.mamiferos', 'mamiferos-desembarcados-em-grupo'],
] as const

function criarEstadoM9(): EstadoProgressaoNoe {
  return reconstruirProgressaoNoe({
    versao: 1,
    momentosConcluidos: MOMENTOS_ANTES_DA_NOVA_TERRA,
    progressoMomentoAtual: [],
  })
}

function concluir(
  estado: EstadoProgressaoNoe,
  acaoId: AcaoNoeId,
  unidadeId: string,
): EstadoProgressaoNoe {
  return processarEventoProgressaoNoe(estado, {
    tipo: 'unidade-acao-concluida',
    acaoId,
    unidadeId,
  })
}

function concluirDesembarques(estado: EstadoProgressaoNoe) {
  return DESEMBARQUES.reduce(
    (atual, [acaoId, unidadeId]) => concluir(atual, acaoId, unidadeId),
    estado,
  )
}

describe('nova terra e aliança de Noé', () => {
  it('libera os três grupos em ordem livre e mantém o altar bloqueado', () => {
    let estado = criarEstadoM9()
    expect(
      descreverTarefasNovaTerraNoe(estado)
        .filter(({ estado: estadoTarefa }) => estadoTarefa === 'disponivel')
        .map(({ acaoId }) => acaoId),
    ).toEqual(DESEMBARQUES.map(([acaoId]) => acaoId))

    estado = concluir(
      estado,
      'noe.desembarque.mamiferos',
      'mamiferos-desembarcados-em-grupo',
    )
    estado = concluir(
      estado,
      'noe.desembarque.aves',
      'aves-desembarcadas-em-grupo',
    )

    expect(
      descreverTarefasNovaTerraNoe(estado).find(
        ({ acaoId }) => acaoId === 'noe.altar.construido',
      )?.estado,
    ).toBe('bloqueada')
    expect(
      resolverCandidatoNovaTerraNoe(
        { x: 0, y: 0.45, z: 30.5 },
        estado,
      ),
    ).toBeNull()
  })

  it('ordena desembarque, altar e contemplação sem revelar o arco-íris', () => {
    let estado = concluirDesembarques(criarEstadoM9())

    expect(
      resolverCandidatoNovaTerraNoe(
        { x: 0, y: 0.45, z: 30.5 },
        estado,
      ),
    ).toMatchObject({
      acaoId: 'noe.altar.construido',
      unidadeId: 'altar-de-gratidao',
      etapa: 2,
    })
    expect(arcoIrisVisivelNoe(estado)).toBe(false)

    estado = concluir(
      estado,
      'noe.altar.construido',
      'altar-de-gratidao',
    )
    expect(
      resolverCandidatoNovaTerraNoe(
        { x: 0, y: 0.45, z: 35.2 },
        estado,
      ),
    ).toMatchObject({
      acaoId: 'noe.arco-iris.contemplado',
      unidadeId: 'contemplacao-da-alianca',
      etapa: 3,
    })
    expect(obterEstadoVisualNovaTerraNoe(estado).arcoIrisVisivel).toBe(false)
  })

  it('mostra e persiste o arco-íris somente após contemplação', () => {
    let estado = concluirDesembarques(criarEstadoM9())
    estado = concluir(
      estado,
      'noe.altar.construido',
      'altar-de-gratidao',
    )
    estado = concluir(
      estado,
      'noe.arco-iris.contemplado',
      'contemplacao-da-alianca',
    )

    expect(arcoIrisVisivelNoe(estado)).toBe(true)
    expect(estado.concluida).toBe(false)

    const restaurado = reconstruirProgressaoNoe(
      criarCheckpointProgressaoNoe(estado),
    )
    expect(arcoIrisVisivelNoe(restaurado)).toBe(true)
    expect(obterEstadoVisualNovaTerraNoe(restaurado)).toMatchObject({
      gruposDesembarcados: ['aves', 'herbivoros', 'mamiferos'],
      altarConstruido: true,
      arcoIrisVisivel: true,
    })
  })

  it('mantém a aliança visível após o Selah final concluir Noé', () => {
    let estado = concluirDesembarques(criarEstadoM9())
    estado = concluir(
      estado,
      'noe.altar.construido',
      'altar-de-gratidao',
    )
    estado = concluir(
      estado,
      'noe.arco-iris.contemplado',
      'contemplacao-da-alianca',
    )
    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'selah-concluido',
      passagemId: 'genesis-9-13',
    })

    expect(estado.concluida).toBe(true)
    expect(estado.momentosConcluidos).toContain('nova-terra-arco-iris')
    expect(arcoIrisVisivelNoe(estado)).toBe(true)
    expect(
      resolverCandidatoNovaTerraNoe(
        { x: 0, y: 0.45, z: 35.2 },
        estado,
      ),
    ).toBeNull()
  })
})
