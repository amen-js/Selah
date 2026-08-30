import { describe, expect, it } from 'vitest'
import { momentoNoePorId } from '../progression/catalogo'
import type { ProgressoAcaoNoe } from '../progression/types'
import {
  colisoresArcaCanteiroNoe,
  descreverTarefasCanteiroNoe,
  estruturaArcaCanteiroNoe,
  estruturaRampaCanteiroNoe,
  instanciasRelevoValeNoe,
  obterTarefasDisponiveisCanteiroNoe,
  resolverCandidatoTarefaCanteiroNoe,
  selecionarInstanciasAssetsCanteiroNoe,
  tarefasCanteiroNoe,
} from './canteiro'
import { obterAssetNoe } from './assets'

const madeirasConcluidas: readonly ProgressoAcaoNoe[] = [
  {
    acaoId: 'noe.madeira.coletada',
    unidadesConcluidas: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
  },
]

const rampaConcluida: readonly ProgressoAcaoNoe[] = [
  ...madeirasConcluidas,
  {
    acaoId: 'noe.rampa.reparada',
    unidadesConcluidas: ['rampa-principal'],
  },
]

describe('canteiro navegável de Noé', () => {
  it('usa somente colisores cuboid compostos e mantém o interior transitável', () => {
    expect(colisoresArcaCanteiroNoe).toHaveLength(8)
    expect(
      colisoresArcaCanteiroNoe.every(({ tipo }) => tipo === 'cuboid'),
    ).toBe(true)
    expect(estruturaArcaCanteiroNoe.interior.larguraLivre).toBeGreaterThan(8)
    expect(estruturaArcaCanteiroNoe.interior.comprimentoLivre).toBeGreaterThan(
      20,
    )
    expect(estruturaArcaCanteiroNoe.interior.alturaLivre).toBeGreaterThan(3)
  })

  it('deixa uma porta física infantil maior que 1.6 m por 2.2 m', () => {
    const { entrada } = estruturaArcaCanteiroNoe
    expect(entrada.larguraLivre).toBeGreaterThanOrEqual(1.6)
    expect(entrada.alturaLivre).toBeGreaterThanOrEqual(2.2)

    const lateraisFrontais = colisoresArcaCanteiroNoe.filter(({ id }) =>
      id.startsWith('arca-frente-'),
    )
    const limiteDireitoEsquerda = Math.max(
      ...lateraisFrontais
        .filter(({ posicao }) => posicao[0] < 0)
        .map(({ posicao, meiaExtensao }) => posicao[0] + meiaExtensao[0]),
    )
    const limiteEsquerdoDireita = Math.min(
      ...lateraisFrontais
        .filter(({ posicao }) => posicao[0] > 0)
        .map(({ posicao, meiaExtensao }) => posicao[0] - meiaExtensao[0]),
    )

    expect(limiteEsquerdoDireita - limiteDireitoEsquerda).toBeCloseTo(
      entrada.larguraLivre,
    )
    const verga = colisoresArcaCanteiroNoe.find(
      ({ id }) => id === 'arca-verga-entrada',
    )
    expect(
      (verga?.posicao[1] ?? 0) - (verga?.meiaExtensao[1] ?? 0),
    ).toBeCloseTo(estruturaArcaCanteiroNoe.espessuraPiso + entrada.alturaLivre)
  })

  it('alinha a rampa larga à entrada com inclinação suave', () => {
    const rampa = estruturaRampaCanteiroNoe
    const frenteArcaZ =
      estruturaArcaCanteiroNoe.posicao[2] +
      estruturaArcaCanteiroNoe.comprimento / 2
    const meiaEspessura = rampa.colisor.meiaExtensao[1]
    const meioComprimento = rampa.comprimento / 2
    const topoRampaY =
      rampa.colisor.posicao[1] +
      Math.sin(rampa.inclinacaoRadianos) * meioComprimento +
      Math.cos(rampa.inclinacaoRadianos) * meiaEspessura
    const topoRampaZ =
      rampa.colisor.posicao[2] -
      Math.cos(rampa.inclinacaoRadianos) * meioComprimento +
      Math.sin(rampa.inclinacaoRadianos) * meiaEspessura
    const baseRampaY =
      rampa.colisor.posicao[1] -
      Math.sin(rampa.inclinacaoRadianos) * meioComprimento +
      Math.cos(rampa.inclinacaoRadianos) * meiaEspessura

    expect(rampa.largura).toBeGreaterThanOrEqual(2.4)
    expect(rampa.inclinacaoGraus).toBeLessThan(10)
    expect(topoRampaZ).toBeCloseTo(frenteArcaZ, 5)
    expect(topoRampaY).toBeCloseTo(estruturaArcaCanteiroNoe.espessuraPiso, 5)
    expect(baseRampaY).toBeCloseTo(0, 5)
    expect(rampa.colisor.tipo).toBe('cuboid')
  })

  it('usa o morro apenas como moldura visual distante da rota central', () => {
    const morro = obterAssetNoe('vale-pedra-morro')
    if (!morro) throw new Error('morro obrigatório ausente')

    expect(instanciasRelevoValeNoe).toHaveLength(6)
    expect(new Set(instanciasRelevoValeNoe.map(({ id }) => id)).size).toBe(6)
    expect(morro.colisor).toEqual({ tipo: 'nenhum' })

    for (const instancia of instanciasRelevoValeNoe) {
      const meiaLargura =
        (morro.fallback.dimensoes[0] / 2) * (instancia.escala ?? 1)
      expect(instancia.assetId).toBe('vale-pedra-morro')
      expect(instancia.chunkId).toBe('canteiro-m1')
      expect(Math.abs(instancia.posicao[0]) - meiaLargura).toBeGreaterThan(30)
      expect(instancia.unidadeId).toBeUndefined()
    }
  })

  it('espelha exatamente as unidades allowlisted de M1 e M2', () => {
    for (const momentoId of ['chamado-canteiro', 'coleta-vedacao'] as const) {
      const catalogo = momentoNoePorId.get(momentoId)
      const esperadas =
        catalogo?.gatilhoConclusao.tarefas.flatMap((tarefa) =>
          tarefa.unidadesNecessarias.map(
            (unidadeId) => `${tarefa.acaoId}:${unidadeId}`,
          ),
        ) ?? []
      const descritas = tarefasCanteiroNoe
        .filter((tarefa) => tarefa.momentoId === momentoId)
        .map((tarefa) => `${tarefa.acaoId}:${tarefa.unidadeId}`)

      expect(descritas).toEqual(esperadas)
    }
  })

  it('mostra M1 sozinho e libera M2 em 4 tábuas, rampa e 3 fendas', () => {
    expect(
      obterTarefasDisponiveisCanteiroNoe('chamado-canteiro', []).map(
        ({ unidadeId }) => unidadeId,
      ),
    ).toEqual(['chamado-noe'])
    expect(
      obterTarefasDisponiveisCanteiroNoe('coleta-vedacao', []).map(
        ({ unidadeId }) => unidadeId,
      ),
    ).toEqual(['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'])
    expect(
      obterTarefasDisponiveisCanteiroNoe(
        'coleta-vedacao',
        madeirasConcluidas,
      ).map(({ unidadeId }) => unidadeId),
    ).toEqual(['rampa-principal'])
    expect(
      obterTarefasDisponiveisCanteiroNoe('coleta-vedacao', rampaConcluida).map(
        ({ unidadeId }) => unidadeId,
      ),
    ).toEqual(['fenda-casco-1', 'fenda-casco-2', 'fenda-casco-3'])
  })

  it('marca tarefas prematuras como bloqueadas e concluídas como não acionáveis', () => {
    const inicial = descreverTarefasCanteiroNoe('coleta-vedacao', [])
    expect(
      inicial.find(({ unidadeId }) => unidadeId === 'rampa-principal')?.estado,
    ).toBe('bloqueada')
    expect(
      inicial.find(({ unidadeId }) => unidadeId === 'fenda-casco-1')?.estado,
    ).toBe('bloqueada')

    const comUmaTabua = descreverTarefasCanteiroNoe('coleta-vedacao', [
      {
        acaoId: 'noe.madeira.coletada',
        unidadesConcluidas: ['tabua-1'],
      },
    ])
    expect(
      comUmaTabua.find(({ unidadeId }) => unidadeId === 'tabua-1')?.estado,
    ).toBe('concluida')
    expect(
      comUmaTabua.find(({ unidadeId }) => unidadeId === 'tabua-2')?.estado,
    ).toBe('disponivel')
  })

  it('publica apenas a tarefa atual dentro do raio e nunca eventos futuros', () => {
    const proximo = resolverCandidatoTarefaCanteiroNoe(
      { x: -15, y: 0.45, z: 11 },
      'coleta-vedacao',
      [],
    )
    expect(proximo).toMatchObject({
      acaoId: 'noe.madeira.coletada',
      unidadeId: 'tabua-1',
      estado: 'disponivel',
      prioridade: 300,
    })

    expect(
      resolverCandidatoTarefaCanteiroNoe(
        { x: 0, y: 0.65, z: 4 },
        'coleta-vedacao',
        [],
      ),
    ).toBeNull()
    expect(
      resolverCandidatoTarefaCanteiroNoe(
        { x: -15, y: 0.45, z: 11 },
        'estoque-mantimentos',
        [],
      ),
    ).toBeNull()
  })

  it('monta chunks cumulativos sem carregar madeira em M1', () => {
    const m1 = selecionarInstanciasAssetsCanteiroNoe('chamado-canteiro', [])
    const m2 = selecionarInstanciasAssetsCanteiroNoe('coleta-vedacao', [])
    const comTabuaColetada = selecionarInstanciasAssetsCanteiroNoe(
      'coleta-vedacao',
      [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesConcluidas: ['tabua-1'],
        },
      ],
    )

    expect(new Set(m1.map(({ chunkId }) => chunkId))).toEqual(
      new Set(['canteiro-m1']),
    )
    expect(new Set(m2.map(({ chunkId }) => chunkId))).toEqual(
      new Set(['canteiro-m1', 'canteiro-m2']),
    )
    expect(m2.map(({ unidadeId }) => unidadeId).filter(Boolean)).toEqual([
      'tabua-1',
      'tabua-2',
      'tabua-3',
      'tabua-4',
    ])
    expect(
      comTabuaColetada.some(({ unidadeId }) => unidadeId === 'tabua-1'),
    ).toBe(false)
  })
})
