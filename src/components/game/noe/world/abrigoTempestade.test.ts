import { describe, expect, it } from 'vitest'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from '../progression/types'
import {
  descreverTarefasAbrigoTempestadeNoe,
  gerarGotasChuvaExteriorNoe,
  obterEstadoVisualAbrigoNoe,
  posicaoForaDaArcaNoe,
  projetarAtmosferaNoe,
  resolverCandidatoAbrigoTempestadeNoe,
  tarefasAbrigoTempestadeNoe,
} from './abrigoTempestade'

const ateM5: readonly MomentoNoeId[] = [
  'chamado-canteiro',
  'coleta-vedacao',
  'estoque-mantimentos',
  'conducao-animais',
  'acomodacao-animais',
]

function estadoNoMomento(
  momentoAtualId: MomentoNoeId,
  momentosConcluidos: readonly MomentoNoeId[],
  progressoMomentoAtual: readonly ProgressoAcaoNoe[] = [],
): EstadoProgressaoNoe {
  return {
    momentoAtualId,
    momentosConcluidos,
    progressoMomentoAtual,
    concluida: false,
  }
}

function progresso(
  acaoId: AcaoNoeId,
  ...unidadesConcluidas: string[]
): ProgressoAcaoNoe {
  return { acaoId, unidadesConcluidas }
}

const chamado = progresso(
  'noe.abrigo.chamado-ouvido',
  'chamado-final-noe',
)
const entrada = progresso(
  'noe.abrigo.entrada-concluida',
  'entrada-segura-na-arca',
)
const porta = progresso(
  'noe.porta.fechada',
  'porta-da-arca-fechada',
)

