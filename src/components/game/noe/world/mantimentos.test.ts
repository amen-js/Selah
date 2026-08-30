import { describe, expect, it } from 'vitest'
import { momentoNoePorId } from '../progression/catalogo'
import type { ProgressoAcaoNoe } from '../progression/types'
import {
  descreverEstadoMantimentosNoe,
  estruturaConvesesArcaNoe,
  mantimentoConcluidoNoe,
  mantimentosArcaNoe,
  resolverCandidatoMantimentoNoe,
} from './mantimentos'

const progressoFeno: readonly ProgressoAcaoNoe[] = [
  {
    acaoId: 'noe.mantimento.feno-armazenado',
    unidadesConcluidas: ['feno-estabulos-inferiores'],
  },
]

describe('estoque de mantimentos da Arca', () => {
  it('espelha os quatro pares exatos allowlisted pelo catálogo de M3', () => {
    const catalogo = momentoNoePorId.get('estoque-mantimentos')
    const esperados =
      catalogo?.gatilhoConclusao.tarefas.flatMap((tarefa) =>
        tarefa.unidadesNecessarias.map(
          (unidadeId) => `${tarefa.acaoId}/${unidadeId}`,
        ),
      ) ?? []
    const descritos = mantimentosArcaNoe.map(
      ({ acaoId, unidadeId }) => `${acaoId}/${unidadeId}`,
    )

    expect(descritos).toEqual([
      'noe.mantimento.feno-armazenado/feno-estabulos-inferiores',
      'noe.mantimento.graos-armazenados/graos-poleiros-superiores',
      'noe.mantimento.agua-armazenada/agua-reserva-central',
      'noe.mantimento.frutas-armazenadas/frutas-despensa-central',
    ])
    expect(descritos).toEqual(esperados)
  })

  it('começa em pontos de coleta acessíveis e publica o recurso mais próximo', () => {
    const feno = mantimentosArcaNoe[0]
    const candidato = resolverCandidatoMantimentoNoe(
      {
        x: feno.posicaoColeta[0],
        y: feno.posicaoColeta[1],
        z: feno.posicaoColeta[2],
      },
      'estoque-mantimentos',
      [],
      null,
    )

    expect(candidato).toMatchObject({
      id: 'mantimento-coleta-feno',
      acaoId: 'noe.mantimento.feno-armazenado',
      unidadeId: 'feno-estabulos-inferiores',
      etapaInteracao: 'coleta',
      mantimentoId: 'feno',
      prioridade: 320,
    })
  })

  it('após pegar um item aceita somente a entrega no destino correspondente', () => {
    const feno = mantimentosArcaNoe[0]
    const graos = mantimentosArcaNoe[1]

    expect(
      resolverCandidatoMantimentoNoe(
        {
          x: graos.posicaoColeta[0],
          y: graos.posicaoColeta[1],
          z: graos.posicaoColeta[2],
        },
        'estoque-mantimentos',
        [],
        'feno',
      ),
    ).toBeNull()

    expect(
      resolverCandidatoMantimentoNoe(
        {
          x: feno.posicaoDestino[0],
          y: feno.posicaoDestino[1],
          z: feno.posicaoDestino[2],
        },
        'estoque-mantimentos',
        [],
        'feno',
      ),
    ).toMatchObject({
      id: 'mantimento-entrega-feno',
      etapaInteracao: 'entrega',
      acaoId: 'noe.mantimento.feno-armazenado',
      unidadeId: 'feno-estabulos-inferiores',
    })
  })

  it('não publica interação fora de M3 nem para unidade já concluída', () => {
    const feno = mantimentosArcaNoe[0]
    const posicaoColeta = {
      x: feno.posicaoColeta[0],
      y: feno.posicaoColeta[1],
      z: feno.posicaoColeta[2],
    }

    expect(
      resolverCandidatoMantimentoNoe(
        posicaoColeta,
        'coleta-vedacao',
        [],
        null,
      ),
    ).toBeNull()
    expect(
      descreverEstadoMantimentosNoe(
        'coleta-vedacao',
        progressoFeno,
        null,
      ).some(({ concluido, mostrarNoDestino }) =>
        concluido || mostrarNoDestino,
      ),
    ).toBe(false)
    expect(
      resolverCandidatoMantimentoNoe(
        posicaoColeta,
        'estoque-mantimentos',
        progressoFeno,
        null,
      ),
    ).toBeNull()
  })

  it('deriva conclusão idempotente do par ação/unidade, inclusive fragmentos duplicados', () => {
    const feno = mantimentosArcaNoe[0]
    const progressoDuplicado: readonly ProgressoAcaoNoe[] = [
      {
        acaoId: 'noe.mantimento.feno-armazenado',
        unidadesConcluidas: ['outra-unidade'],
      },
      ...progressoFeno,
      ...progressoFeno,
    ]

    expect(
      mantimentoConcluidoNoe(
        feno,
        'estoque-mantimentos',
        progressoDuplicado,
      ),
    ).toBe(true)
    expect(
      mantimentoConcluidoNoe(feno, 'estoque-mantimentos', [
        {
          acaoId: 'noe.mantimento.graos-armazenados',
          unidadesConcluidas: ['feno-estabulos-inferiores'],
        },
      ]),
    ).toBe(false)
  })

  it('remove o item concluído da coleta e o mantém organizado no destino', () => {
    const estados = descreverEstadoMantimentosNoe(
      'estoque-mantimentos',
      progressoFeno,
      null,
    )
    const feno = estados.find(({ descritor }) => descritor.id === 'feno')
    const graos = estados.find(({ descritor }) => descritor.id === 'graos')

    expect(feno).toMatchObject({
      concluido: true,
      mostrarNaColeta: false,
      mostrarNoDestino: true,
    })
    expect(graos).toMatchObject({
      concluido: false,
      mostrarNaColeta: true,
      mostrarNoDestino: false,
    })
  })

  it('reconstrói todos os suprimentos organizados após avançar além de M3', () => {
    const estados = descreverEstadoMantimentosNoe(
      'conducao-animais',
      [],
      null,
    )

    expect(estados.every(({ concluido }) => concluido)).toBe(true)
    expect(estados.every(({ mostrarNaColeta }) => !mostrarNaColeta)).toBe(true)
    expect(estados.every(({ mostrarNoDestino }) => mostrarNoDestino)).toBe(true)
  })

  it('define três níveis distintos e dois acessos largos de baixa inclinação', () => {
    const alturas = estruturaConvesesArcaNoe.niveis.map(
      ({ alturaPiso }) => alturaPiso,
    )
    expect(alturas).toEqual([0.44, 2.22, 4.12])
    expect(new Set(estruturaConvesesArcaNoe.niveis.map(({ id }) => id)).size).toBe(
      3,
    )
    expect(estruturaConvesesArcaNoe.plataformas).toHaveLength(4)
    expect(
      estruturaConvesesArcaNoe.plataformas.map(({ id }) => id),
    ).toEqual([
      'plataforma-media-fundo',
      'plataforma-media-frente-direita',
      'plataforma-superior-fundo',
      'plataforma-superior-frente-esquerda',
    ])
    expect(estruturaConvesesArcaNoe.acessos).toHaveLength(2)

    for (const acesso of estruturaConvesesArcaNoe.acessos) {
      expect(acesso.meiaExtensao[0] * 2).toBeGreaterThanOrEqual(2)
      expect((acesso.rotacao[0] * 180) / Math.PI).toBeLessThan(15)
      expect(Math.abs(acesso.posicaoLocal[0])).toBeLessThan(4.5)

      const meiaExtensaoZ = acesso.meiaExtensao[2]
      const meiaEspessura = acesso.meiaExtensao[1]
      const topo =
        acesso.posicaoLocal[1] +
        Math.sin(acesso.rotacao[0]) * meiaExtensaoZ +
        Math.cos(acesso.rotacao[0]) * meiaEspessura
      const base =
        acesso.posicaoLocal[1] -
        Math.sin(acesso.rotacao[0]) * meiaExtensaoZ +
        Math.cos(acesso.rotacao[0]) * meiaEspessura
      const nivelOrigem = estruturaConvesesArcaNoe.niveis.find(
        ({ id }) => id === acesso.liga[0],
      )
      const nivelDestino = estruturaConvesesArcaNoe.niveis.find(
        ({ id }) => id === acesso.liga[1],
      )

      expect(base).toBeCloseTo(nivelOrigem?.alturaPiso ?? -1, 2)
      expect(topo).toBeCloseTo(nivelDestino?.alturaPiso ?? -1, 2)
    }
  })

  it('organiza cada tipo perto do uso semântico correto', () => {
    expect(
      mantimentosArcaNoe.map(({ id, destino }) => `${id}:${destino}`),
    ).toEqual([
      'feno:estabulos-inferiores',
      'graos:poleiros-superiores',
      'agua:reserva-central',
      'frutas:despensa-central',
    ])
    expect(mantimentosArcaNoe[0].posicaoDestino[1]).toBeLessThan(1)
    expect(mantimentosArcaNoe[1].posicaoDestino[1]).toBeGreaterThan(4)
    expect(mantimentosArcaNoe[2].posicaoDestino[1]).toBeGreaterThan(2)
    expect(mantimentosArcaNoe[2].posicaoDestino[1]).toBeLessThan(3)
  })
})
