import { useEffect, useState } from 'react'

const CONSULTA_MOVIMENTO_REDUZIDO = '(prefers-reduced-motion: reduce)'

function prefereMovimentoReduzido() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO).matches
  )
}

/** Keeps decorative 3D motion aligned with the operating-system preference. */
export function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(prefereMovimentoReduzido)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const consulta = window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO)
    const atualizar = (event: MediaQueryListEvent) => setReducedMotion(event.matches)

    consulta.addEventListener('change', atualizar)
    return () => consulta.removeEventListener('change', atualizar)
  }, [])

  return reducedMotion
}
