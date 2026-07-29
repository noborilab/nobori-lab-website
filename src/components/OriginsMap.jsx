import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { currentCountries, alumniCountries } from '../data/origins'
import TypewriterLabel from './TypewriterLabel'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ── Visual mode ──────────────────────────────────────────────────────────────
// 'arcs'       — thin arcs from each origin country converging on Norwich
// 'choropleth' — no arcs; origin countries filled instead
const MODE = 'arcs'

// One-time choreographed draw-in when the map first scrolls into view:
// arcs launch staggered but all arrive at Norwich together, then a single
// soft ripple marks the arrival. ('arcs' mode only; skipped under reduced motion.)
const DRAW_IN = true

// After the draw-in, a lone comet occasionally travels one current-member arc
// into Norwich (every 6–9 s, one at a time; alumni arcs stay still).
const AMBIENT_PULSES = true

const NORWICH = [1.3, 52.63] // lon, lat

// The map dataset labels some countries differently from how we want to show them.
const DISPLAY_NAMES = { MK: 'Macedonia' }

// ── Projection (Natural Earth I) ─────────────────────────────────────────────
// Polynomial approximation from Šavrič et al. 2011 — the same formula d3-geo's
// geoNaturalEarth1 uses; implemented inline to avoid a dependency.

const RAD = Math.PI / 180

function naturalEarth1Raw(lon, lat) {
  const l = lon * RAD
  const phi = lat * RAD
  const phi2 = phi * phi
  const phi4 = phi2 * phi2
  return [
    l * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))),
  ]
}

const VB_W = 960
const PAD = 8
// Land bounds aspect for VB_W=960 (Antarctica excluded) — keeps the wrapper's
// height stable while the map chunk loads.
const VB_H_APPROX = 427

function polygonsOf(feature) {
  const g = feature.geometry
  return g.type === 'Polygon' ? [g.coordinates] : g.coordinates
}

// Fit the projected land into a VB_W-wide viewBox and return svg-space helpers.
function buildProjection(features) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const f of features) {
    for (const poly of polygonsOf(f)) {
      for (const ring of poly) {
        for (const [lon, lat] of ring) {
          const [x, y] = naturalEarth1Raw(lon, lat)
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
  }
  const scale = (VB_W - 2 * PAD) / (maxX - minX)
  const height = (maxY - minY) * scale + 2 * PAD
  const project = (lon, lat) => {
    const [x, y] = naturalEarth1Raw(lon, lat)
    return [(x - minX) * scale + PAD, (maxY - y) * scale + PAD] // svg y grows downward
  }
  return { project, height }
}

function featurePath(feature, project) {
  let d = ''
  for (const poly of polygonsOf(feature)) {
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat)
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      d += 'Z'
    }
  }
  return d
}

