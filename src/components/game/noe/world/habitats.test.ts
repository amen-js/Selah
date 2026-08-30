import { describe, expect, it } from 'vitest'
import { momentoNoePorId } from '../progression/catalogo'
import type { ProgressoAcaoNoe } from '../progression/types'
import {
  descreverEstadoHabitatsArcaNoe,
  habitatsArcaNoe,
  habitatsArcaNoeVisiveis,
  resolverCandidatoHabitatArcaNoe,
} from './habitats'

describe('puzzle acolhedor de habitats em M5', () => {
  it('espelha as oito unidades e seus níveis definidos no catálogo', () => {
    const catalogo = momentoNoePorId.get('acomodacao-animais')
    const esperadas =
      catalogo?.gatilhoConclusao.tarefas.flatMap((tarefa) =>
        tarefa.unidadesNecessarias.map(
          (unidadeId) => `${tarefa.acaoId}:${unidadeId}`,
        ),
      ) ?? []
    const descritas = habitatsArcaNoe.map(
      ({ acaoId, unidadeId }) => `${acaoId}:${unidadeId}`,
    )

    expect(descritas).toEqual(esperadas)
    expect(habitatsArcaNoe.filter(({ nivel }) => nivel === 'inferior')).toHaveLength(5)
    expect(habitatsArcaNoe.filter(({ nivel }) => nivel === 'medio')).toHaveLength(1)
    expect(habitatsArcaNoe.filter(({ nivel }) => nivel === 'superior')).toHaveLength(2)
  })

  it('acomoda famílias com pelo menos dois integrantes, nunca indivíduos', () => {
    expect(habitatsArcaNoe).toHaveLength(8)
    expect(habitatsArcaNoe.every(({ quantidade }) => quantidade >= 2)).toBe(true)
    expect(new Set(habitatsArcaNoe.map(({ unidadeId }) => unidadeId)).size).toBe(8)
  })

  it('mantém o puzzle fechado antes de M5, decorativo até M8 e vazio em M9', () => {
    const elefantes = habitatsArcaNoe[0]
    const jogador = {
      x: elefantes.posicaoEspera[0],
      y: elefantes.posicaoEspera[1],
      z: elefantes.posicaoEspera[2],
    }

    expect(habitatsArcaNoeVisiveis('conducao-animais')).toBe(false)
    expect(habitatsArcaNoeVisiveis('acomodacao-animais')).toBe(true)
    expect(habitatsArcaNoeVisiveis('fechamento-porta')).toBe(true)
    expect(habitatsArcaNoeVisiveis('retorno-pomba')).toBe(true)
    expect(habitatsArcaNoeVisiveis('nova-terra-arco-iris')).toBe(false)
    expect(
      resolverCandidatoHabitatArcaNoe(
        jogador,
        'conducao-animais',
        [],
        null,
      ),
    ).toBeNull()
    expect(
      resolverCandidatoHabitatArcaNoe(
        jogador,
        'fechamento-porta',
        [],
        null,
      ),
    ).toBeNull()
  })

  it('mantém ovelhas e zebras dentro do convés inferior antes do desembarque', () => {
    const ovelhas = habitatsArcaNoe.find(({ id }) => id === 'ovelhas')
    const zebras = habitatsArcaNoe.find(({ id }) => id === 'zebras')

    expect(ovelhas?.posicaoHabitat[2]).toBeCloseTo(-27.6)
    expect(zebras?.posicaoHabitat[2]).toBeCloseTo(-27.6)
  })

  it('faz seleção, encaixe somente no habitat correto e devolução amigável', () => {
    const elefantes = habitatsArcaNoe[0]
    const zebras = habitatsArcaNoe.find(({ id }) => id === 'zebras')
    if (!zebras) throw new Error('habitat de zebras obrigatório ausente')

    expect(
      resolverCandidatoHabitatArcaNoe(
        {
          x: elefantes.posicaoEspera[0],
          y: elefantes.posicaoEspera[1],
          z: elefantes.posicaoEspera[2],
        },
        'acomodacao-animais',
        [],
        null,
      ),
    ).toMatchObject({
      familiaId: 'elefantes',
      etapaInteracao: 'selecionar-familia',
    })

    expect(
      resolverCandidatoHabitatArcaNoe(
        {
          x: zebras.posicaoHabitat[0],
          y: zebras.posicaoHabitat[1],
          z: zebras.posicaoHabitat[2],
        },
        'acomodacao-animais',
        [],
        'elefantes',
      ),
    ).toBeNull()

    expect(
      resolverCandidatoHabitatArcaNoe(
        {
          x: elefantes.posicaoHabitat[0],
          y: elefantes.posicaoHabitat[1],
          z: elefantes.posicaoHabitat[2],
        },
        'acomodacao-animais',
        [],
        'elefantes',
      ),
    ).toMatchObject({
      acaoId: 'noe.habitat.grandes-animais-preparado',
      unidadeId: 'nivel-inferior-elefantes',
      etapaInteracao: 'encaixar-habitat',
    })

    expect(
      resolverCandidatoHabitatArcaNoe(
        {
          x: elefantes.posicaoEspera[0],
          y: elefantes.posicaoEspera[1],
          z: elefantes.posicaoEspera[2],
        },
        'acomodacao-animais',
        [],
        'elefantes',
      ),
    ).toMatchObject({ etapaInteracao: 'devolver-familia' })
  })

  it('reconstrói famílias descansando pelo checkpoint e por avanço de momento', () => {
    const progresso: readonly ProgressoAcaoNoe[] = [
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadesConcluidas: [
          'nivel-inferior-elefantes',
          'nivel-inferior-elefantes',
          'unidade-inexistente',
        ],
      },
    ]
    const durante = descreverEstadoHabitatsArcaNoe(
      'acomodacao-animais',
      progresso,
      null,
    )
    const depois = descreverEstadoHabitatsArcaNoe(
      'fechamento-porta',
      [],
      null,
    )

    expect(
      durante.find(({ descritor }) => descritor.id === 'elefantes'),
    ).toMatchObject({
      concluido: true,
      mostrarNaEspera: false,
      mostrarDescansando: true,
    })
    expect(
      durante.find(({ descritor }) => descritor.id === 'girafas'),
    ).toMatchObject({
      concluido: false,
      mostrarNaEspera: true,
      mostrarDescansando: false,
    })
    expect(depois.every(({ concluido }) => concluido)).toBe(true)
    expect(depois.every(({ mostrarDescansando }) => mostrarDescansando)).toBe(
      true,
    )
  })

  it('não republica uma família já acomodada como opção de seleção', () => {
    const elefantes = habitatsArcaNoe[0]
    const progresso: readonly ProgressoAcaoNoe[] = [
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadesConcluidas: ['nivel-inferior-elefantes'],
      },
    ]

    expect(
      resolverCandidatoHabitatArcaNoe(
        {
          x: elefantes.posicaoEspera[0],
          y: elefantes.posicaoEspera[1],
          z: elefantes.posicaoEspera[2],
        },
        'acomodacao-animais',
        progresso,
        null,
      ),
    ).toBeNull()
  })
})
