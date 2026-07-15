import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

const BASE = import.meta.env.BASE_URL

// ─── Focusable-element helper (for the focus trap) ──────────────────────────────
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
function getFocusable(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE))
}

// ─── Inner content — three blocks: identity / voice / links ─────────────────────
// Rendered as direct flex children of the panel so the voice block can flex-scroll
// while identity and links stay fixed.
function BioContent({ member, bio, onClose, titleId }) {
  return (
    <>
      {/* 1 — Identity: photo · name · role, with a hairline beneath (fixed) */}
      <div className="shrink-0 flex items-start gap-3 pb-3.5 border-b border-border">
        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-border/30 flex items-center justify-center">
          {member.image ? (
            <img
              src={BASE + member.image.replace(/^\//, '')}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display text-base text-navy/40">{member.initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 id={titleId} className="font-display text-[21px] font-semibold text-navy leading-tight">
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-sage">
              {member.role}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onClose('button')}
          aria-label={`Close ${member.name}'s bio`}
          className="-mr-1 -mt-1 shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-navy/40 hover:text-coral hover:bg-navy/[0.04] transition-colors"
        >
          <span aria-hidden="true" className="text-[22px] leading-none">&times;</span>
        </button>
      </div>

      {/* 2 — Voice: answers dominate; questions are quiet mono dividers (scrolls) */}
      <div className="mt-3.5 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
        {Array.isArray(bio.bio) && (
          <div className="space-y-3">
            {bio.bio.map((para, i) => (
              <p key={`p-${i}`} className="text-[15px] leading-relaxed text-text/90">
                {para}
              </p>
            ))}
          </div>
        )}

        {Array.isArray(bio.qa) &&
          bio.qa.map((item, i) => (
            <div key={`q-${i}`} className="mt-5 first:mt-0">
              {item.q && (
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-sage">
                  {item.q}
                </p>
              )}
              <p className="mt-1.5 text-[15px] leading-relaxed text-text/90">{item.a}</p>
            </div>
          ))}
      </div>

      {/* 3 — Links: uppercase mono text row above a hairline (fixed) */}
      {Array.isArray(bio.links) && bio.links.length > 0 && (
        <div className="shrink-0 mt-4 pt-3.5 border-t border-border flex flex-wrap gap-x-4 gap-y-1.5">
          {bio.links.map((link, i) => (
            <a
              key={`l-${i}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11.5px] uppercase tracking-[0.1em] text-sage transition-colors hover:text-coral focus-visible:text-coral"
            >
              {link.label}
              <span aria-hidden="true" className="text-[13px] leading-none">&#8599;</span>
            </a>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Centered modal — identical on every device/size ────────────────────────────
export default function TeamBioPopover({ member, bio, reduced, onRequestClose }) {
  const panelRef = useRef(null)
  const titleId = `bio-popover-title-${member.id}`

  // Move focus into the modal once, on open.
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  // Lock background scroll while open; restore on close (compensate scrollbar width
  // so the page behind doesn't shift).
  useEffect(() => {
    const { body, documentElement } = document
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    const scrollbar = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
    }
  }, [])

  // Focus trap + Escape.
  useEffect(() => {
    const panel = panelRef.current

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onRequestClose('escape')
        return
      }
      if (e.key === 'Tab') {
        const f = getFocusable(panel)
        if (f.length === 0) {
          e.preventDefault()
          return
        }
        const first = f[0]
        const last = f[f.length - 1]
        const active = document.activeElement
        if (e.shiftKey) {
          if (active === first || active === panel || !panel.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [onRequestClose])

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      {/* Dim, warm backdrop — click to dismiss */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.12 : 0.2 }}
        className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
        onClick={() => onRequestClose('backdrop')}
      />

      {/* Centered panel */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        transition={{ duration: reduced ? 0.12 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col w-full max-w-[380px] rounded-xl px-5 py-4 outline-none bg-bg border border-border shadow-[0_10px_40px_rgba(46,58,92,0.16),0_2px_8px_rgba(46,58,92,0.08)]"
        style={{ maxHeight: 'min(80vh, 560px)' }}
      >
        <BioContent member={member} bio={bio} onClose={onRequestClose} titleId={titleId} />
      </motion.div>
    </div>,
    document.body,
  )
}
