import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTranslation } from '../../../i18n'
import {
  acumularArrastoCameraMobile,
  definirMovimentoMobile,
  definirPuloMobile,
  dispararInteracaoMobile,
  resetarControleMobile,
  type EstadoControleMobile,
  type VetorControleMobile,
} from './mobileInput'
import { calcularJoystick } from './joystick'
import './MobileControlsOverlay.css'

const RAIO_JOYSTICK_PX = 34

export interface MobileControlsOverlayProps {
  enabled: boolean
  input: EstadoControleMobile
  onPause?: () => void
}

export function MobileControlsOverlay({
  enabled,
  input,
  onPause,
}: MobileControlsOverlayProps) {
  const { t } = useTranslation()
  const joystickPointerRef = useRef<number | null>(null)
  const joystickKnobRef = useRef<HTMLSpanElement>(null)
  const cameraPointerRef = useRef<number | null>(null)
  const cameraAnteriorRef = useRef<VetorControleMobile | null>(null)

  const atualizarVisualJoystick = useCallback(
    ({ x, y }: VetorControleMobile) => {
      if (!joystickKnobRef.current) return
      joystickKnobRef.current.style.transform = `translate(${x * RAIO_JOYSTICK_PX}px, ${
        -y * RAIO_JOYSTICK_PX
      }px)`
    },
    [],
  )

  const soltarJoystick = useCallback(() => {
    joystickPointerRef.current = null
    definirMovimentoMobile(input, 0, 0)
    atualizarVisualJoystick({ x: 0, y: 0 })
  }, [atualizarVisualJoystick, input])

  const resetarInteracao = useCallback(() => {
    resetarControleMobile(input)
    joystickPointerRef.current = null
    cameraPointerRef.current = null
    cameraAnteriorRef.current = null
    atualizarVisualJoystick({ x: 0, y: 0 })
  }, [atualizarVisualJoystick, input])

  const atualizarJoystick = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const vetor = calcularJoystick(event.clientX, event.clientY, {
        centroX: rect.left + rect.width / 2,
        centroY: rect.top + rect.height / 2,
        raio: Math.min(RAIO_JOYSTICK_PX, rect.width / 2, rect.height / 2),
      })
      definirMovimentoMobile(input, vetor.x, vetor.y)
      atualizarVisualJoystick(vetor)
    },
    [atualizarVisualJoystick, input],
  )

  useEffect(() => {
    if (enabled) return
    resetarInteracao()
  }, [enabled, resetarInteracao])

  useEffect(() => {
    if (!enabled) return

    const resetarAoPerderFoco = () => resetarInteracao()
    const resetarAoOcultar = () => {
      if (document.visibilityState === 'hidden') resetarInteracao()
    }

    window.addEventListener('blur', resetarAoPerderFoco)
    document.addEventListener('visibilitychange', resetarAoOcultar)
    return () => {
      window.removeEventListener('blur', resetarAoPerderFoco)
      document.removeEventListener('visibilitychange', resetarAoOcultar)
    }
  }, [enabled, resetarInteracao])

  useEffect(
    () => () => resetarInteracao(),
    [resetarInteracao],
  )

  if (!enabled) return null

  return (
    <div className="mobile-controls" data-testid="mobile-controls">
      <div
        className="mobile-controls__camera-pad"
        aria-hidden="true"
        onPointerDown={(event) => {
          if (cameraPointerRef.current !== null) return
          event.preventDefault()
          cameraPointerRef.current = event.pointerId
          cameraAnteriorRef.current = { x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (cameraPointerRef.current !== event.pointerId) return
          const anterior = cameraAnteriorRef.current
          if (!anterior) return
          event.preventDefault()
          acumularArrastoCameraMobile(
            input,
            event.clientX - anterior.x,
            event.clientY - anterior.y,
          )
          cameraAnteriorRef.current = { x: event.clientX, y: event.clientY }
        }}
        onPointerUp={(event) => {
          if (cameraPointerRef.current !== event.pointerId) return
          cameraPointerRef.current = null
          cameraAnteriorRef.current = null
        }}
        onPointerCancel={() => {
          cameraPointerRef.current = null
          cameraAnteriorRef.current = null
        }}
      />

      <div
        className="mobile-controls__joystick"
        role="group"
        aria-label={t('app.controls.move')}
        onPointerDown={(event) => {
          if (joystickPointerRef.current !== null) return
          event.preventDefault()
          joystickPointerRef.current = event.pointerId
          event.currentTarget.setPointerCapture?.(event.pointerId)
          atualizarJoystick(event)
        }}
        onPointerMove={(event) => {
          if (joystickPointerRef.current !== event.pointerId) return
          event.preventDefault()
          atualizarJoystick(event)
        }}
        onPointerUp={(event) => {
          if (joystickPointerRef.current !== event.pointerId) return
          soltarJoystick()
        }}
        onPointerCancel={soltarJoystick}
        onLostPointerCapture={soltarJoystick}
      >
        <span
          ref={joystickKnobRef}
          className="mobile-controls__joystick-knob"
        />
      </div>

      <div className="mobile-controls__actions">
        <button
          className="mobile-controls__button mobile-controls__button--jump"
          type="button"
          aria-label={t('app.controls.jump')}
          onPointerDown={(event) => {
            event.preventDefault()
            event.currentTarget.setPointerCapture?.(event.pointerId)
            definirPuloMobile(input, true)
          }}
          onPointerUp={() => definirPuloMobile(input, false)}
          onPointerCancel={() => definirPuloMobile(input, false)}
          onLostPointerCapture={() => definirPuloMobile(input, false)}
        >
          <span aria-hidden="true">↑</span>
          <small>{t('app.controls.jump')}</small>
        </button>
        <button
          className="mobile-controls__button mobile-controls__button--interact"
          type="button"
          aria-label={t('mobile.controls.action')}
          onPointerDown={(event) => {
            event.preventDefault()
            dispararInteracaoMobile()
          }}
        >
          <span aria-hidden="true">✦</span>
          <small>{t('mobile.controls.action')}</small>
        </button>
      </div>

      <button
        className="mobile-controls__pause"
        type="button"
        aria-label={t('app.controls.pause')}
        onPointerDown={(event) => {
          event.preventDefault()
          onPause?.()
        }}
      >
        <span aria-hidden="true">Ⅱ</span>
      </button>
    </div>
  )
}
