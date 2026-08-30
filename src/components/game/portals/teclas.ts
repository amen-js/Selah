/** Forma mínima de evento necessária para testar acionamento sem DOM. */
export type EventoTeclaPortal = Readonly<{
  code?: string
  key?: string
  repeat?: boolean
}>

/** Aceita E ou Enter somente no primeiro evento, nunca em key-repeat. */
export function ehTeclaConfirmacaoPortal(evento: EventoTeclaPortal): boolean {
  if (evento.repeat) return false

  return (
    evento.code === 'KeyE' ||
    evento.code === 'Enter' ||
    evento.key === 'e' ||
    evento.key === 'E' ||
    evento.key === 'Enter'
  )
}

/** Nome orientado à ação para consumidores que preferem linguagem de guarda. */
export const podeAcionarPortalPorTecla = ehTeclaConfirmacaoPortal
