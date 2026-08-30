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
  MEIA_EXTENSAO_COLISOR_ALTAR_NOE,
  obterEstadoVisualNovaTerraNoe,
  penhascosArarateNoe,
  resolverCandidatoNovaTerraNoe,
  tarefasNovaTerraNoe,
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
  it('mantém os penhascos fora do casco e o gatilho fora do futuro altar', () => {
    for (const penhasco of penhascosArarateNoe) {
      const cos = Math.abs(Math.cos(penhasco.rotacaoY))
      const sin = Math.abs(Math.sin(penhasco.rotacaoY))
      const meiaLarguraRotacionada =
        cos * penhasco.escala[0] + sin * penhasco.escala[2]
      const xMin = penhasco.posicao[0] - meiaLarguraRotacionada
      const xMax = penhasco.posicao[0] + meiaLarguraRotacionada

      expect(xMax <= -6.4 || xMin >= 6.4).toBe(true)
    }

    const altar = tarefasNovaTerraNoe.find(
      ({ acaoId }) => acaoId === 'noe.altar.construido',
    )
    expect(altar).toBeDefined()
    if (!altar) return
    const distanciaAoCentro = Math.hypot(
      altar.posicao[0] - altar.posicaoDestino[0],
      altar.posicao[2] - altar.posicaoDestino[2],
    )
    expect(distanciaAoCentro).toBeGreaterThan(
      altar.raio + MEIA_EXTENSAO_COLISOR_ALTAR_NOE[2] + 0.3,
    )
  })

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
    const gatilhoAltar = tarefasNovaTerraNoe.find(
      ({ acaoId }) => acaoId === 'noe.altar.construido',
    )
    expect(gatilhoAltar).toBeDefined()
    if (!gatilhoAltar) return

    expect(
      resolverCandidatoNovaTerraNoe(
        {
          x: gatilhoAltar.posicao[0],
          y: gatilhoAltar.posicao[1],
          z: gatilhoAltar.posicao[2],
        },
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
