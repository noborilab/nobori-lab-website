import { useState, useEffect } from 'react'

const TOTAL_DURATION = 3200 // ms before exit begins
const EXIT_DURATION = 800

export default function LoadingScreen() {
  const [phase, setPhase] = useState(() => {
    if (sessionStorage.getItem('nobori-loaded')) return 'done'
    return 'loading'
  })

  useEffect(() => {
    if (phase === 'done') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      sessionStorage.setItem('nobori-loaded', '1')
      setPhase('done')
      return
    }

    document.body.style.overflow = 'hidden'

    const timers = []
    timers.push(setTimeout(() => setPhase('exit'), TOTAL_DURATION))
    timers.push(
      setTimeout(() => {
        setPhase('done')
        sessionStorage.setItem('nobori-loaded', '1')
        document.body.style.overflow = ''
      }, TOTAL_DURATION + EXIT_DURATION),
    )

    return () => {
      timers.forEach(clearTimeout)
      document.body.style.overflow = ''
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <>
      <style>{`
        @keyframes ls-iris {
          0% { clip-path: circle(0% at 50% 50%); }
          100% { clip-path: circle(75% at 50% 50%); }
        }
        @keyframes ls-color {
          0% { filter: grayscale(1) opacity(0.3); }
          60% { filter: grayscale(1) opacity(0.6); }
          100% { filter: grayscale(0) opacity(1); }
        }
        @keyframes ls-text {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ls-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes ls-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAF6',
          animation:
            phase === 'exit'
              ? `ls-fade-out ${EXIT_DURATION}ms ease-out forwards`
              : undefined,
        }}
      >
        {/* Logo — iris reveal + color fade */}
        <div
          style={{
            width: 'min(250px, 55vw)',
            animation: 'ls-iris 1.2s ease-out both, ls-color 2.0s ease-out both',
          }}
        >
          <img
            src={import.meta.env.BASE_URL + 'images/lab-logo.png'}
            alt=""
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: '16px',
            color: 'rgba(28, 30, 34, 0.35)',
            marginTop: '20px',
            animation: 'ls-text 0.6s ease-out 1.8s both',
          }}
        >
          Plant-Microbe Interactions
        </p>

        {/* Progress bar */}
        <div
          style={{
            position: 'relative',
            width: 'min(200px, 40vw)',
            height: '1.5px',
            backgroundColor: 'rgba(228, 226, 220, 0.5)',
            marginTop: '20px',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              backgroundColor: '#6B8F6B',
              borderRadius: '1px',
              animation: `ls-bar ${TOTAL_DURATION}ms ease-in-out both`,
            }}
          />
        </div>
      </div>
    </>
  )
}
