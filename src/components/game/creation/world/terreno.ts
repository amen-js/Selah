export const LARGURA_TERRENO_CRIACAO = 48
export const PROFUNDIDADE_TERRENO_CRIACAO = 44
export const COLUNAS_TERRENO_CRIACAO = 32
export const LINHAS_TERRENO_CRIACAO = 30

export interface MalhaTerrenoCriacao {
  vertices: Float32Array
  indices: Uint32Array
}

function colina(
  x: number,
  z: number,
  centroX: number,
  centroZ: number,
  altura: number,
  alcance: number,
): number {
  const distanciaQuadrada =
    (x - centroX) * (x - centroX) + (z - centroZ) * (z - centroZ)
  return altura * Math.exp(-distanciaQuadrada / (alcance * alcance))
}

/** Deterministic broad terrain: gentle around the route, taller at landmarks. */
export function obterAlturaTerrenoCriacao(x: number, z: number): number {
  const relevo =
    colina(x, z, -14, 5, 1.5, 6.5) +
    colina(x, z, 0, -17, 1.05, 5.5) +
    colina(x, z, 18, -12, 0.9, 7) +
    colina(x, z, -20, -12, 0.7, 6)
  const valeDoLago = colina(x, z, 13, 5, 0.55, 4.5)
  const ondulacao = Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.09

  return Math.max(-0.3, relevo - valeDoLago + ondulacao)
}

/** Generates one indexed mesh consumed by both Three and Rapier. */
export function criarMalhaTerrenoCriacao(): MalhaTerrenoCriacao {
  const verticesPorLinha = COLUNAS_TERRENO_CRIACAO + 1
  const totalVertices =
    verticesPorLinha * (LINHAS_TERRENO_CRIACAO + 1)
  const vertices = new Float32Array(totalVertices * 3)
  const indices = new Uint32Array(
    COLUNAS_TERRENO_CRIACAO * LINHAS_TERRENO_CRIACAO * 6,
  )

  let cursorVertice = 0
  for (let linha = 0; linha <= LINHAS_TERRENO_CRIACAO; linha += 1) {
    const z =
      (linha / LINHAS_TERRENO_CRIACAO - 0.5) *
      PROFUNDIDADE_TERRENO_CRIACAO
    for (
      let coluna = 0;
      coluna <= COLUNAS_TERRENO_CRIACAO;
      coluna += 1
    ) {
      const x =
        (coluna / COLUNAS_TERRENO_CRIACAO - 0.5) *
        LARGURA_TERRENO_CRIACAO
      vertices[cursorVertice] = x
      vertices[cursorVertice + 1] = obterAlturaTerrenoCriacao(x, z)
      vertices[cursorVertice + 2] = z
      cursorVertice += 3
    }
  }

  let cursorIndice = 0
  for (let linha = 0; linha < LINHAS_TERRENO_CRIACAO; linha += 1) {
    for (
      let coluna = 0;
      coluna < COLUNAS_TERRENO_CRIACAO;
      coluna += 1
    ) {
      const inferiorEsquerdo = linha * verticesPorLinha + coluna
      const inferiorDireito = inferiorEsquerdo + 1
      const superiorEsquerdo = inferiorEsquerdo + verticesPorLinha
      const superiorDireito = superiorEsquerdo + 1

      indices[cursorIndice] = inferiorEsquerdo
      indices[cursorIndice + 1] = superiorEsquerdo
      indices[cursorIndice + 2] = inferiorDireito
      indices[cursorIndice + 3] = inferiorDireito
      indices[cursorIndice + 4] = superiorEsquerdo
      indices[cursorIndice + 5] = superiorDireito
      cursorIndice += 6
    }
  }

  return { vertices, indices }
}
