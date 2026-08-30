/** Forma mínima de evento necessária para testar acionamento sem DOM. */
export type EventoTeclaPortal = Readonly<{
  code?: string
  key?: string
  repeat?: boolean
  target?: EventTarget | null
}>

const SELETOR_CONTROLE_INTERATIVO =
  'button,input,select,textarea,a,[contenteditable="true"],[role="button"]'

/** Enter focused on the HUD belongs to that control, never to the 3D world. */
export function eventoParteDeControleInterativo(
  evento: EventoTeclaPortal,
): boolean {
  return (
    evento.target instanceof Element &&
    evento.target.closest(SELETOR_CONTROLE_INTERATIVO) !== null
  )
}

/** Aceita E ou Enter somente no primeiro evento, nunca em key-repeat. */
export function ehTeclaConfirmacaoPortal(evento: EventoTeclaPortal): boolean {
  if (evento.repeat || eventoParteDeControleInterativo(evento)) return false

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
