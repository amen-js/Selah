export const TOTAL_SEGMENTOS_VEDACAO = 10
export const SEGMENTOS_NECESSARIOS_VEDACAO = 8

export function vedacaoBetumeConcluida(
  segmentosPreenchidos: ReadonlySet<number>,
): boolean {
  return segmentosPreenchidos.size >= SEGMENTOS_NECESSARIOS_VEDACAO
}
