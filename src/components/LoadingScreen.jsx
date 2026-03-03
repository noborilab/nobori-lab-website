import { useState, useEffect } from 'react'

const TOTAL_DURATION = 2400 // ms before slide-up begins
const SLIDE_DURATION = 600

export default function LoadingScreen() {
  const [phase, setPhase] = useState(() => {
    if (sessionStorage.getItem('nobori-loaded')) return 'done'
    return 'logo' // logo → text → bar → exit → done
  })

  useEffect(() => {
    if (phase === 'done') return

    // Check reduced motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      sessionStorage.setItem('nobori-loaded', '1')
      setPhase('done')
      return
    }

    // Prevent scroll during loading
    document.body.style.overflow = 'hidden'

    const timers = []
    // After total duration, begin exit
    timers.push(setTimeout(() => setPhase('exit'), TOTAL_DURATION))
    // After exit animation, remove
    timers.push(
      setTimeout(() => {
        setPhase('done')
        sessionStorage.setItem('nobori-loaded', '1')
        document.body.style.overflow = ''
      }, TOTAL_DURATION + SLIDE_DURATION),
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
        @keyframes ls-logo {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ls-text {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ls-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes ls-exit {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
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
              ? `ls-exit ${SLIDE_DURATION}ms ease-in-out forwards`
              : undefined,
        }}
      >
        {/* Logo */}
        <img
          src={import.meta.env.BASE_URL + 'images/lab-logo.png'}
          alt=""
          style={{
            width: 'min(340px, 60vw)',
            height: 'auto',
            animation: 'ls-logo 0.8s ease-out both',
          }}
        />

        {/* Tagline */}
        <p
          style={{
            fontFamily: '"Josefin Sans", sans-serif',
            fontSize: '14px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(28, 30, 34, 0.35)',
            marginTop: '16px',
            animation: 'ls-text 0.5s ease-out 0.5s both',
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
