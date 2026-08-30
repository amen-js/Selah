import { describe, expect, it } from 'vitest'
import type { PosicaoJogador } from '../proximidade'
import {
  atualizarInatividadeCriacao,
  type EstadoInatividadeCriacao,
} from './inatividade'

const ORIGEM: PosicaoJogador = { x: 0, y: 0, z: 0 }

function criarEstado(): EstadoInatividadeCriacao {
  return {
    ultimaAtividadeMs: 0,
    posicaoAnterior: null,
    inativo: false,
  }
}

function atualizar(
  estado: EstadoInatividadeCriacao,
  agoraMs: number,
  posicao: PosicaoJogador = ORIGEM,
  enabled = true,
) {
  return atualizarInatividadeCriacao(estado, { agoraMs, posicao, enabled })
}

describe('inatividade da exploração da Criação', () => {
  it('emite inatividade exatamente no limite de 12 segundos e uma única vez', () => {
    let resultado = atualizar(criarEstado(), 0)

    resultado = atualizar(resultado.estado, 11_999)
    expect(resultado.estado.inativo).toBe(false)
    expect(resultado.mudouPara).toBeNull()

    resultado = atualizar(resultado.estado, 12_000)
    expect(resultado.estado.inativo).toBe(true)
    expect(resultado.mudouPara).toBe(true)

    resultado = atualizar(resultado.estado, 24_000)
    expect(resultado.estado.inativo).toBe(true)
    expect(resultado.mudouPara).toBeNull()
  })

  it('reinicia o tempo com movimento horizontal significativo', () => {
    let resultado = atualizar(criarEstado(), 0)

    resultado = atualizar(resultado.estado, 11_999, { x: 1, y: 0, z: 0 })
    expect(resultado.estado.ultimaAtividadeMs).toBe(11_999)
    expect(resultado.mudouPara).toBeNull()

    resultado = atualizar(resultado.estado, 23_998, { x: 1, y: 0, z: 0 })
    expect(resultado.estado.inativo).toBe(false)

    resultado = atualizar(resultado.estado, 23_999, { x: 1, y: 0, z: 0 })
    expect(resultado.mudouPara).toBe(true)
  })

  it('emite atividade uma vez ao retomar movimento e permite um novo episódio', () => {
    let resultado = atualizar(criarEstado(), 0)
    resultado = atualizar(resultado.estado, 12_000)

    resultado = atualizar(resultado.estado, 12_001, { x: 1, y: 0, z: 0 })
    expect(resultado.estado.inativo).toBe(false)
    expect(resultado.mudouPara).toBe(false)

    resultado = atualizar(resultado.estado, 12_002, { x: 2, y: 0, z: 0 })
    expect(resultado.mudouPara).toBeNull()

    resultado = atualizar(resultado.estado, 24_002, { x: 2, y: 0, z: 0 })
    expect(resultado.estado.inativo).toBe(true)
    expect(resultado.mudouPara).toBe(true)
  })

  it('ignora jitter pequeno e deslocamento exclusivamente vertical', () => {
    let resultado = atualizar(criarEstado(), 0)

    resultado = atualizar(resultado.estado, 4_000, {
      x: 0.01,
      y: 10,
      z: -0.01,
    })
    resultado = atualizar(resultado.estado, 8_000, {
      x: -0.02,
      y: -10,
      z: 0.01,
    })
    resultado = atualizar(resultado.estado, 12_000, {
      x: 0.01,
      y: 30,
      z: 0.02,
    })

    expect(resultado.estado.ultimaAtividadeMs).toBe(0)
    expect(resultado.estado.inativo).toBe(true)
    expect(resultado.mudouPara).toBe(true)
  })

  it('acumula pequenos deslocamentos reais contra a última posição significativa', () => {
    let resultado = atualizar(criarEstado(), 0)
    resultado = atualizar(resultado.estado, 4_000, { x: 0.02, y: 0, z: 0 })
    resultado = atualizar(resultado.estado, 8_000, { x: 0.04, y: 0, z: 0 })
    resultado = atualizar(resultado.estado, 11_000, { x: 0.06, y: 0, z: 0 })

    expect(resultado.estado.ultimaAtividadeMs).toBe(11_000)

    resultado = atualizar(resultado.estado, 22_999, { x: 0.06, y: 0, z: 0 })
    expect(resultado.estado.inativo).toBe(false)

    resultado = atualizar(resultado.estado, 23_000, { x: 0.06, y: 0, z: 0 })
    expect(resultado.mudouPara).toBe(true)
  })

  it('reseta enquanto desabilitado sem emitir suporte', () => {
    let resultado = atualizar(criarEstado(), 0)
    resultado = atualizar(resultado.estado, 12_000)

    resultado = atualizar(resultado.estado, 13_000, ORIGEM, false)
    expect(resultado.estado).toEqual({
      ultimaAtividadeMs: 13_000,
      posicaoAnterior: null,
      inativo: false,
    })
    expect(resultado.mudouPara).toBe(false)

    resultado = atualizar(resultado.estado, 30_000, ORIGEM, false)
    expect(resultado.estado.inativo).toBe(false)
    expect(resultado.mudouPara).toBeNull()

    resultado = atualizar(resultado.estado, 31_000)
    expect(resultado.estado.ultimaAtividadeMs).toBe(31_000)
    expect(resultado.mudouPara).toBeNull()

    resultado = atualizar(resultado.estado, 42_999)
    expect(resultado.estado.inativo).toBe(false)

    resultado = atualizar(resultado.estado, 43_000)
    expect(resultado.mudouPara).toBe(true)
  })
})
