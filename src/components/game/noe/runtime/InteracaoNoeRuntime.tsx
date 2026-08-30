import { useEffect, useLayoutEffect, useRef } from 'react'
import { ehTeclaConfirmacaoPortal } from '../../portals/teclas'
import {
  selecionarCandidatoInteracaoNoe,
  type CandidatoInteracaoNoe,
} from './interacao'

export interface InteracaoNoeRuntimeProps {
  candidatos: readonly CandidatoInteracaoNoe[]
  enabled: boolean
}

/** Owns the single E/Enter confirmation listener for Noah's world. */
export function InteracaoNoeRuntime({
  candidatos,
  enabled,
}: InteracaoNoeRuntimeProps) {
  const candidatosRef = useRef(candidatos)

  useLayoutEffect(() => {
    candidatosRef.current = candidatos
  }, [candidatos])

  useEffect(() => {
    if (!enabled) return

    const confirmarInteracao = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !ehTeclaConfirmacaoPortal(event)) return

      const candidato = selecionarCandidatoInteracaoNoe(candidatosRef.current)
      if (!candidato) return

      event.preventDefault()
      event.stopImmediatePropagation()
      candidato.acionar()
    }

    window.addEventListener('keydown', confirmarInteracao)
    return () => window.removeEventListener('keydown', confirmarInteracao)
  }, [enabled])

  return null
}
