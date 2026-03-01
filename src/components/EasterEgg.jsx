import { useState, useEffect, useCallback, useRef } from 'react'

// Hardcoded image list (import.meta.glob doesn't work on static hosts)
const easterEggImages = [
  '/images/easter-egg/mNeonG_mCherry.png',
  '/images/easter-egg/phytomap_plant.png',
]

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

const confettiPalette = [
  '#6B8F6B', // sage
  '#C85A3A', // coral
  '#2E3A5C', // navy
  '#FAFAF6', // cream
  '#B8AFA0', // taupe
]

// Shape types: leaf, bacteria (oval), cell (circle)
function makeParticles(count) {
  return Array.from({ length: count }, (_, i) => {
    const shape = i % 3 === 0 ? 'leaf' : i % 3 === 1 ? 'bacteria' : 'cell'
    return {
      id: i,
      shape,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      color: confettiPalette[Math.floor(Math.random() * confettiPalette.length)],
      size: shape === 'leaf' ? 8 + Math.random() * 7 : shape === 'bacteria' ? 6 + Math.random() * 6 : 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 100,
      startRotation: Math.random() * 360,
    }
  })
}

function Confetti() {
  const particles = useRef(makeParticles(50)).current

  return (
    <>
      <style>{`
        @keyframes ee-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(var(--rot)); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--drift)) rotate(calc(var(--rot) + 720deg)); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => {
        const style = {
          position: 'fixed',
          left: `${p.left}%`,
          top: -20,
          zIndex: 301,
          pointerEvents: 'none',
          '--drift': `${p.drift}px`,
          '--rot': `${p.startRotation}deg`,
          animation: `ee-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          opacity: 0,
        }

        if (p.shape === 'leaf') {
          return (
            <svg key={p.id} style={style} width={p.size} height={p.size * 1.4} viewBox="0 0 10 14" fill={p.color}>
              <path d="M5 0C5 0 0 4 0 8c0 3 2 6 5 6s5-3 5-6C10 4 5 0 5 0z" opacity="0.85" />
              <line x1="5" y1="2" x2="5" y2="12" stroke={p.color} strokeWidth="0.5" opacity="0.4" />
            </svg>
          )
        }

        if (p.shape === 'bacteria') {
          return (
            <div
              key={p.id}
              style={{
                ...style,
                width: p.size * 1.6,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
                opacity: undefined,
              }}
            />
          )
        }

        // cell — circle
        return (
          <div
            key={p.id}
            style={{
              ...style,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: undefined,
              border: `1px solid ${p.color}`,
            }}
          />
        )
      })}
    </>
  )
}

export default function EasterEgg() {
  const [show, setShow] = useState(false)
  const [image, setImage] = useState(null)
  const clickCount = useRef(0)
  const clickTimer = useRef(null)
  const konamiIdx = useRef(0)

  const pickImage = useCallback(() => {
    if (easterEggImages.length === 0) return null
    return easterEggImages[Math.floor(Math.random() * easterEggImages.length)]
  }, [])

  const trigger = useCallback(() => {
    setImage(pickImage())
    setShow(true)
  }, [pickImage])

  const dismiss = useCallback(() => {
    setShow(false)
    clickCount.current = 0
    konamiIdx.current = 0
  }, [])

  // Logo click handler
  useEffect(() => {
    const logo = document.querySelector('#hero img[alt="Nobori Lab"]')
    if (!logo) return

    const handleClick = () => {
      clickCount.current++
      clearTimeout(clickTimer.current)
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0
      }, 3000)

      if (clickCount.current >= 5) {
        clickCount.current = 0
        clearTimeout(clickTimer.current)
        trigger()
      }
    }

    logo.addEventListener('click', handleClick)
    return () => {
      logo.removeEventListener('click', handleClick)
      clearTimeout(clickTimer.current)
    }
  }, [trigger])

  // Konami code listener
  useEffect(() => {
    const handleKey = (e) => {
      if (show) {
        if (e.key === 'Escape') dismiss()
        return
      }

      const expected = KONAMI[konamiIdx.current]
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konamiIdx.current++
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0
          trigger()
        }
      } else {
        konamiIdx.current = 0
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [show, trigger, dismiss])

  if (!show) return null

  const imgSrc = image
    ? import.meta.env.BASE_URL + image.replace(/^\//, '')
    : null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={dismiss}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(46, 58, 92, 0.92)', animation: 'eeIn 0.3s ease' }}
      />

      {/* Confetti */}
      <Confetti />

      {/* Content */}
      <div
        className="relative z-[302] text-center px-6 max-w-[600px]"
        style={{ animation: 'eePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <p className="font-display text-[32px] md:text-[40px] italic text-white mb-6">
          {'\uD83D\uDD2C'} Sneak Peek
        </p>

        {imgSrc && (
          <img
            src={imgSrc}
            alt="Sneak peek"
            className="w-full max-w-[600px] rounded-2xl mx-auto mb-6 shadow-[0_0_40px_rgba(107,143,107,0.3),0_8px_32px_rgba(0,0,0,0.4)]"
          />
        )}

        <p className="text-[17px] text-white/85 leading-relaxed max-w-md mx-auto">
          You've unlocked unreleased data from the lab.
          <br />
          Stay tuned — this story is still unfolding.
        </p>

        <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.2em] text-white/30">
          Press anywhere to close
        </p>
      </div>

      <style>{`
        @keyframes eeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes eePop { from { opacity: 0; transform: scale(0.85) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  )
}
