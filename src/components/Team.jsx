import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { teamMembers, alumni } from '../data/team'
import TypewriterLabel from './TypewriterLabel'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─── Constants ────────────────────────────────────────────────────────────────
const HS_RADIUS   = 40
const HS_DIAM     = 80
const FRICTION    = 0.999
const ROT_FRIC    = 0.996
const RESTITUTION = 1.0   // eslint-disable-line no-unused-vars
const DROP_MARGIN = 24
const INIT_SPEED  = 1.92

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const COLORS = ['#6B8F6B', '#2E3A5C', '#E07B6A', '#F5F0E8', '#A8C5A0']
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const left   = 10 + Math.random() * 80
      const tx     = (Math.random() - 0.5) * 400
      const ty     = 200 + Math.random() * 300
      const rot    = (Math.random() - 0.5) * 1440
      const size   = 5 + Math.random() * 7
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)]
      const delay  = Math.random() * 0.6
      const dur    = 1.2 + Math.random() * 0.8
      const circle = Math.random() > 0.5
      return { i, left, tx, ty, rot, size, color, delay, dur, circle }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      {particles.map(p => (
        <div
          key={p.i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '30%',
            width:  p.circle ? p.size : p.size * 0.7,
            height: p.circle ? p.size : p.size * 1.6,
            borderRadius: p.circle ? '50%' : 2,
            background: p.color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rot': `${p.rot}deg`,
            animation: `confetti-fly ${p.dur}s ease-out ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

// ─── MemberCard ───────────────────────────────────────────────────────────────
function MemberCard({ member, base }) {
  return (
    <>
      <div className="w-[72px] h-[72px] rounded-full mx-auto bg-border/30 flex items-center justify-center overflow-hidden">
        {member.image ? (
          <img
            src={base + member.image.replace(/^\//, '')}
            alt={member.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-display text-xl text-navy/30">{member.initials}</span>
        )}
      </div>
      <h3 className="mt-2.5 font-display text-[19px] font-semibold text-navy leading-tight">
        {member.name}
      </h3>
      {member.role && (
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-sage">
          {member.role}
        </p>
      )}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Team() {
  const reduced = useReducedMotion()

  const [gameState, setGameState] = useState('idle')   // 'idle' | 'playing' | 'complete'
  const [matched,   setMatched]   = useState(new Set())
  const [isDesktop, setIsDesktop] = useState(false)
  const [gaveUp,    setGaveUp]    = useState(false)

  const base = import.meta.env.BASE_URL

  // Refs — physics state (no re-renders per frame)
  const activeRef       = useRef(false)
  const rafRef          = useRef(null)
  const containerRef    = useRef(null)
  const containerSize   = useRef({ w: 0, h: 0 })
  const headshotsRef    = useRef([])   // { memberId, x, y, vx, vy, rot, rotV, r, placed, dragging }
  const slotsRef        = useRef([])   // { memberId, x, y, w, h, circleCx, circleCy, matched }
  const hsNodeRefs      = useRef([])   // DOM refs for floating headshot divs
  const slotNodeRefs    = useRef([])   // DOM refs for slot divs
  const idleNodeRefs    = useRef([])   // DOM refs for normal grid cards

  const isPlaying = gameState === 'playing' || gameState === 'complete'

  // Detect pointer device once
  useEffect(() => {
    setIsDesktop(window.matchMedia('(pointer: fine)').matches)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => {
    activeRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Activate ────────────────────────────────────────────────────────────────
  function activate() {
    if (gameState !== 'idle' || reduced || !isDesktop) return
    const container = containerRef.current
    if (!container) return

    const cRect = container.getBoundingClientRect()
    const cW = cRect.width
    const cH = cRect.height
    containerSize.current = { w: cW, h: Math.max(cH + 150, 500) }

    const slots = []
    const headshots = []

    teamMembers.forEach((member, i) => {
      const node = idleNodeRefs.current[i]
      if (!node) return
      const r  = node.getBoundingClientRect()
      const sx = r.left - cRect.left
      const sy = r.top  - cRect.top
      const sw = r.width
      const sh = r.height

      const circleCx = sx + sw / 2
      const circleCy = sy + HS_RADIUS

      slots.push({ memberId: member.id, x: sx, y: sy, w: sw, h: sh, circleCx, circleCy, matched: false })

      // All headshots start nearly still — Tatsuya launches after the power-up
      const angle = Math.random() * Math.PI * 2
      const drift = 0.25 * Math.random()
      const vx    = Math.cos(angle) * drift
      const vy    = Math.sin(angle) * drift
      const rotV  = (Math.random() - 0.5) * 0.08

      headshots.push({
        memberId: member.id,
        x: circleCx,
        y: circleCy,
        vx, vy, rot: 0, rotV,
        r: HS_RADIUS,
        placed: false,
        dragging: false,
      })
    })

    slotsRef.current     = slots
    headshotsRef.current = headshots
    activeRef.current    = true
    setMatched(new Set())
    setGameState('playing')
  }

  // ── Start physics loop + billiard-break sequence when gameState → 'playing' ─
  useEffect(() => {
    if (gameState !== 'playing') return
    startLoop()

    // Power-up: Tatsuya's headshot pulses for 500ms, then launches toward cluster
    const tatsuNode = hsNodeRefs.current[0]
    if (tatsuNode) {
      tatsuNode.style.animation = 'hs-powerup 0.55s ease forwards'
      setTimeout(() => {
        if (!activeRef.current) return
        if (tatsuNode) tatsuNode.style.animation = ''
        const tatsu = headshotsRef.current[0]
        if (!tatsu) return
        // Aim at the centroid of all other headshots
        const others = headshotsRef.current.slice(1)
        const avgX = others.reduce((s, h) => s + h.x, 0) / (others.length || 1)
        const avgY = others.reduce((s, h) => s + h.y, 0) / (others.length || 1)
        const dx = avgX - tatsu.x, dy = avgY - tatsu.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        tatsu.vx   = (dx / dist) * 8
        tatsu.vy   = (dy / dist) * 8
        tatsu.rotV = 1.5
      }, 550)
    }

    return () => { activeRef.current = false; cancelAnimationFrame(rafRef.current) }
  }, [gameState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Completion check ──────────────────────────────────────────────────────
  useEffect(() => {
    if (matched.size === teamMembers.length && gameState === 'playing') {
      setGameState('complete')
      setTimeout(() => deactivate(), 3200)
    }
  }, [matched, gameState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Physics step ──────────────────────────────────────────────────────────
  function step() {
    const hs = headshotsRef.current
    const { w: CW, h: CH } = containerSize.current

    for (let i = 0; i < hs.length; i++) {
      const c = hs[i]
      if (c.placed || c.dragging) continue

      c.x   += c.vx;  c.y   += c.vy;  c.rot += c.rotV
      c.vx  *= FRICTION;  c.vy  *= FRICTION;  c.rotV *= ROT_FRIC

      if (c.x - c.r < 0)       { c.x = c.r;      c.vx =  Math.abs(c.vx);  c.rotV -= c.vy * 0.05 }
      if (c.y - c.r < 0)       { c.y = c.r;      c.vy =  Math.abs(c.vy);  c.rotV += c.vx * 0.05 }
      if (c.x + c.r > CW)      { c.x = CW - c.r; c.vx = -Math.abs(c.vx);  c.rotV += c.vy * 0.05 }
      if (c.y + c.r > CH)      { c.y = CH - c.r; c.vy = -Math.abs(c.vy);  c.rotV -= c.vx * 0.05 }
    }

    // Circle-circle elastic collisions
    for (let i = 0; i < hs.length; i++) {
      for (let j = i + 1; j < hs.length; j++) {
        const a = hs[i], b = hs[j]
        if (a.placed || b.placed || a.dragging || b.dragging) continue
        const dx   = b.x - a.x
        const dy   = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minD = a.r + b.r
        if (dist >= minD || dist === 0) continue
        const nx  = dx / dist
        const ny  = dy / dist
        const dot = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
        if (dot <= 0) continue
        a.vx -= dot * nx;  a.vy -= dot * ny
        b.vx += dot * nx;  b.vy += dot * ny
        const overlap = (minD - dist) / 2 + 0.5
        a.x -= nx * overlap;  a.y -= ny * overlap
        b.x += nx * overlap;  b.y += ny * overlap
        const tang = (a.vx - b.vx) * (-ny) + (a.vy - b.vy) * nx
        a.rotV += tang * 0.06
        b.rotV -= tang * 0.06
      }
    }

    // Velocity-based tilt
    for (let i = 0; i < hs.length; i++) {
      const c = hs[i]
      if (c.placed || c.dragging) continue
      if (Math.abs(c.rotV) < 0.3) {
        const target = Math.max(-12, Math.min(12, c.vx * 1.8))
        c.rot += (target - c.rot) * 0.04
      }
    }

    // Write to DOM
    for (let i = 0; i < hs.length; i++) {
      const node = hsNodeRefs.current[i]
      if (!node) continue
      const { x, y, rot } = hs[i]
      node.style.transform = `translate(${x - HS_RADIUS}px, ${y - HS_RADIUS}px) rotate(${rot}deg)`
    }
  }

  function startLoop() {
    function loop() {
      if (!activeRef.current) return
      step()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  // ── Drag ──────────────────────────────────────────────────────────────────
  function startDrag(idx, clientX, clientY) {
    const hs = headshotsRef.current[idx]
    if (!hs || hs.placed) return
    hs.dragging = true
    hs.vx = 0; hs.vy = 0

    const node = hsNodeRefs.current[idx]
    if (node) { node.style.zIndex = '100'; node.style.cursor = 'grabbing' }

    let cx = clientX, cy = clientY
    const hist = [{ x: clientX, y: clientY, t: performance.now() }]

    function onMove(e) {
      const nx = e.clientX, ny = e.clientY
      hs.x += nx - cx;  hs.y += ny - cy
      cx = nx;  cy = ny
      hist.push({ x: nx, y: ny, t: performance.now() })
      if (hist.length > 8) hist.shift()
      if (node) node.style.transform = `translate(${hs.x - HS_RADIUS}px, ${hs.y - HS_RADIUS}px) rotate(${hs.rot}deg)`
    }

    function onUp() {
      if (node) { node.style.zIndex = '10'; node.style.cursor = 'grab' }
      hs.dragging = false

      // Check drop zones
      let dropped = false
      const slots = slotsRef.current
      for (let si = 0; si < slots.length; si++) {
        const slot = slots[si]
        if (slot.matched) continue
        const inX = hs.x >= slot.x - DROP_MARGIN && hs.x <= slot.x + slot.w + DROP_MARGIN
        const inY = hs.y >= slot.y - DROP_MARGIN && hs.y <= slot.y + slot.h + DROP_MARGIN
        if (inX && inY) {
          if (hs.memberId === slot.memberId) {
            correctMatch(idx, si)
          } else {
            wrongMatch(idx, si)
          }
          dropped = true
          break
        }
      }

      if (!dropped) {
        // Flick velocity from history
        if (hist.length >= 2) {
          const a = hist[0], b = hist[hist.length - 1]
          const dt = Math.max((b.t - a.t) / 16, 1)
          hs.vx   = ((b.x - a.x) / dt) * 0.45
          hs.vy   = ((b.y - a.y) / dt) * 0.45
          hs.rotV = hs.vx * 0.12
        }
      }

      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  // ── Correct match ─────────────────────────────────────────────────────────
  function correctMatch(hsIdx, slotIdx) {
    const hs   = headshotsRef.current[hsIdx]
    const slot = slotsRef.current[slotIdx]
    hs.placed  = true
    hs.vx = 0; hs.vy = 0; hs.rotV = 0
    slot.matched = true
    hs.x = slot.circleCx
    hs.y = slot.circleCy
    hs.rot = 0

    const node = hsNodeRefs.current[hsIdx]
    if (node) {
      const cx = slot.circleCx - HS_RADIUS
      const cy = slot.circleCy - HS_RADIUS
      node.style.transition = 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)'
      node.style.transform  = `translate(${cx}px, ${cy}px) scale(1.25)`
      setTimeout(() => {
        node.style.transform  = `translate(${cx}px, ${cy}px) scale(1)`
        node.style.transition = 'transform 0.15s ease-out'
        setTimeout(() => { node.style.transition = '' }, 160)
      }, 280)
    }

    const memberId = hs.memberId
    setTimeout(() => {
      setMatched(prev => { const n = new Set(prev); n.add(memberId); return n })
    }, 400)
  }

  // ── Wrong match ───────────────────────────────────────────────────────────
  function wrongMatch(hsIdx, slotIdx) {
    const hs = headshotsRef.current[hsIdx]
    hs.vx = (Math.random() - 0.5) * 3
    hs.vy = -2.5

    const circle = slotNodeRefs.current[slotIdx]?.querySelector('[data-slot-circle]')
    if (circle) {
      circle.style.borderColor = '#E07B6A'
      setTimeout(() => { circle.style.borderColor = '' }, 500)
    }
  }

  // ── Give up ───────────────────────────────────────────────────────────────
  function giveUp() {
    setGaveUp(true)
    activeRef.current = false

    const hs    = headshotsRef.current
    const slots = slotsRef.current

    hs.forEach((h, hsIdx) => {
      if (h.placed) return
      const slot = slots.find(s => s.memberId === h.memberId)
      if (!slot) return
      h.placed     = true
      slot.matched = true
      h.vx = 0; h.vy = 0; h.rotV = 0

      const node = hsNodeRefs.current[hsIdx]
      if (node) {
        const cx = slot.circleCx - HS_RADIUS
        const cy = slot.circleCy - HS_RADIUS
        node.style.transition = 'transform 0.6s ease-out'
        node.style.transform  = `translate(${cx}px, ${cy}px) rotate(0deg)`
      }
    })

    setTimeout(() => {
      setMatched(new Set(teamMembers.map(m => m.id)))
    }, 680)
  }

  // ── Deactivate ────────────────────────────────────────────────────────────
  function deactivate() {
    activeRef.current = false
    cancelAnimationFrame(rafRef.current)
    setGameState('idle')
    setMatched(new Set())
    setGaveUp(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section id="team" className="py-24 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">

        {/* Section label */}
        <div className="mb-10">
          <TypewriterLabel text="The Team" />
        </div>

        {/* Group page link */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12"
        >
          <a
            href="https://www.tsl.ac.uk/our-work/scientific-groups/tatsuya-nobori-group"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.15em] text-navy hover:text-coral transition-colors"
          >
            Visit our group page &rarr;
          </a>
        </motion.div>

        {/* Game controls bar */}
        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, animation: 'team-fade-in 0.3s ease' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15, color: 'rgba(46,58,92,0.45)', flexGrow: 1 }}>
              Drag each face to its matching name
            </span>
            {gameState !== 'complete' && (
              <button
                onClick={giveUp}
                style={{
                  fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em',
                  textTransform: 'uppercase', padding: '5px 16px', borderRadius: 999,
                  background: 'transparent', border: '1px solid rgba(224,123,106,0.5)',
                  color: 'rgba(224,123,106,0.75)', cursor: 'pointer',
                }}
              >
                Give up
              </button>
            )}
            <button
              onClick={deactivate}
              style={{
                fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '5px 16px', borderRadius: 999,
                background: 'transparent', border: '1px solid rgba(46,58,92,0.22)',
                color: 'rgba(46,58,92,0.50)', cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Members area */}
        {isPlaying ? (
          /* ── Game layout ─────────────────────────────────────────────── */
          <div
            ref={containerRef}
            style={{ position: 'relative', height: containerSize.current.h }}
          >
            {/* Slots */}
            {slotsRef.current.map((slot, si) => {
              const member    = teamMembers.find(m => m.id === slot.memberId)
              const isMatched = matched.has(slot.memberId)
              return (
                <div
                  key={slot.memberId}
                  ref={el => { slotNodeRefs.current[si] = el }}
                  style={{
                    position: 'absolute',
                    left: slot.x,
                    top:  slot.y,
                    width: slot.w,
                    textAlign: 'center',
                  }}
                >
                  {/* Circle drop target */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      data-slot-circle
                      style={{
                        width: HS_DIAM, height: HS_DIAM,
                        borderRadius: '50%',
                        border: `2px dashed ${isMatched ? '#6B8F6B' : 'rgba(46,58,92,0.22)'}`,
                        transition: 'border-color 0.3s ease',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto',
                        background: isMatched ? 'transparent' : 'rgba(46,58,92,0.04)',
                      }}
                    >
                      {isMatched && member?.image && (
                        <img
                          src={base + member.image.replace(/^\//, '')}
                          alt={member?.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'slot-match-in 0.3s ease-out' }}
                        />
                      )}
                    </div>
                    {/* Checkmark badge */}
                    {isMatched && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(calc(-50% + 28px))',
                        width: 20, height: 20,
                        borderRadius: '50%',
                        background: '#6B8F6B',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'slot-check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
                      }}>
                        <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>
                      </div>
                    )}
                  </div>

                  {/* Name + role */}
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#2E3A5C', lineHeight: 1.2 }}>
                      {member?.name}
                    </div>
                    {member?.role && (
                      <div style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B8F6B', marginTop: 2 }}>
                        {member.role}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Floating headshots */}
            {headshotsRef.current.map((hs, i) => {
              if (matched.has(hs.memberId)) return null
              const member = teamMembers.find(m => m.id === hs.memberId)
              return (
                <div
                  key={hs.memberId}
                  ref={el => { hsNodeRefs.current[i] = el }}
                  style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    width: HS_DIAM, height: HS_DIAM,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    transform: `translate(${hs.x - HS_RADIUS}px, ${hs.y - HS_RADIUS}px)`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    border: '2px solid rgba(255,255,255,0.7)',
                    cursor: 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                    willChange: 'transform',
                    zIndex: 10,
                  }}
                  onMouseDown={e => { e.preventDefault(); startDrag(i, e.clientX, e.clientY) }}
                >
                  {member?.image ? (
                    <img
                      src={base + member.image.replace(/^\//, '')}
                      alt=""
                      draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(46,58,92,0.15)',
                      fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(46,58,92,0.5)',
                    }}>
                      {member?.initials}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Completion overlay */}
            {gameState === 'complete' && (
              <>
                {!gaveUp && <Confetti />}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  pointerEvents: 'none', zIndex: 60,
                  paddingTop: 24,
                }}>
                  <div style={{
                    background: 'rgba(250,250,246,0.95)',
                    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                    padding: '24px 40px',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(46,58,92,0.14), 0 1px 4px rgba(46,58,92,0.08)',
                    animation: 'team-fade-in 0.5s ease 0.55s both',
                    textAlign: 'center',
                  }}>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: 'clamp(22px, 4vw, 32px)',
                      color: '#2E3A5C',
                      margin: 0,
                    }}>
                      {gaveUp ? 'Better luck next time! 👀' : '🎉 You know the team!'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── Normal grid ─────────────────────────────────────────────── */
          <div
            ref={containerRef}
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8"
          >
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.id}
                ref={el => { idleNodeRefs.current[i] = el }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="text-center"
              >
                {member.id === 1 ? (
                  /* Tatsuya — subtle hover hint + double-click to activate */
                  <div
                    className="tatsuya-hint"
                    onDoubleClick={activate}
                    style={{ userSelect: 'none' }}
                  >
                    <div className="tatsuya-photo w-[72px] h-[72px] rounded-full mx-auto bg-border/30 flex items-center justify-center overflow-hidden">
                      {member.image ? (
                        <img src={base + member.image.replace(/^\//, '')} alt={member.name}
                          loading="lazy" className="w-full h-full object-cover" draggable={false} />
                      ) : (
                        <span className="font-display text-xl text-navy/30">{member.initials}</span>
                      )}
                    </div>
                    <h3 className="mt-2.5 font-display text-[19px] font-semibold text-navy leading-tight">{member.name}</h3>
                    {member.role && (
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-sage">{member.role}</p>
                    )}
                  </div>
                ) : (
                  <MemberCard member={member} base={base} />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Join Us card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-14 max-w-2xl mx-auto bg-bg rounded-xl border border-border border-l-4 border-l-sage p-6 md:p-8"
        >
          <h3 className="font-display text-[28px] font-semibold text-navy mb-3">
            Join Us!
          </h3>
          <p className="text-[17px] text-text/60 leading-relaxed">
            If you are interested in joining our lab, please{' '}
            <a
              href="mailto:tatsuya.nobori@tsl.ac.uk"
              className="text-navy underline underline-offset-2 hover:text-coral transition-colors"
            >
              email Tatsuya
            </a>{' '}
            your <span className="text-sage font-medium">CV</span> along with a{' '}
            <span className="text-sage font-medium">cover letter</span> that includes:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] text-text/60 leading-relaxed pl-5">
            <li className="list-disc">Your research experience so far</li>
            <li className="list-disc">(for PD/PhD) your intended research focus</li>
            <li className="list-disc">Why you are interested in joining us at TSL</li>
          </ul>
        </motion.div>

        {/* Alumni */}
        {alumni.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h3 className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/30 mb-4">
              Alumni
            </h3>
            <div className="space-y-2">
              {alumni.map((alum, i) => (
                <div key={i} className="flex flex-wrap gap-x-3 gap-y-0.5 text-[16px]">
                  <span className="text-navy font-medium">{alum.name}</span>
                  <span className="text-text/35">{alum.period}</span>
                  {alum.current && (
                    <span className="text-text/45">&rarr; {alum.current}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      <style>{`
        @keyframes team-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slot-match-in {
          0%   { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes slot-check-in {
          0%   { transform: translateX(calc(-50% + 28px)) scale(0); opacity: 0; }
          100% { transform: translateX(calc(-50% + 28px)) scale(1); opacity: 1; }
        }
        @keyframes confetti-fly {
          0%   { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.5); }
        }
        /* Tatsuya card — subtle hover hint */
        .tatsuya-hint { cursor: default; }
        .tatsuya-hint:hover {
          animation: tatsuya-wiggle 2s ease-in-out infinite;
        }
        .tatsuya-hint:hover .tatsuya-photo {
          box-shadow: 0 0 0 3px rgba(107,143,107,0.22), 0 0 18px rgba(107,143,107,0.14);
          transition: box-shadow 0.4s ease;
        }
        @keyframes tatsuya-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25%  { transform: rotate(-1.5deg); }
          75%  { transform: rotate(1.5deg); }
        }
        /* Power-up glow on Tatsuya's floating headshot */
        @keyframes hs-powerup {
          0%   { box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                 border-color: rgba(255,255,255,0.7); }
          45%  { box-shadow: 0 0 0 5px rgba(107,143,107,0.55),
                             0 0 32px rgba(107,143,107,0.5),
                             0 4px 16px rgba(0,0,0,0.18);
                 border-color: rgba(107,143,107,0.9); }
          100% { box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                 border-color: rgba(255,255,255,0.7); }
        }
      `}</style>
    </section>
  )
}