// Centroid of the country's largest outer ring (planar shoelace in lon/lat) —
// keeps island-heavy countries anchored on their main landmass.
function mainCentroid(feature) {
  let best = null
  let bestArea = -1
  for (const poly of polygonsOf(feature)) {
    const ring = poly[0]
    let a = 0, cx = 0, cy = 0
    for (let i = 0; i < ring.length - 1; i++) {
      const cross = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
      a += cross
      cx += (ring[i][0] + ring[i + 1][0]) * cross
      cy += (ring[i][1] + ring[i + 1][1]) * cross
    }
    const area = Math.abs(a)
    if (area > bestArea) {
      bestArea = area
      best = area > 0 ? [cx / (3 * a), cy / (3 * a)] : ring[0]
    }
  }
  return best
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Gentle quadratic bezier from origin to Norwich, bowed away from the chord.
// Returns the path and its length (sampled — avoids getTotalLength() on live DOM),
// which drives the draw-in and pulse timing.
function arcGeometry(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const chord = Math.hypot(dx, dy) || 1
  let px = -dy / chord
  let py = dx / chord
  if (py > 0) { px = -px; py = -py } // bow toward the top of the map
  const k = Math.min(chord * 0.18, 60)
  const cx = (x1 + x2) / 2 + px * k
  const cy = (y1 + y2) / 2 + py * k

  let len = 0
  let qx = x1, qy = y1
  for (let i = 1; i <= 16; i++) {
    const t = i / 16
    const u = 1 - t
    const sx = u * u * x1 + 2 * u * t * cx + t * t * x2
    const sy = u * u * y1 + 2 * u * t * cy + t * t * y2
    len += Math.hypot(sx - qx, sy - qy)
    qx = sx; qy = sy
  }

  return {
    d: `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
    len,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function OriginsMap() {
  const reduced = useReducedMotion()
  const [world, setWorld] = useState(null)
  const [small, setSmall] = useState(false)
  const [hot, setHot] = useState(null) // origin country code | 'norwich' | null

  // Intro / pulse choreography state
  const [inView, setInView] = useState(false)    // latched: map has scrolled into view
  const [live, setLive] = useState(false)        // currently visible (gates the pulse scheduler)
  const [drawn, setDrawn] = useState(false)      // draw-in finished
  const [drawScale, setDrawScale] = useState(1)  // screen px per viewBox unit, measured at trigger
  const [pulse, setPulse] = useState(null)       // { code, seq } | null — at most one comet in flight

  const wrapRef = useRef(null)
  const tipRef = useRef(null)
  const tipTimerRef = useRef(null)
  const measuredRef = useRef(false)
  const pulseIdxRef = useRef(0)
  const pulseSeqRef = useRef(0)

  // The base map is ~160 kB of JSON — load it as its own chunk, on demand.
  useEffect(() => {
    let alive = true
    import('../data/world-110m.json').then((m) => { if (alive) setWorld(m.default) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setSmall(mq.matches)
    const handler = (e) => setSmall(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => () => clearTimeout(tipTimerRef.current), [])

  const map = useMemo(() => {
    if (!world) return null
    const { project, height } = buildProjection(world.features)

    const byIso = new Map(world.features.map((f) => [f.properties.iso, f]))
    const nameOf = (code) => DISPLAY_NAMES[code] ?? byIso.get(code)?.properties.name ?? code
    const mkOrigin = (code, alumni) => {
      const f = byIso.get(code)
      if (!f) return null
      const [x, y] = project(...mainCentroid(f))
      return { code, name: nameOf(code), x, y, alumni }
    }

    const currentSet = new Set(currentCountries)
    // A country in both lists renders as current only.
    const origins = [
      ...currentCountries.map((c) => mkOrigin(c, false)),
      ...alumniCountries.filter((c) => !currentSet.has(c)).map((c) => mkOrigin(c, true)),
    ].filter(Boolean)

    const status = new Map(origins.map((o) => [o.code, o.alumni ? 'alumni' : 'current']))
    const land = world.features.map((f) => ({
      iso: f.properties.iso,
      name: nameOf(f.properties.iso),
      d: featurePath(f, project),
      status: status.get(f.properties.iso),
    }))

    const [nx, ny] = project(...NORWICH)

    // Arc geometry + choreography: staggered launches, simultaneous arrival.
    const raw = origins
      .filter((o) => o.code !== 'GB') // no arc from Norwich to itself
      .map((o) => {
        const { d, len } = arcGeometry(o.x, o.y, nx, ny)
        return {
          ...o,
          d,
          travel: clamp(len / 350, 0.4, 1.1),      // draw-in duration, s
          cometC: clamp(10 / len, 0.02, 0.5),       // comet length, path-length units
          pulseDur: clamp(len / 170, 0.9, 2.4),     // comet flight time, s
        }
      })
    const maxTravel = raw.reduce((m, a) => Math.max(m, a.travel), 0)
    const arcs = raw.map((a) => ({ ...a, delay: 0.3 + maxTravel - a.travel }))
    const arrival = 0.3 + maxTravel // the shared moment every arc lands, s

    return { height, land, origins, arcs, arrival, norwich: { x: nx, y: ny } }
  }, [world])

  const introEnabled = DRAW_IN && MODE === 'arcs' && !reduced
  const settled = !introEnabled || drawn // settled ⇒ exact production (static) markup

  // Scroll trigger + visibility for the scheduler. Deliberately separate from the
  // framer wrapper's whileInView (which fires earlier and is once-only).
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !measuredRef.current) {
          measuredRef.current = true
          setDrawScale((el.getBoundingClientRect().width || VB_W) / VB_W)
          setInView(true)
        }
        setLive(entry.isIntersecting)
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Fallback in case animationend is missed (e.g. tab hidden during the draw).
  useEffect(() => {
    if (!introEnabled || !inView || !map || drawn) return
    const t = setTimeout(() => setDrawn(true), (map.arrival + 0.9) * 1000)
    return () => clearTimeout(t)
  }, [introEnabled, inView, map, drawn])

  // Pulse scheduler: one comet at a time, only while on screen, current arcs only.
  useEffect(() => {
    if (!AMBIENT_PULSES || MODE !== 'arcs' || reduced || !live || !settled || !map) return
    const candidates = map.arcs.filter((a) => !a.alumni)
    if (!candidates.length) return
    let timer
    const schedule = () => {
      timer = setTimeout(() => {
        const arc = candidates[pulseIdxRef.current % candidates.length]
        pulseIdxRef.current += 1
        pulseSeqRef.current += 1
        setPulse({ code: arc.code, seq: pulseSeqRef.current })
        schedule()
      }, 6000 + Math.random() * 3000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [reduced, live, settled, map])

  // ── Cursor tooltip (imperative, same pattern as CollaborationGarden) ──────

  function moveTip(e) {
    const tipEl = tipRef.current
    const wrapEl = wrapRef.current
    if (!tipEl || !wrapEl) return
    const rect = wrapEl.getBoundingClientRect()
    const tipW = tipEl.offsetWidth || 80
    const tipH = tipEl.offsetHeight || 24
    let x = e.clientX - rect.left + 14
    let y = e.clientY - rect.top + 14
    if (x + tipW > rect.width - 6) x = e.clientX - rect.left - tipW - 12
    if (y + tipH > rect.height - 6) y = e.clientY - rect.top - tipH - 12
    tipEl.style.left = `${x}px`
    tipEl.style.top = `${y}px`
  }

  function showTip(e, label) {
    clearTimeout(tipTimerRef.current)
    const tipEl = tipRef.current
    if (!tipEl) return
    tipEl.textContent = label
    tipEl.style.display = 'block'
    moveTip(e)
  }

  function hideTip() {
    clearTimeout(tipTimerRef.current)
    if (tipRef.current) tipRef.current.style.display = 'none'
  }

  function onSVGPointerMove(e) {
    if (tipRef.current?.style.display === 'block') moveTip(e)
  }

  function onSVGPointerLeave(e) {
    if (e.pointerType === 'touch') {
      tipTimerRef.current = setTimeout(() => { hideTip(); setHot(null) }, 900)
    } else {
      hideTip()
      setHot(null)
    }
  }

  const hoverProps = (key, label) => ({
    onPointerEnter: (e) => { showTip(e, label); setHot(key) },
    onPointerLeave: () => { hideTip(); setHot(null) },
  })

  // Radii in viewBox units — larger on small screens so dots stay legible
  // once the SVG scales down.
  const R_CURRENT = small ? 6 : 2.6
  const R_ALUMNI = small ? 4.5 : 2
  const R_NORWICH = small ? 8 : 4
  const R_HIT = small ? 30 : 10

  // Draw-phase arcs are dashed, so they must not use non-scaling-stroke
  // (dash metrics resolve inconsistently across engines in screen space).
  // Instead, render at the viewBox-unit width that equals the production
  // screen width, measured at trigger time.
  const drawStrokeWidth = (small ? 1.4 : 1) / drawScale

  // With reduced motion, render a plain div — switching props on a mounted
  // motion.div would leave it stuck at the initial opacity 0.
  const Wrapper = reduced ? 'div' : motion.div
  const wrapperMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.5, delay: 0.15 },
      }

  return (
    <Wrapper {...wrapperMotion} className="mt-16">
      <TypewriterLabel text="Where we come from" />
      <p className="mt-3 font-display italic text-[19px] text-navy/55">
        {currentCountries.length} nationalities, and counting
      </p>

      {/* Screen-reader summary — the map itself is decorative for AT */}
      <p className="sr-only">
        Current lab members come from {map ? map.origins.filter((o) => !o.alumni).map((o) => o.name).join(', ') : 'many countries'}.
        Alumni also came from {map ? map.origins.filter((o) => o.alumni).map((o) => o.name).join(', ') : 'other countries'}.
        The lab is based in Norwich, UK.
      </p>

      <div
        ref={wrapRef}
        className="om-wrap"
        style={{ aspectRatio: `${VB_W} / ${map ? map.height.toFixed(0) : VB_H_APPROX}` }}
      >
        {map && (
          <svg
            className="om-svg"
            viewBox={`0 0 ${VB_W} ${map.height.toFixed(1)}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
            onPointerMove={onSVGPointerMove}
            onPointerLeave={onSVGPointerLeave}
          >
            {/* Land */}
            <g>
              {map.land.map((c) => {
                const filled = MODE === 'choropleth' && c.status
                return (
                  <path
                    key={c.iso + c.name}
                    d={c.d}
                    className={
                      filled
                        ? `om-land om-land-${c.status}${hot === c.iso ? ' om-land-hot' : ''}`
                        : 'om-land'
                    }
                    {...(filled ? hoverProps(c.iso, c.name) : null)}
                  />
                )
              })}
            </g>

            {MODE === 'arcs' && (
              <>
                {/* Arcs — visible stroke, optional pulse comet, plus a wider
                    invisible hit path. Hovering Norwich brightens all of them. */}
                <g fill="none">
                  {map.arcs.map((a) => {
                    const hotArc = hot === a.code || hot === 'norwich'
                    const base = `om-arc${a.alumni ? ' om-arc-alumni' : ''}${hotArc ? ' om-arc-hot' : ''}`
                    return (
                      <g key={a.code}>
                        {settled ? (
                          <path d={a.d} className={base} vectorEffect="non-scaling-stroke" />
                        ) : a.alumni ? (
                          // Alumni arcs never dash — they fade in as quiet
                          // context after the main arrival.
                          <path
                            d={a.d}
                            className={`${base}${inView ? ' om-arc-fadein' : ''}`}
                            vectorEffect="non-scaling-stroke"
                            style={inView ? undefined : { opacity: 0 }}
                          />
                        ) : (
                          // Drawing phase: dashed, so no non-scaling-stroke.
                          <path
                            d={a.d}
                            pathLength="1"
                            className={`${base}${inView ? ' om-arc-draw' : ''}`}
                            style={{
                              strokeDasharray: '1 1',
                              strokeDashoffset: 1,
                              strokeWidth: drawStrokeWidth,
                              ...(inView && {
                                animationDuration: `${a.travel}s`,
                                animationDelay: `${a.delay}s`,
                              }),
                            }}
                            onAnimationEnd={() => setDrawn(true)}
                          />
                        )}
                        {pulse?.code === a.code && (
                          <path
                            key={pulse.seq}
                            d={a.d}
                            pathLength="1"
                            className="om-pulse"
                            style={{
                              strokeDasharray: `${a.cometC} 2`,
                              animationDuration: `${a.pulseDur}s`,
                            }}
                            onAnimationEnd={() => setPulse(null)}
                          />
                        )}
                        <path
                          d={a.d}
                          className="om-hit"
                          vectorEffect="non-scaling-stroke"
                          {...hoverProps(a.code, a.name)}
                        />
                      </g>
                    )
                  })}
                </g>

                {/* Origin dots — static throughout: dots are places, arcs are journeys */}
                <g>
                  {map.origins.map((o) => (
                    <g key={o.code}>
                      {o.alumni ? (
                        <circle cx={o.x} cy={o.y} r={R_ALUMNI} className="om-dot-alumni" />
                      ) : (
                        <circle cx={o.x} cy={o.y} r={R_CURRENT} className="om-dot" />
                      )}
                      <circle
                        cx={o.x} cy={o.y} r={R_HIT}
                        fill="transparent"
                        {...hoverProps(o.code, o.name)}
                      />
                    </g>
                  ))}
                </g>
              </>
            )}

            {/* Norwich — convergence point, always on top */}
            <circle cx={map.norwich.x} cy={map.norwich.y} r={R_NORWICH} className="om-norwich" />
            {introEnabled && inView && (
              // One soft ripple at the shared arrival moment, then invisible forever.
              <circle
                cx={map.norwich.x} cy={map.norwich.y} r={R_NORWICH}
                className="om-ripple"
                style={{ animationDelay: `${map.arrival}s` }}
              />
            )}
            <circle
              cx={map.norwich.x} cy={map.norwich.y} r={R_HIT}
              fill="transparent"
              {...hoverProps('norwich', 'Norwich, UK')}
            />
          </svg>
        )}

        {/* Cursor tooltip — always in DOM, shown/hidden imperatively */}
        <div ref={tipRef} className="om-tip" role="tooltip" aria-hidden="true" />
      </div>

      {MODE === 'arcs' && (
        <div className="om-legend">
          <span className="om-legend-item"><span className="om-key om-key-current" />current members</span>
          <span className="om-legend-item"><span className="om-key om-key-alumni" />alumni</span>
          <span className="om-legend-item"><span className="om-key om-key-norwich" />Norwich — home</span>
        </div>
      )}

      <style>{`
        .om-wrap { position: relative; margin-top: 20px; width: 100%; }
        .om-svg  { display: block; width: 100%; height: 100%; }

        .om-land {
          fill: #EAE7DF;
          stroke: rgba(28,30,34,0.10);
          stroke-width: 0.5;
          vector-effect: non-scaling-stroke;
        }
        .om-land-current {
          fill: #6B8F6B;
          fill-opacity: 0.55;
          transition: fill-opacity 0.2s ease;
          cursor: default;
        }
        .om-land-alumni {
          fill: #6B8F6B;
          fill-opacity: 0.15;
          transition: fill-opacity 0.2s ease;
          cursor: default;
        }
        .om-land-current.om-land-hot { fill-opacity: 0.72; }
        .om-land-alumni.om-land-hot  { fill-opacity: 0.30; }

        .om-arc {
          stroke: #6B8F6B;
          stroke-width: 1;
          stroke-opacity: 0.45;
          stroke-linecap: round;
          transition: stroke-opacity 0.2s ease, stroke-width 0.2s ease;
        }
        .om-arc-alumni { stroke-opacity: 0.15; }

        .om-hit { stroke: transparent; stroke-width: 16; }

        .om-dot        { fill: #6B8F6B; fill-opacity: 0.8; }
        .om-dot-alumni { fill: none; stroke: #6B8F6B; stroke-opacity: 0.35; stroke-width: 1;
                         vector-effect: non-scaling-stroke; }
        .om-norwich    { fill: #2E3A5C; }

        /* Draw-in: staggered launches, simultaneous arrival at Norwich */
        .om-arc-draw { animation-name: om-draw; animation-timing-function: ease-out;
                       animation-fill-mode: forwards; }
        @keyframes om-draw { to { stroke-dashoffset: 0; } }
        .om-arc-fadein { animation: om-fade 0.6s ease-out 1.2s both; }
        @keyframes om-fade { from { opacity: 0; } to { opacity: 1; } }

        /* Pulse comet — dash margins keep it fully off-path at both ends
           (Safari draws round-cap dashes at endpoints as stray dots) */
        .om-pulse {
          stroke: #6B8F6B; stroke-opacity: 0.9; stroke-width: 1.7;
          stroke-linecap: round; pointer-events: none;
          animation-name: om-pulse-run;
          animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
          animation-fill-mode: both;
        }
        @keyframes om-pulse-run {
          from { stroke-dashoffset: 0.5; }
          to   { stroke-dashoffset: -1.05; }
        }

        /* One-time arrival ripple at Norwich (invisible during its delay and after) */
        .om-ripple {
          fill: none; stroke: #2E3A5C; stroke-width: 1;
          transform-box: fill-box; transform-origin: center;
          pointer-events: none;
          animation: om-ripple 0.9s ease-out both;
        }
        @keyframes om-ripple {
          0%   { transform: scale(1);   stroke-opacity: 0; }
          18%  { stroke-opacity: 0.35; }
          100% { transform: scale(3.4); stroke-opacity: 0; }
        }

        /* Small screens: the SVG scales down, so thin strokes need a nudge */
        @media (max-width: 640px) {
          .om-arc   { stroke-width: 1.4; stroke-opacity: 0.6; }
          .om-arc-alumni { stroke-opacity: 0.28; }
          .om-pulse { stroke-width: 2.6; }
        }

        /* Hover emphasis — last so it wins at every breakpoint */
        .om-arc-hot               { stroke-width: 1.8; stroke-opacity: 0.85; }
        .om-arc-alumni.om-arc-hot { stroke-width: 1.6; stroke-opacity: 0.5; }

        .om-legend {
          display: flex; flex-wrap: wrap; gap: 6px 18px;
          margin-top: 10px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px; letter-spacing: 0.12em;
          color: rgba(28,30,34,0.45);
        }
        .om-legend-item { display: inline-flex; align-items: center; gap: 6px; }
        .om-key { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .om-key-current { background: rgba(107,143,107,0.8); }
        .om-key-alumni  { border: 1px solid rgba(107,143,107,0.5); }
        .om-key-norwich { background: #2E3A5C; }

        .om-tip {
          position: absolute; display: none;
          padding: 4px 9px;
          background: var(--color-bg, #FAFAF6);
          border: 0.5px solid rgba(200,198,192,0.75);
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          border-radius: 5px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: rgba(28,30,34,0.72);
          white-space: nowrap; pointer-events: none; z-index: 20;
        }
        @media (max-width: 540px) {
          .om-tip { font-size: 10px; }
        }
      `}</style>
    </Wrapper>
  )
}
