import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  characterDelayMs: number
  startDelayMs?: number
  paused?: boolean
}

export function TypewriterText({
  text,
  characterDelayMs,
  startDelayMs = 0,
  paused = false,
}: TypewriterTextProps) {
  const characters = Array.from(text)
  const [visibleCount, setVisibleCount] = useState(0)
  const visibleCountRef = useRef(0)
  const completed = visibleCount >= characters.length

  useEffect(() => {
    if (paused || visibleCountRef.current >= characters.length) return

    let interval: number | undefined
    const revealNextCharacter = () => {
      const nextCount = Math.min(visibleCountRef.current + 1, characters.length)
      visibleCountRef.current = nextCount
      setVisibleCount(nextCount)

      if (nextCount >= characters.length && interval !== undefined) {
        window.clearInterval(interval)
      }
    }
    const delay = visibleCountRef.current === 0 ? startDelayMs : characterDelayMs
    const timeout = window.setTimeout(() => {
      revealNextCharacter()
      if (visibleCountRef.current < characters.length) {
        interval = window.setInterval(revealNextCharacter, characterDelayMs)
      }
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [characterDelayMs, characters.length, paused, startDelayMs])

  return (
    <span className="typewriter-text">
      <span className="typewriter-text__measure" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter-text__visible" aria-hidden="true">
        {characters.slice(0, visibleCount).join('')}
        {!completed && <span className="typewriter-text__cursor" />}
      </span>
    </span>
  )
}
