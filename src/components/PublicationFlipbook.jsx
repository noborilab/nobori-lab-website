import { useState, useEffect, useRef, useCallback } from 'react'
import { selected, originalArticles, reviews, journalColors } from '../data/publications'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─── Data ────────────────────────────────────────────────────────────────────

function buildPubs() {
  const seen = new Set()
  const result = []
  for (const pub of [...selected, ...originalArticles, ...reviews]) {
    if (!seen.has(pub.title)) { seen.add(pub.title); result.push(pub) }
  }
  return result
}

// PAGES: cover → pubs → back cover
const PAGES = [
  { type: 'cover' },
  ...buildPubs().map(pub => ({ type: 'pub', pub })),
  { type: 'back' },
]

const logoSrc = import.meta.env.BASE_URL + 'images/lab-logo.svg'

// ─── Page face components ────────────────────────────────────────────────────

function CoverPage() {
  return (
    <div style={{
      width: '100%', height: '100%', background: '#FAFAF6',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '28px 20px', boxSizing: 'border-box', position: 'relative',
    }}>
      <img src={logoSrc} alt="Nobori Lab" style={{ width: 80, height: 'auto', marginBottom: 20 }} />
      <p style={{
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 300,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#2E3A5C', margin: 0, textAlign: 'center',
      }}>Nobori Lab</p>
      <div style={{ width: 40, height: 1, background: '#6B8F6B', margin: '16px auto', flexShrink: 0 }} />
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(16px, 2.8vw, 22px)', fontStyle: 'italic',
        color: '#2E3A5C', margin: 0, textAlign: 'center',
      }}>Publications</p>
      <p style={{
        position: 'absolute', bottom: 20,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(10px, 1.6vw, 13px)',
        color: '#B8AFA0', margin: 0, textAlign: 'center', letterSpacing: '0.04em',
      }}>The Sainsbury Laboratory</p>
    </div>
  )
}

function BackCoverPage() {
  return (
    <div style={{
      width: '100%', height: '100%', background: '#FAFAF6',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: '28px 20px', boxSizing: 'border-box',
    }}>
      <img src={logoSrc} alt="Nobori Lab" style={{ width: 56, height: 'auto', opacity: 0.7 }} />
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(14px, 2.4vw, 19px)', fontStyle: 'italic',
        color: '#2E3A5C', margin: 0, textAlign: 'center',
      }}>noborilab.org</p>
    </div>
  )
}

function BlankPage() {
  return <div style={{ width: '100%', height: '100%', background: '#1e2744' }} />
}

