import { useState, useEffect, useRef } from 'react'

const TOTAL_DURATION = 3200   // ms before exit begins
const FLYOUT_DELAY = 300      // ms for tagline/bar to fade out
const FLYOUT_DURATION = 700   // ms for logo to fly to hero position
const CROSSFADE = 250         // ms for logo crossfade
const EXIT_DURATION = FLYOUT_DELAY + FLYOUT_DURATION + CROSSFADE

export default function LoadingScreen() {
  const [phase, setPhase] = useState(() => {
    if (sessionStorage.getItem('nobori-loaded')) return 'done'
    return 'loading'
  })
  const [flyTarget, setFlyTarget] = useState(null)
  const logoRef = useRef(null)
  const isActive = phase !== 'done'

  // Lock body scroll during loading + exit
  useEffect(() => {
    if (!isActive) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isActive])

  // Loading phase timer
  useEffect(() => {
    if (phase !== 'loading') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      sessionStorage.setItem('nobori-loaded', '1')
      setPhase('done')
      return
    }

    const timer = setTimeout(() => setPhase('exit'), TOTAL_DURATION)
    return () => clearTimeout(timer)
  }, [phase])

  // Exit phase: calculate fly target and schedule completion
  useEffect(() => {
    if (phase !== 'exit') return

    const heroImg = document.querySelector('[data-hero-logo]')
    const loadingLogo = logoRef.current

    if (heroImg && loadingLogo) {
      const heroRect = heroImg.getBoundingClientRect()
      const loadingRect = loadingLogo.getBoundingClientRect()
      const scale = heroRect.width / loadingRect.width
      const tx = (heroRect.left + heroRect.width / 2) - (loadingRect.left + loadingRect.width / 2)
      const ty = (heroRect.top + heroRect.height / 2) - (loadingRect.top + loadingRect.height / 2)
      setFlyTarget({ tx, ty, scale })
    }

    // Tell hero to show its logo when loading logo arrives at target
    const eventTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hero-logo-ready'))
    }, FLYOUT_DELAY + FLYOUT_DURATION)

    // Remove loading screen after crossfade completes
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem('nobori-loaded', '1')
      setPhase('done')
    }, EXIT_DURATION + 50)

    return () => {
      clearTimeout(eventTimer)
      clearTimeout(doneTimer)
    }
  }, [phase])

  if (phase === 'done') return null

  const isExit = phase === 'exit'

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
        @keyframes ls-ui-fade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: isExit ? 'none' : undefined,
        }}
      >
        {/* Background — fades to reveal hero underneath */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FAFAF6',
            transition: isExit ? `opacity 500ms ease-out ${FLYOUT_DELAY}ms` : undefined,
            opacity: isExit ? 0 : 1,
          }}
        />

        {/* Centered content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {/* Logo — flies to hero position during exit */}
          <div
            ref={logoRef}
            style={{
              width: 'min(250px, 55vw)',
              animation: 'ls-iris 1.2s ease-out both, ls-color 2.0s ease-out both',
              willChange: isExit ? 'transform, opacity' : undefined,
              transition: isExit
                ? [
                    `transform ${FLYOUT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) ${FLYOUT_DELAY}ms`,
                    `opacity ${CROSSFADE}ms ease-out ${FLYOUT_DELAY + FLYOUT_DURATION}ms`,
                  ].join(', ')
                : undefined,
              transform:
                isExit && flyTarget
                  ? `translate(${flyTarget.tx}px, ${flyTarget.ty}px) scale(${flyTarget.scale})`
                  : 'translate(0, 0) scale(1)',
              opacity: isExit ? 0 : undefined,
            }}
          >
            <img
              src={import.meta.env.BASE_URL + 'images/lab-logo.png'}
              alt=""
              style={{ width: '100%', height: 'auto', display: 'block' }}
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
              animation: isExit
                ? `ls-ui-fade ${FLYOUT_DELAY}ms ease-out forwards`
                : 'ls-text 0.6s ease-out 1.8s both',
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
              animation: isExit
                ? `ls-ui-fade ${FLYOUT_DELAY}ms ease-out forwards`
                : undefined,
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
      </div>
    </>
  )
}
