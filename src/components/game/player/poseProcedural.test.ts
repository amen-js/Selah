import { describe, expect, it } from 'vitest'
import { calcularPoseProcedural } from './poseProcedural'

describe('pose procedural do personagem', () => {
  it('mantém os braços relaxados e as pernas neutras parado', () => {
    const pose = calcularPoseProcedural({
      fase: Math.PI / 2,
      pesoMovimento: 0,
      pesoChao: 1,
      intensidadeCorrida: 0,
      tempo: 0,
    })

    expect(pose.bracoEsquerdoX).toBeCloseTo(1.48)
    expect(pose.bracoDireitoX).toBeCloseTo(1.48)
    expect(Math.abs(Math.cos(pose.bracoEsquerdoX))).toBeLessThan(0.1)
    expect(pose.antebracoEsquerdoZ).toBeGreaterThan(0)
    expect(pose.antebracoDireitoZ).toBeLessThan(0)
    expect(pose.coxaEsquerdaX).toBe(0)
    expect(pose.coxaDireitaX).toBe(0)
    expect(pose.deslocamentoY).toBe(0)
  })

  it('alterna braços e pernas opostos durante a caminhada', () => {
    const pose = calcularPoseProcedural({
      fase: Math.PI / 2,
      pesoMovimento: 1,
      pesoChao: 1,
      intensidadeCorrida: 0,
      tempo: 0,
    })

    expect(pose.coxaEsquerdaX).toBeGreaterThan(0)
    expect(pose.coxaDireitaX).toBeLessThan(0)
    expect(pose.bracoEsquerdoX).toBeLessThan(1.48)
    expect(pose.bracoDireitoX).toBeGreaterThan(1.48)
    expect(pose.bracoEsquerdoX).toBeGreaterThan(1.2)
    expect(pose.bracoDireitoX).toBeLessThan(1.75)
  })

  it('aplica uma pose aérea independente da passada', () => {
    const pose = calcularPoseProcedural({
      fase: Math.PI / 2,
      pesoMovimento: 1,
      pesoChao: 0,
      intensidadeCorrida: 1,
      tempo: 0,
    })

    expect(pose.coxaEsquerdaX).toBe(-0.16)
    expect(pose.coxaDireitaX).toBe(0.2)
    expect(pose.joelhoEsquerdoX).toBe(0.4)
    expect(pose.joelhoDireitoX).toBe(0.34)
    expect(pose.deslocamentoY).toBe(-0.02)
  })

  it('mistura continuamente a corrida sem trocar a amplitude de uma vez', () => {
    const caminhada = calcularPoseProcedural({
      fase: Math.PI / 2,
      pesoMovimento: 1,
      pesoChao: 1,
      intensidadeCorrida: 0,
      tempo: 0,
    })
    const transicao = calcularPoseProcedural({
      fase: Math.PI / 2,
      pesoMovimento: 1,
      pesoChao: 1,
      intensidadeCorrida: 0.5,
      tempo: 0,
    })
    const corrida = calcularPoseProcedural({
      fase: Math.PI / 2,
      pesoMovimento: 1,
      pesoChao: 1,
      intensidadeCorrida: 1,
      tempo: 0,
    })

    expect(transicao.coxaEsquerdaX).toBeGreaterThan(caminhada.coxaEsquerdaX)
    expect(transicao.coxaEsquerdaX).toBeLessThan(corrida.coxaEsquerdaX)
  })
})
