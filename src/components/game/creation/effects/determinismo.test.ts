import { describe, expect, it } from 'vitest'
import {
  criarPrng,
  gerarDefinicoesNuvens,
  gerarMarcadoresCaminhoLuz,
  gerarParticulasCrescimento,
  gerarPontosAmbienteVazio,
  gerarPontosEstrelas,
} from './configuracao'

describe('determinismo e limites dos geradores de efeitos procedurais', () => {
  it('PRNG Mulberry32 produz sequencia deterministica exata para mesma semente', () => {
    const prng1 = criarPrng(42)
    const prng2 = criarPrng(42)

    const seq1 = [prng1(), prng1(), prng1(), prng1(), prng1()]
    const seq2 = [prng2(), prng2(), prng2(), prng2(), prng2()]

    expect(seq1).toEqual(seq2)
    for (const val of seq1) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('gerarPontosAmbienteVazio gera exatamente 48 particulas deterministicas e dentro dos limites', () => {
    const pontos1 = gerarPontosAmbienteVazio(48, 1001)
    const pontos2 = gerarPontosAmbienteVazio(48, 1001)

    expect(pontos1).toEqual(pontos2)
    expect(pontos1.length).toBe(48)

    for (const p of pontos1) {
      expect(p.x).toBeGreaterThanOrEqual(-14)
      expect(p.x).toBeLessThanOrEqual(14)
      expect(p.y).toBeGreaterThanOrEqual(0.3)
      expect(p.y).toBeLessThanOrEqual(5.5)
      expect(p.z).toBeGreaterThanOrEqual(-14)
      expect(p.z).toBeLessThanOrEqual(14)
      expect(p.velocidade).toBeGreaterThanOrEqual(0.03)
      expect(p.velocidade).toBeLessThanOrEqual(0.06)
      expect(p.tamanho).toBeGreaterThanOrEqual(0.09)
      expect(p.tamanho).toBeLessThanOrEqual(0.14)
    }
  })

  it('gerarMarcadoresCaminhoLuz gera 8 pontos fixos no piso', () => {
    const marcadores1 = gerarMarcadoresCaminhoLuz()
    const marcadores2 = gerarMarcadoresCaminhoLuz()

    expect(marcadores1).toEqual(marcadores2)
    expect(marcadores1.length).toBe(8)

    for (const [x, y, z] of marcadores1) {
      expect(typeof x).toBe('number')
      expect(y).toBe(0.03) // Above floor to avoid z-fighting
      expect(typeof z).toBe('number')
    }
  })

  it('gerarParticulasCrescimento gera 28 particulas deterministicas', () => {
    const particulas1 = gerarParticulasCrescimento(28, 2002)
    const particulas2 = gerarParticulasCrescimento(28, 2002)

    expect(particulas1).toEqual(particulas2)
    expect(particulas1.length).toBe(28)

    for (const part of particulas1) {
      expect(part.origem.length).toBe(3)
      expect(part.deslocamento.length).toBe(3)
      expect(part.velocidade).toBeGreaterThanOrEqual(0.4)
      expect(part.velocidade).toBeLessThanOrEqual(0.7)
      expect(part.corIndex).toBeGreaterThanOrEqual(0)
      expect(part.corIndex).toBeLessThanOrEqual(2)
    }
  })

  it('gerarPontosEstrelas gera 140 estrelas na cupula hemisferica superior', () => {
    const raio = 42
    const estrelas1 = gerarPontosEstrelas(140, raio, 3003)
    const estrelas2 = gerarPontosEstrelas(140, raio, 3003)

    expect(estrelas1).toEqual(estrelas2)
    expect(estrelas1.length).toBe(140)

    for (const e of estrelas1) {
      // Must be above horizon (y > 0)
      expect(e.y).toBeGreaterThan(0)

      // Radius distance close to sphere radius (accounting for floating point)
      const dist = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z)
      expect(Math.abs(dist - raio)).toBeLessThan(0.001)

      expect(e.tamanho).toBeGreaterThanOrEqual(0.11)
      expect(e.tamanho).toBeLessThanOrEqual(0.16)
      expect(e.brilhoBase).toBeGreaterThanOrEqual(0.65)
      expect(e.brilhoBase).toBeLessThanOrEqual(1.0)
    }
  })

  it('gerarDefinicoesNuvens gera 6 agrupamentos determinísticos de nuvens', () => {
    const nuvens = gerarDefinicoesNuvens()
    expect(nuvens.length).toBe(6)

    for (const n of nuvens) {
      expect(n.posicao[1]).toBeGreaterThanOrEqual(14) // Cloud height
      expect(n.escala[0]).toBeGreaterThan(0)
      expect(n.escala[1]).toBeGreaterThan(0)
      expect(n.escala[2]).toBeGreaterThan(0)
      expect(n.velocidade).toBeGreaterThan(0.2)
    }
  })
})
