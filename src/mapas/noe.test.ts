import { mapaNoe } from './noe'
import { portaisPorRegiao } from './portais'
import {
  estruturaArcaCanteiroNoe,
  estruturaRampaCanteiroNoe,
  instanciasRelevoValeNoe,
  tarefasCanteiroNoe,
} from '../components/game/noe/world/canteiro'
import { obterAssetNoe } from '../components/game/noe/world/assets'

const referenciasEsperadas = [
  'genesis-6-14',
  'genesis-6-19',
  'genesis-7-1',
  'genesis-8-1',
  'genesis-9-13',
]
const RAIO_LIVRE_SPAWN = 6

describe('mapa de Noé', () => {
  it('contém exatamente cinco colecionáveis', () => {
    expect(mapaNoe.coletaveis).toHaveLength(5)
  })

  it('expande o vale para uma escala navegável', () => {
    expect(mapaNoe.limites.meiaLargura * 2).toBeGreaterThanOrEqual(90)
    expect(mapaNoe.limites.meiaProfundidade * 2).toBeGreaterThanOrEqual(90)
  })

  it('remove os placeholders sólidos de arca, rampa e madeira interativa', () => {
    expect(
      mapaNoe.props.some(({ id }) => /arca|rampa|madeira/.test(id)),
    ).toBe(false)
    expect(mapaNoe.props.every(({ collider }) => collider === false)).toBe(true)
    expect(mapaNoe.props.every(({ modelo }) => modelo === undefined)).toBe(true)
  })

  it('mantém IDs únicos em props e colecionáveis', () => {
    const ids = [...mapaNoe.props, ...mapaNoe.coletaveis].map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mantém spawn e entidades dentro dos limites do mundo', () => {
    const entidades = [
      { id: 'spawn', posicao: mapaNoe.spawn },
      ...mapaNoe.props,
      ...mapaNoe.coletaveis,
    ]

    for (const entidade of entidades) {
      expect(entidade.posicao[0]).toBeGreaterThanOrEqual(-mapaNoe.limites.meiaLargura)
      expect(entidade.posicao[0]).toBeLessThanOrEqual(mapaNoe.limites.meiaLargura)
      expect(entidade.posicao[2]).toBeGreaterThanOrEqual(-mapaNoe.limites.meiaProfundidade)
      expect(entidade.posicao[2]).toBeLessThanOrEqual(mapaNoe.limites.meiaProfundidade)
    }
  })

  it('mantém a arca, a rampa e todas as tarefas dentro do vale', () => {
    const arca = estruturaArcaCanteiroNoe
    const pontos = [
      ...tarefasCanteiroNoe.map(({ posicao }) => posicao),
      arca.posicao,
      estruturaRampaCanteiroNoe.colisor.posicao,
    ]

    for (const posicao of pontos) {
      expect(Math.abs(posicao[0])).toBeLessThan(mapaNoe.limites.meiaLargura)
      expect(Math.abs(posicao[2])).toBeLessThan(mapaNoe.limites.meiaProfundidade)
    }

    expect(
      Math.abs(arca.posicao[2]) + arca.comprimento / 2,
    ).toBeLessThan(mapaNoe.limites.meiaProfundidade)
  })

  it('define raio de ativação positivo para cada colecionável', () => {
    for (const coletavel of mapaNoe.coletaveis) {
      expect(coletavel.raioAtivacao).toBeDefined()
      expect(coletavel.raioAtivacao).toBeGreaterThan(0)
    }
  })

  it('mantém uma zona livre de colecionáveis ao redor do spawn', () => {
    for (const coletavel of mapaNoe.coletaveis) {
      const distanciaHorizontal = Math.hypot(
        coletavel.posicao[0] - mapaNoe.spawn[0],
        coletavel.posicao[2] - mapaNoe.spawn[2],
      )

      expect(distanciaHorizontal).toBeGreaterThanOrEqual(RAIO_LIVRE_SPAWN)
    }
  })

  it('mantém spawn e portal livres do canteiro e um do outro', () => {
    const portal = portaisPorRegiao.noe[0]
    expect(portal).toBeDefined()
    if (!portal) return

    const distanciaSpawnPortal = Math.hypot(
      portal.posicao[0] - mapaNoe.spawn[0],
      portal.posicao[2] - mapaNoe.spawn[2],
    )
    expect(distanciaSpawnPortal).toBeGreaterThan(10)

    for (const tarefa of tarefasCanteiroNoe) {
      const distanciaPortalTarefa = Math.hypot(
        portal.posicao[0] - tarefa.posicao[0],
        portal.posicao[2] - tarefa.posicao[2],
      )
      const distanciaSpawnTarefa = Math.hypot(
        mapaNoe.spawn[0] - tarefa.posicao[0],
        mapaNoe.spawn[2] - tarefa.posicao[2],
      )

      expect(distanciaPortalTarefa).toBeGreaterThan(tarefa.raio + 5)
      expect(distanciaSpawnTarefa).toBeGreaterThan(tarefa.raio + 5)
    }

    const morro = obterAssetNoe('vale-pedra-morro')
    if (!morro) throw new Error('morro obrigatório ausente')
    for (const instancia of instanciasRelevoValeNoe) {
      const raioVisual =
        (Math.max(
          morro.fallback.dimensoes[0],
          morro.fallback.dimensoes[2],
        ) /
          2) *
        (instancia.escala ?? 1)
      const distanciaPortalMorro = Math.hypot(
        portal.posicao[0] - instancia.posicao[0],
        portal.posicao[2] - instancia.posicao[2],
      )

      expect(distanciaPortalMorro).toBeGreaterThan(
        raioVisual + portal.raioAtivacao + 2,
      )
    }
  })

  it('associa cada colecionável a Noé e às cinco passagens do recorte', () => {
    expect(mapaNoe.coletaveis.every(({ historiaId }) => historiaId === 'noe')).toBe(true)
    expect(mapaNoe.coletaveis.map(({ passagemId }) => passagemId)).toEqual(referenciasEsperadas)
  })

  it('posiciona os Selahs de cuidado dentro da Arca e o final na nova terra', () => {
    const porPassagem = new Map(
      mapaNoe.coletaveis.map((coletavel) => [coletavel.passagemId, coletavel]),
    )
    const dentroDaArca = ['genesis-6-19', 'genesis-7-1', 'genesis-8-1']

    for (const passagemId of dentroDaArca) {
      const coletavel = porPassagem.get(passagemId)
      expect(coletavel).toBeDefined()
      if (!coletavel) continue
      expect(Math.abs(coletavel.posicao[0])).toBeLessThan(
        estruturaArcaCanteiroNoe.largura / 2,
      )
      expect(coletavel.posicao[2]).toBeGreaterThan(
        estruturaArcaCanteiroNoe.posicao[2] -
          estruturaArcaCanteiroNoe.comprimento / 2,
      )
      expect(coletavel.posicao[2]).toBeLessThan(
        estruturaArcaCanteiroNoe.posicao[2] +
          estruturaArcaCanteiroNoe.comprimento / 2,
      )
    }

    expect(porPassagem.get('genesis-9-13')?.posicao[2]).toBeLessThan(-30)
  })
})
