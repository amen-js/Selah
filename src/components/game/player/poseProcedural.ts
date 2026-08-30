export interface EntradaPoseProcedural {
  fase: number
  pesoMovimento: number
  pesoChao: number
  intensidadeCorrida: number
  tempo: number
}

export interface PoseProcedural {
  bracoEsquerdoX: number
  bracoDireitoX: number
  antebracoEsquerdoZ: number
  antebracoDireitoZ: number
  coxaEsquerdaX: number
  coxaDireitaX: number
  joelhoEsquerdoX: number
  joelhoDireitoX: number
  peEsquerdoX: number
  peDireitoX: number
  colunaX: number
  colunaZ: number
  quadrilZ: number
  deslocamentoY: number
}

// The FBX is authored in a T-pose. About 85° puts both upper arms naturally
// beside the torso before the locomotion swing is applied.
const BRACOS_RELAXADOS = 1.48

function limitar01(valor: number): number {
  return Math.min(1, Math.max(0, valor))
}

function interpolar(inicio: number, fim: number, peso: number): number {
  return inicio + (fim - inicio) * peso
}

/** Resolves a compact locomotion pose for the Mixamo-style AJ skeleton. */
export function calcularPoseProcedural({
  fase,
  pesoMovimento,
  pesoChao,
  intensidadeCorrida,
  tempo,
}: EntradaPoseProcedural): PoseProcedural {
  const movimento = limitar01(pesoMovimento)
  const chao = limitar01(pesoChao)
  const corrida = limitar01(intensidadeCorrida)
  const passada = Math.sin(fase) * movimento
  const amplitudePerna = interpolar(0.42, 0.66, corrida)
  const amplitudeBraco = interpolar(0.22, 0.34, corrida)
  const coxaEsquerdaChao = passada * amplitudePerna
  const coxaDireitaChao = -passada * amplitudePerna
  const joelhoEsquerdoChao = Math.max(0, -passada) * interpolar(0.42, 0.68, corrida)
  const joelhoDireitoChao = Math.max(0, passada) * interpolar(0.42, 0.68, corrida)
  const coxaEsquerda = interpolar(-0.16, coxaEsquerdaChao, chao)
  const coxaDireita = interpolar(0.2, coxaDireitaChao, chao)
  const joelhoEsquerdo = interpolar(0.4, joelhoEsquerdoChao, chao)
  const joelhoDireito = interpolar(0.34, joelhoDireitoChao, chao)
  const respiracao = Math.sin(tempo * 1.7)
  const elevacaoPasso = (1 - Math.cos(fase * 2)) * 0.5
  const flexaoCotovelo = 0.1 + Math.abs(passada) * interpolar(0.1, 0.22, corrida)

  return {
    bracoEsquerdoX: BRACOS_RELAXADOS - passada * amplitudeBraco + respiracao * 0.005,
    bracoDireitoX: BRACOS_RELAXADOS + passada * amplitudeBraco + respiracao * 0.005,
    antebracoEsquerdoZ: flexaoCotovelo,
    antebracoDireitoZ: -flexaoCotovelo,
    coxaEsquerdaX: coxaEsquerda,
    coxaDireitaX: coxaDireita,
    joelhoEsquerdoX: joelhoEsquerdo,
    joelhoDireitoX: joelhoDireito,
    peEsquerdoX: -coxaEsquerda * 0.3 - joelhoEsquerdo * 0.22,
    peDireitoX: -coxaDireita * 0.3 - joelhoDireito * 0.22,
    colunaX: respiracao * 0.01 + corrida * movimento * 0.045,
    colunaZ: -passada * 0.025,
    quadrilZ: Math.sin(fase * 2) * 0.026 * movimento * chao,
    deslocamentoY: interpolar(
      -0.02,
      elevacaoPasso * interpolar(0.018, 0.032, corrida) * movimento,
      chao,
    ),
  }
}
