import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function TypewriterLabel({ text, className = '', lineClassName = '' }) {
  const reduced = useReducedMotion()
  const [visibleCount, setVisibleCount] = useState(reduced ? text.length : 0)
  const [started, setStarted] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const containerRef = useRef(null)

  // IntersectionObserver — trigger once
  useEffect(() => {
    if (reduced) {
      setStarted(true)
      setVisibleCount(text.length)
      return
    }

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, text.length])

  // Typewriter effect
  useEffect(() => {
    if (!started || reduced) return
    if (visibleCount >= text.length) return

    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1)
    }, 50)

    return () => clearTimeout(timer)
  }, [started, visibleCount, text.length, reduced])

  // Hide cursor after typing completes
  useEffect(() => {
    if (visibleCount < text.length) return

    // Blink a few times then disappear
    const blinkTimer = setTimeout(() => setCursorVisible(false), 1200)
    return () => clearTimeout(blinkTimer)
  }, [visibleCount, text.length])

  const done = visibleCount >= text.length
  const lineProgress = started ? (reduced ? 1 : Math.min(visibleCount / text.length, 1)) : 0

  return (
    <div ref={containerRef} className={`flex items-center gap-4 ${className}`}>
      {/* Animated line */}
      <div
        className={`h-px bg-text/25 ${lineClassName}`}
        style={{
          width: `${lineProgress * 32}px`,
          transition: reduced ? 'none' : 'width 80ms ease-out',
        }}
      />

      {/* Text with cursor */}
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40 whitespace-nowrap">
        <span>{text.slice(0, visibleCount)}</span>
        {/* Invisible remaining text to reserve space */}
        <span style={{ visibility: 'hidden' }}>{text.slice(visibleCount)}</span>
        {/* Blinking cursor */}
        {started && !reduced && (cursorVisible || !done) && (
          <span
            style={{
              display: 'inline-block',
              width: '1.5px',
              height: '1em',
              backgroundColor: 'currentColor',
              marginLeft: '1px',
              verticalAlign: 'text-bottom',
              opacity: 0.5,
              animation: done ? 'tw-blink 0.53s step-end infinite' : 'none',
            }}
          />
        )}
      </p>

      <style>{`
        @keyframes tw-blink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
