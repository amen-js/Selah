import { mapaCriacao } from './criacao'

const referenciasEsperadas = ['GEN.1.1', 'GEN.1.3', 'GEN.1.11', 'GEN.1.20', 'GEN.1.27']

describe('mapa da criação', () => {
  it('contém exatamente cinco colecionáveis', () => {
    expect(mapaCriacao.coletaveis).toHaveLength(5)
  })

  it('mantém IDs únicos em props e colecionáveis', () => {
    const ids = [...mapaCriacao.props, ...mapaCriacao.coletaveis].map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mantém spawn e entidades dentro dos limites do mundo', () => {
    const entidades = [
      { id: 'spawn', posicao: mapaCriacao.spawn },
      ...mapaCriacao.props,
      ...mapaCriacao.coletaveis,
    ]

    for (const entidade of entidades) {
      expect(entidade.posicao[0]).toBeGreaterThanOrEqual(-mapaCriacao.limites.meiaLargura)
      expect(entidade.posicao[0]).toBeLessThanOrEqual(mapaCriacao.limites.meiaLargura)
      expect(entidade.posicao[2]).toBeGreaterThanOrEqual(-mapaCriacao.limites.meiaProfundidade)
      expect(entidade.posicao[2]).toBeLessThanOrEqual(mapaCriacao.limites.meiaProfundidade)
    }
  })

  it('define raio de ativação positivo para cada colecionável', () => {
    for (const coletavel of mapaCriacao.coletaveis) {
      expect(coletavel.raioAtivacao).toBeDefined()
      expect(coletavel.raioAtivacao).toBeGreaterThan(0)
    }
  })

  it('associa cada colecionável à história e passagem técnica esperadas', () => {
    expect(mapaCriacao.coletaveis.every(({ historiaId }) => historiaId === 'criacao')).toBe(true)
    expect(mapaCriacao.coletaveis.map(({ passagemId }) => passagemId)).toEqual(referenciasEsperadas)
  })
})
