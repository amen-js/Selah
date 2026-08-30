export type CondicoesColetavel = Readonly<{
  enabled: boolean
  jaAcionado: boolean
  selahAtivo: boolean
  pausaParentalAtiva: boolean
  passagemRespondida: boolean
}>

/** Indica se um colecionável pode executar seu gatilho de proximidade. */
export function podeAcionarColetavel(condicoes: CondicoesColetavel): boolean {
  return (
    condicoes.enabled &&
    !condicoes.jaAcionado &&
    !condicoes.selahAtivo &&
    !condicoes.pausaParentalAtiva &&
    !condicoes.passagemRespondida
  )
}
