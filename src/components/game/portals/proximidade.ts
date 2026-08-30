import type { PortalMapa, PosicaoXZ } from './types'

type CoordenadasXZ = Readonly<{ x: number; z: number }>

const EMPATE_EPSILON = 1e-9

function paraCoordenadasXZ(posicao: PosicaoXZ): CoordenadasXZ {
  if ('x' in posicao) return posicao

  return { x: posicao[0], z: posicao[2] }
}

/** Calcula a distância euclidiana ignorando completamente o eixo Y. */
export function distanciaXZ(a: PosicaoXZ, b: PosicaoXZ): number {
  const pontoA = paraCoordenadasXZ(a)
  const pontoB = paraCoordenadasXZ(b)

  return Math.hypot(pontoA.x - pontoB.x, pontoA.z - pontoB.z)
}

/** Retorna true no limite do raio; altura do jogador não influencia o portal. */
export function estaNoRaioXZ(
  jogador: PosicaoXZ,
  centro: PosicaoXZ,
  raio: number,
): boolean {
  return raio >= 0 && distanciaXZ(jogador, centro) <= raio
}

/** Disponibilidade explícita false bloqueia o portal; ausência significa ativo. */
export function portalDisponivel(portal: Pick<PortalMapa, 'disponivel'>): boolean {
  return portal.disponivel !== false
}

function deveSubstituir(
  candidato: PortalMapa,
  distanciaCandidata: number,
  escolhido: PortalMapa,
  distanciaEscolhida: number,
): boolean {
  if (distanciaCandidata < distanciaEscolhida - EMPATE_EPSILON) return true
  if (Math.abs(distanciaCandidata - distanciaEscolhida) > EMPATE_EPSILON) return false

  const prioridadeCandidata = candidato.prioridade ?? 0
  const prioridadeEscolhida = escolhido.prioridade ?? 0
  if (prioridadeCandidata !== prioridadeEscolhida) {
    return prioridadeCandidata < prioridadeEscolhida
  }

  return candidato.id.localeCompare(escolhido.id) < 0
}

function selecionarPortalMaisProximo(
  jogador: PosicaoXZ,
  portais: readonly PortalMapa[],
  considerar: (portal: PortalMapa) => boolean,
): PortalMapa | null {
  let escolhido: PortalMapa | null = null
  let distanciaEscolhida = Number.POSITIVE_INFINITY

  for (const portal of portais) {
    if (
      !considerar(portal) ||
      !estaNoRaioXZ(jogador, portal.posicao, portal.raioAtivacao)
    ) {
      continue
    }

    const distancia = distanciaXZ(jogador, portal.posicao)
    if (
      escolhido === null ||
      deveSubstituir(portal, distancia, escolhido, distanciaEscolhida)
    ) {
      escolhido = portal
      distanciaEscolhida = distancia
    }
  }

  return escolhido
}

/**
 * Encontra o portal disponível mais próximo dentro do raio de ativação.
 * Empates usam prioridade e, por fim, ID, mantendo o resultado determinístico.
 */
export function selecionarPortalProximo(
  jogador: PosicaoXZ,
  portais: readonly PortalMapa[],
): PortalMapa | null {
  return selecionarPortalMaisProximo(jogador, portais, portalDisponivel)
}

/** Encontra o portal mais próximo, inclusive quando está indisponível. */
export function selecionarPortalDetectado(
  jogador: PosicaoXZ,
  portais: readonly PortalMapa[],
): PortalMapa | null {
  return selecionarPortalMaisProximo(jogador, portais, () => true)
}

/** Alias verbal para uso nos componentes de cena. */
export const resolverPortalProximo = selecionarPortalProximo