function PubLeftPage({ pub }) {
  const color = journalColors[pub.journal] || '#6B7B8B'
  const base  = import.meta.env.BASE_URL

  // Priority: firstPage → figure → journal name
  if (pub.firstPage) {
    const src = base + pub.firstPage.replace(/^\//, '')
    const ext = pub.firstPage.split('.').pop().toLowerCase()

    if (ext === 'pdf') {
      return (
        <div style={{ width: '100%', height: '100%', background: '#fff', overflow: 'hidden' }}>
          <iframe
            src={`${src}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH`}
            title={pub.title}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            scrolling="no"
          />
        </div>
      )
    }

    // jpg / png / webp etc.
    return (
      <div style={{ width: '100%', height: '100%', background: '#fff', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={src} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
    )
  }

  const imgSrc = pub.figure ? base + pub.figure.replace(/^\//, '') : null
  if (imgSrc) {
    return (
      <img src={imgSrc} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    )
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(18px, 4vw, 28px)', fontStyle: 'italic',
        color, textAlign: 'center', lineHeight: 1.3,
      }}>{pub.journal}</span>
    </div>
  )
}

function PubRightPage({ pub }) {
  const color = journalColors[pub.journal] || '#6B7B8B'
  return (
    <div style={{
      width: '100%', height: '100%', background: '#FAFAF6',
      padding: 'clamp(16px, 3vw, 28px) clamp(14px, 2.5vw, 24px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(13px, 2.2vw, 17px)', fontStyle: 'italic', color, lineHeight: 1.2,
        }}>{pub.journal}</span>
        {pub.journalNote && (
          <span style={{ fontSize: 'clamp(10px, 1.6vw, 13px)', color: 'rgba(0,0,0,0.35)' }}>
            {pub.journalNote}
          </span>
        )}
        <span style={{ fontSize: 'clamp(10px, 1.6vw, 13px)', color: 'rgba(0,0,0,0.25)' }}>
          {pub.year}
        </span>
      </div>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(14px, 2.6vw, 19px)', fontWeight: 600,
        color: '#2E3A5C', lineHeight: 1.3, marginBottom: 10,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 5, WebkitBoxOrient: 'vertical',
      }}>{pub.title}</p>
      <p style={{
        fontSize: 'clamp(10px, 1.6vw, 13px)', color: 'rgba(0,0,0,0.45)',
        lineHeight: 1.4, marginBottom: 14,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>{pub.authors}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {pub.link    && <Pill href={pub.link}>Link</Pill>}
        {pub.pdf     && <Pill href={pub.pdf}>PDF</Pill>}
        {pub.biorxiv && <Pill href={pub.biorxiv}>bioRxiv</Pill>}
      </div>
    </div>
  )
}

function Pill({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        fontFamily: 'monospace', fontSize: 'clamp(9px, 1.4vw, 11px)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        padding: '3px 9px', borderRadius: 999,
        border: '1px solid rgba(0,0,0,0.18)', color: 'rgba(0,0,0,0.5)',
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}>{children}</a>
  )
}

function LeftFace({ page }) {
  if (page.type === 'cover') return <BlankPage />
  if (page.type === 'back')  return <BackCoverPage />
  return <PubLeftPage pub={page.pub} />
}

function RightFace({ page }) {
  if (page.type === 'cover') return <CoverPage />
  if (page.type === 'back')  return <BlankPage />
  return <PubRightPage pub={page.pub} />
}

// ─── Flipbook overlay ─────────────────────────────────────────────────────────

export default function PublicationFlipbook({ onClose }) {
  const total = PAGES.length
  const [index, setIndex]     = useState(0)
  const [flip, setFlip]       = useState(null)  // arrow/keyboard flip
  const [isDragging, setIsDragging] = useState(false)
  const [dragDir, setDragDir] = useState(null)  // 'forward' | 'backward'

  const reduced      = useReducedMotion()
  const indexRef     = useRef(0)
  const flipTimerRef = useRef(null)
  const bookRef      = useRef(null)
  const dragFlipRef  = useRef(null)
  const dragState    = useRef(null) // { dir, startX, angle }

  useEffect(() => { indexRef.current = index }, [index])
  useEffect(() => () => clearTimeout(flipTimerRef.current), [])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Arrow / keyboard navigation ──────────────────────────────────────────────

  const navigate = useCallback((dir) => {
    if (flip || isDragging) return
    const to = dir === 'forward' ? index + 1 : index - 1
    if (to < 0 || to >= total) return
    if (reduced) { setIndex(to); return }
    setFlip({ dir, to })
    flipTimerRef.current = setTimeout(() => {
      setIndex(to)
      setFlip(null)
    }, 640)
  }, [flip, isDragging, index, total, reduced])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  navigate('forward')
      if (e.key === 'ArrowLeft')   navigate('backward')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, onClose])

  // ── Drag-to-flip ─────────────────────────────────────────────────────────────

  function getHalfWidth() {
    return bookRef.current ? bookRef.current.clientWidth / 2 : 300
  }

  function startDrag(clientX, dir) {
    if (flip || isDragging) return
    const to = dir === 'forward' ? indexRef.current + 1 : indexRef.current - 1
    if (to < 0 || to >= total) return
    dragState.current = { dir, startX: clientX, angle: 0 }
    setDragDir(dir)
    setIsDragging(true)
  }

  function moveDrag(clientX) {
    if (!dragFlipRef.current || !dragState.current) return
    const { dir, startX } = dragState.current
    const delta = dir === 'forward' ? startX - clientX : clientX - startX
    const angle = Math.max(0, Math.min(175, (delta / getHalfWidth()) * 180))
    dragState.current.angle = angle

    // Direct DOM update — no React re-render per pixel
    dragFlipRef.current.style.transform = dir === 'forward'
      ? `rotateY(${-angle}deg)` : `rotateY(${angle}deg)`

    // Curl shadow: peaks at 90°
    const s = Math.sin((angle * Math.PI) / 180)
    const sz = Math.round(s * 40)
    const op = (s * 0.45).toFixed(2)
    dragFlipRef.current.style.boxShadow = dir === 'forward'
      ? `-2px 0 ${sz}px rgba(0,0,0,${op})`
      : `2px 0 ${sz}px rgba(0,0,0,${op})`
  }

  function endDrag() {
    if (!dragState.current) { setIsDragging(false); setDragDir(null); return }
    const { dir, angle } = dragState.current

    if (!dragFlipRef.current) {
      setIsDragging(false); setDragDir(null); dragState.current = null; return
    }

    if (angle >= 90) {
      // Complete the flip
      const ms = Math.round((180 - angle) / 180 * 380) + 30
      dragFlipRef.current.style.transition = `transform ${ms}ms ease-in, box-shadow ${ms}ms ease-in`
      dragFlipRef.current.style.transform = dir === 'forward' ? 'rotateY(-180deg)' : 'rotateY(180deg)'
      dragFlipRef.current.style.boxShadow = 'none'
      setTimeout(() => {
        const to = dir === 'forward' ? indexRef.current + 1 : indexRef.current - 1
        if (to >= 0 && to < PAGES.length) setIndex(to)
        setIsDragging(false); setDragDir(null); dragState.current = null
      }, ms + 20)
    } else {
      // Snap back
      const ms = Math.max(80, Math.round(angle / 180 * 280))
      dragFlipRef.current.style.transition = `transform ${ms}ms ease-out`
      dragFlipRef.current.style.transform = 'rotateY(0deg)'
      dragFlipRef.current.style.boxShadow = 'none'
      setTimeout(() => {
        setIsDragging(false); setDragDir(null); dragState.current = null
      }, ms + 20)
    }
  }

  function makeEdgeHandlers(dir) {
    return {
      onMouseDown(e) {
        e.preventDefault()
        startDrag(e.clientX, dir)
        const onMove = (e) => moveDrag(e.clientX)
        const onUp   = () => {
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
          endDrag()
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      },
      onTouchStart(e) {
        e.preventDefault()
        startDrag(e.touches[0].clientX, dir)
        const onMove = (e) => { e.preventDefault(); moveDrag(e.touches[0].clientX) }
        const onEnd  = () => {
          document.removeEventListener('touchmove', onMove)
          document.removeEventListener('touchend', onEnd)
          endDrag()
        }
        document.addEventListener('touchmove', onMove, { passive: false })
        document.addEventListener('touchend', onEnd)
      },
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  const current = PAGES[index]
  const flipTarget = flip ? PAGES[flip.to] : null

  // Compute drag target page
  const dragTargetIndex = dragDir
    ? (dragDir === 'forward' ? index + 1 : index - 1) : null
  const dragTarget = (dragTargetIndex !== null && dragTargetIndex >= 0 && dragTargetIndex < total)
    ? PAGES[dragTargetIndex] : null

  // Static halves: the faces shown BEHIND the flipping/dragging page
  const anyDir    = flip?.dir || dragDir
  const anyTarget = flipTarget || dragTarget
  const staticLeft  = (anyDir === 'backward' && anyTarget) ? anyTarget : current
  const staticRight = (anyDir === 'forward'  && anyTarget) ? anyTarget : current

  const canPrev = index > 0
  const canNext = index < total - 1
  const canDragFwd = !flip && !isDragging && index < total - 1
  const canDragBwd = !flip && !isDragging && index > 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(46,58,92,0.95)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'fb-fade-in 0.3s ease',
      cursor: isDragging ? 'grabbing' : 'default',
    }}>
      <style>{`
        @keyframes fb-fade-in { from { opacity:0 } to { opacity:1 } }
        @keyframes fb-flip-fwd { from { transform:rotateY(0deg) } to { transform:rotateY(-180deg) } }
        @keyframes fb-flip-bwd { from { transform:rotateY(0deg) } to { transform:rotateY(180deg) } }
        .fb-3d   { transform-style: preserve-3d; }
        .fb-face { backface-visibility:hidden; -webkit-backface-visibility:hidden; position:absolute; inset:0; overflow:hidden; }
        .fb-back { transform:rotateY(180deg); }
        .fb-edge-fwd:hover, .fb-edge-bwd:hover { background: rgba(46,58,92,0.06); }
      `}</style>

      {/* Close */}
      <button onClick={onClose} aria-label="Close" style={{
        position: 'absolute', top: 16, right: 16,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.75)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Book + side arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <ArrowBtn onClick={() => navigate('backward')} disabled={!canPrev || !!flip || isDragging} dir="left" />

        {/* Book */}
        <div style={{ perspective: '1500px' }}>
          <div ref={bookRef} style={{
            width: 'min(600px, 92vw)',
            height: 'min(450px, calc(92vw * 0.75))',
            position: 'relative', borderRadius: 4,
            boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
          }}>

            {/* Static left half */}
            <div style={{
              position: 'absolute', left: 0, top: 0,
              width: '50%', height: '100%', overflow: 'hidden',
              borderRadius: '4px 0 0 4px',
            }}>
              <LeftFace page={staticLeft} />
            </div>

            {/* Static right half */}
            <div style={{
              position: 'absolute', right: 0, top: 0,
              width: '50%', height: '100%', overflow: 'hidden',
              borderRadius: '0 4px 4px 0',
            }}>
              <RightFace page={staticRight} />
            </div>

            {/* Spine */}
            <div style={{
              position: 'absolute', left: '50%', top: 0, width: 3, height: '100%',
              zIndex: 5, transform: 'translateX(-50%)', pointerEvents: 'none',
              background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 100%)',
            }} />

            {/* Drag hotspot — forward (right edge) */}
            {canDragFwd && (
              <div className="fb-edge-fwd" {...makeEdgeHandlers('forward')} style={{
                position: 'absolute', right: 0, top: 0,
                width: 50, height: '100%', zIndex: 6,
                cursor: 'grab', borderRadius: '0 4px 4px 0',
                transition: 'background 0.2s',
              }} />
            )}

            {/* Drag hotspot — backward (left edge) */}
            {canDragBwd && (
              <div className="fb-edge-bwd" {...makeEdgeHandlers('backward')} style={{
                position: 'absolute', left: 0, top: 0,
                width: 50, height: '100%', zIndex: 6,
                cursor: 'grab', borderRadius: '4px 0 0 4px',
                transition: 'background 0.2s',
              }} />
            )}

            {/* Arrow-button / keyboard flip */}
            {flip && (
              <div className="fb-3d" style={{
                position: 'absolute', top: 0, width: '50%', height: '100%', zIndex: 10,
                ...(flip.dir === 'forward' ? {
                  left: '50%', transformOrigin: 'left center',
                  animation: 'fb-flip-fwd 0.6s ease-in-out forwards',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.25)',
                } : {
                  left: 0, transformOrigin: 'right center',
                  animation: 'fb-flip-bwd 0.6s ease-in-out forwards',
                  boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
                }),
              }}>
                <div className="fb-face">
                  {flip.dir === 'forward' ? <RightFace page={current} /> : <LeftFace page={current} />}
                </div>
                <div className="fb-face fb-back">
                  {flip.dir === 'forward' ? <LeftFace page={flipTarget} /> : <RightFace page={flipTarget} />}
                </div>
              </div>
            )}

            {/* Drag flip element */}
            {isDragging && dragDir && dragTarget && (
              <div ref={dragFlipRef} className="fb-3d" style={{
                position: 'absolute', top: 0, width: '50%', height: '100%', zIndex: 10,
                ...(dragDir === 'forward' ? {
                  left: '50%', transformOrigin: 'left center',
                  transform: 'rotateY(0deg)',
                } : {
                  left: 0, transformOrigin: 'right center',
                  transform: 'rotateY(0deg)',
                }),
              }}>
                <div className="fb-face">
                  {dragDir === 'forward' ? <RightFace page={current} /> : <LeftFace page={current} />}
                </div>
                <div className="fb-face fb-back">
                  {dragDir === 'forward' ? <LeftFace page={dragTarget} /> : <RightFace page={dragTarget} />}
                </div>
              </div>
            )}
          </div>
        </div>

        <ArrowBtn onClick={() => navigate('forward')} disabled={!canNext || !!flip || isDragging} dir="right" />
      </div>

      {/* Page counter */}
      <p style={{
        marginTop: 22, fontFamily: 'monospace', fontSize: 13,
        letterSpacing: '0.12em', color: 'rgba(255,255,255,0.38)', userSelect: 'none',
      }}>
        {index + 1} / {total}
      </p>
    </div>
  )
}

function ArrowBtn({ onClick, disabled, dir }) {
  return (
    <button onClick={onClick} disabled={disabled}
      aria-label={dir === 'left' ? 'Previous' : 'Next'}
      style={{
        width: 44, height: 44, borderRadius: '50%',
        background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.14)',
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.78)',
        flexShrink: 0, transition: 'background 0.2s',
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  )
}
