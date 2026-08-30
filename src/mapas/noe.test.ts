import { mapaNoe } from './noe'

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

  it('usa somente props geométricos fallback para o recorte', () => {
    expect(mapaNoe.props.every(({ modelo }) => modelo === undefined)).toBe(true)
    expect(new Set(mapaNoe.props.map(({ fallback }) => fallback.forma))).toEqual(
      new Set(['caixa', 'cilindro', 'esfera']),
    )
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

  it('associa cada colecionável a Noé e às cinco passagens do recorte', () => {
    expect(mapaNoe.coletaveis.every(({ historiaId }) => historiaId === 'noe')).toBe(true)
    expect(mapaNoe.coletaveis.map(({ passagemId }) => passagemId)).toEqual(referenciasEsperadas)
  })
})