describe('abrigo e tempestade de Noé', () => {
  it('espelha exatamente as seis unidades canônicas de M6 e M7', () => {
    expect(
      tarefasAbrigoTempestadeNoe.map(
        ({ acaoId, unidadeId }) => `${acaoId}:${unidadeId}`,
      ),
    ).toEqual([
      'noe.abrigo.chamado-ouvido:chamado-final-noe',
      'noe.abrigo.entrada-concluida:entrada-segura-na-arca',
      'noe.porta.fechada:porta-da-arca-fechada',
      'noe.cuidado.filhotes-aves:filhotes-aves-alimentados',
      'noe.cuidado.filhotes-herbivoros:filhotes-herbivoros-alimentados',
      'noe.cuidado.filhotes-mamiferos:filhotes-mamiferos-alimentados',
    ])
  })

  it('mantém a sequência segura chamado, entrada e somente então porta', () => {
    const inicial = estadoNoMomento('fechamento-porta', ateM5)
    expect(
      descreverTarefasAbrigoTempestadeNoe(inicial)
        .filter(({ momentoId }) => momentoId === 'fechamento-porta')
        .map(({ unidadeId, estado }) => [unidadeId, estado]),
    ).toEqual([
      ['chamado-final-noe', 'disponivel'],
      ['entrada-segura-na-arca', 'bloqueada'],
      ['porta-da-arca-fechada', 'bloqueada'],
    ])
    expect(
      resolverCandidatoAbrigoTempestadeNoe(
        { x: 0, y: 0.75, z: -5.2 },
        inicial,
      ),
    ).toBeNull()

    const comChamado = estadoNoMomento('fechamento-porta', ateM5, [chamado])
    expect(
      resolverCandidatoAbrigoTempestadeNoe(
        { x: 0, y: 0.75, z: -5.2 },
        comChamado,
      ),
    ).toMatchObject({
      acaoId: 'noe.abrigo.entrada-concluida',
      unidadeId: 'entrada-segura-na-arca',
    })

    const comEntrada = estadoNoMomento('fechamento-porta', ateM5, [
      chamado,
      entrada,
    ])
    expect(
      resolverCandidatoAbrigoTempestadeNoe(
        { x: 0, y: 1.05, z: -3.35 },
        comEntrada,
      ),
    ).toMatchObject({
      acaoId: 'noe.porta.fechada',
      unidadeId: 'porta-da-arca-fechada',
    })
  })

  it('libera os três cuidados de M7 em paralelo, sem repetição individual', () => {
    const m7 = estadoNoMomento('refugio-tempestade', [
      ...ateM5,
      'fechamento-porta',
    ])
    expect(
      descreverTarefasAbrigoTempestadeNoe(m7)
        .filter(({ momentoId }) => momentoId === 'refugio-tempestade')
        .map(({ estado }) => estado),
    ).toEqual(['disponivel', 'disponivel', 'disponivel'])

    const avesConcluidas = estadoNoMomento(
      'refugio-tempestade',
      [...ateM5, 'fechamento-porta'],
      [
        progresso(
          'noe.cuidado.filhotes-aves',
          'filhotes-aves-alimentados',
        ),
      ],
    )
    const tarefas = descreverTarefasAbrigoTempestadeNoe(avesConcluidas).filter(
      ({ momentoId }) => momentoId === 'refugio-tempestade',
    )

    expect(tarefas.map(({ estado }) => estado)).toEqual([
      'concluida',
      'disponivel',
      'disponivel',
    ])
    expect(
      resolverCandidatoAbrigoTempestadeNoe(
        { x: -3.65, y: 4.42, z: -24 },
        avesConcluidas,
      ),
    ).toBeNull()
  })

  it.each([
    [
      'chamado-canteiro',
      [] as readonly MomentoNoeId[],
      0,
      0,
      false,
    ],
    [
      'estoque-mantimentos',
      ['chamado-canteiro', 'coleta-vedacao'] as readonly MomentoNoeId[],
      33,
      0.33,
      false,
    ],
    [
      'acomodacao-animais',
      [
        'chamado-canteiro',
        'coleta-vedacao',
        'estoque-mantimentos',
        'conducao-animais',
      ] as readonly MomentoNoeId[],
      66,
      0.66,
      false,
    ],
    ['fechamento-porta', ateM5, 100, 1, false],
  ] as const)(
    'projeta os marcos de clima em %s sem chuva precoce',
    (momentoAtualId, concluidos, percentual, densidade, chuva) => {
      expect(
        projetarAtmosferaNoe(
          estadoNoMomento(momentoAtualId, concluidos),
        ),
      ).toMatchObject({
        percentualPreparacao: percentual,
        densidadeNuvens: densidade,
        chuvaExteriorAtiva: chuva,
      })
    },
  )

  it('só ativa chuva depois da entrada e da porta segura, sempre fora da arca', () => {
    const antesDaPorta = estadoNoMomento('fechamento-porta', ateM5, [
      chamado,
      entrada,
    ])
    const depoisDaPorta = estadoNoMomento('fechamento-porta', ateM5, [
      chamado,
      entrada,
      porta,
    ])

    expect(projetarAtmosferaNoe(antesDaPorta).chuvaExteriorAtiva).toBe(false)
    expect(projetarAtmosferaNoe(depoisDaPorta).chuvaExteriorAtiva).toBe(true)

    const gotas = gerarGotasChuvaExteriorNoe(96, 42)
    expect(gotas).toHaveLength(96)
    expect(gotas.every(posicaoForaDaArcaNoe)).toBe(true)
    expect(gerarGotasChuvaExteriorNoe(96, 42)).toEqual(gotas)
  })

  it('reconstrói porta e alimentação pelo checkpoint ao remontar a cena', () => {
    const m7ComAves = estadoNoMomento(
      'refugio-tempestade',
      [...ateM5, 'fechamento-porta'],
      [
        progresso(
          'noe.cuidado.filhotes-aves',
          'filhotes-aves-alimentados',
        ),
      ],
    )
    const projecaoInicial = obterEstadoVisualAbrigoNoe(m7ComAves)
    const projecaoRemontada = obterEstadoVisualAbrigoNoe({ ...m7ComAves })

    expect(projecaoRemontada).toEqual(projecaoInicial)
    expect(projecaoRemontada).toMatchObject({
      porta: 'fechada',
      interiorAcolhedor: true,
      cuidadosConcluidos: ['filhotes-aves'],
    })

    const m8 = estadoNoMomento('retorno-pomba', [
      ...ateM5,
      'fechamento-porta',
      'refugio-tempestade',
    ])
    expect(obterEstadoVisualAbrigoNoe(m8)).toMatchObject({
      porta: 'fechada',
      cuidadosConcluidos: [
        'filhotes-aves',
        'filhotes-herbivoros',
        'filhotes-mamiferos',
      ],
    })
    expect(projetarAtmosferaNoe(m8)).toMatchObject({
      densidadeNuvens: 0.22,
      intensidadeVento: 0.12,
      corCeu: '#9bcfdd',
      chuvaExteriorAtiva: false,
    })

    const m9 = estadoNoMomento('nova-terra-arco-iris', [
      ...ateM5,
      'fechamento-porta',
      'refugio-tempestade',
      'retorno-pomba',
    ])
    expect(obterEstadoVisualAbrigoNoe(m9).porta).toBe('aberta')
    expect(projetarAtmosferaNoe(m9)).toMatchObject({
      densidadeNuvens: 0,
      intensidadeVento: 0,
      corCeu: '#91d8ec',
      chuvaExteriorAtiva: false,
    })
  })
})
