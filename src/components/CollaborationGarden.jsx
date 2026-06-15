import { useState, useEffect, useRef, useMemo } from 'react'
import {
  forceSimulation, forceManyBody, forceLink,
  forceCenter, forceX, forceY, forceCollide,
} from 'd3-force'
import { useReducedMotion } from '../hooks/useReducedMotion'
import labProfile from '../data/labProfile.json'

// ── Palette & geometry ───────────────────────────────────────────────────────

const COLORS = [
  '#6E9468', '#C0603A', '#8A9450', '#38476E', '#3E8E84',
  '#5E78A8', '#2F8C7E', '#8A5E84', '#9C8A48', '#4A5596',
]

// Rose geometry (SVG units)
const DR        = 36    // drag-hit radius and spacing reference (≈ max petal reach)
const SPOKE_MIN = 10
const SPOKE_MAX = 28    // extra length at score=10 → max spoke tip at 38 from center
const SPOKE_W   = 5
const DOT_R     = 2.4
const LABEL_DY  = DR + 16   // label baseline below node center (52 SVG units)
const LABEL_W   = 80         // estimated px width for "Member X" at fontSize 12
const LABEL_H   = 16         // label bg rect height

// Fixed working canvas
const VB_W = 720
const VB_H = 460             // tighter than before to reduce empty space
const CX   = VB_W / 2       // 360
const CY   = VB_H / 2       // 230

// Clamp padding: roses stay fully inside canvas
const PAD_LR  = DR + 14     // 50
const PAD_TOP = DR + 14     // 50
const PAD_BOT = DR + LABEL_DY + 10  // 36+52+10 = 98

// ── Helpers ──────────────────────────────────────────────────────────────────

function scorePhrase(score) {
  if (score >= 9) return 'central focus'
  if (score >= 7) return 'core component'
  if (score >= 5) return 'moderate involvement'
  if (score >= 3) return 'a small component'
  return 'a minor area'
}

function svgPoint(svg, clientX, clientY) {
  return new DOMPoint(clientX, clientY).matrixTransform(svg.getScreenCTM().inverse())
}

// ── Force garden ─────────────────────────────────────────────────────────────

function ForceGarden({ members, areas, edges: rawEdges, reduced }) {
  const [positions, setPositions]   = useState([])
  const [hoveredNode, setHoveredNode]   = useState(null)  // index | null
  const [hoveredSpoke, setHoveredSpoke] = useState(null)  // {ni, ai} | null

  const svgRef     = useRef(null)
  const simRef     = useRef(null)
  const nodesRef   = useRef([])
  const initPosRef = useRef([])
  const dragRef    = useRef(null)   // { ni } | null

  // adjacency[i] is a Map<j, level> so we can check both connection and weight
  const adjacency = useMemo(() => {
    const adj = members.map(() => new Map())
    rawEdges.forEach(([i, j, level]) => { adj[i].set(j, level); adj[j].set(i, level) })
    return adj
  }, [members, rawEdges])

  // ── Deterministic simulation init ─────────────────────────────────────────
  useEffect(() => {
    const N = members.length
    if (N === 0) return

    // Place nodes in a circle centred on the canvas
    const R0 = Math.min(CX, CY) * 0.7   // ≈ 168
    const nodes = members.map((_, i) => ({
      index: i,
      x: CX + R0 * Math.cos((2 * Math.PI * i / N) - Math.PI / 2),
      y: CY + R0 * Math.sin((2 * Math.PI * i / N) - Math.PI / 2),
      vx: 0, vy: 0, fx: null, fy: null,
    }))

    const links = rawEdges.map(([i, j]) => ({ source: i, target: j }))

    const sim = forceSimulation(nodes)
      .force('charge',  forceManyBody().strength(-650))
      .force('link',    forceLink(links).distance(150).strength(0.5))
      .force('center',  forceCenter(CX, CY))
      .force('x',       forceX(CX).strength(0.08))
      .force('y',       forceY(CY).strength(0.10))
      .force('collide', forceCollide(46))
      // Custom bounds force: keep nodes inside canvas with soft walls
      .force('bounds',  () => {
        for (const n of nodes) {
          if (n.x < PAD_LR)       { n.x = PAD_LR;       if (n.vx < 0) n.vx *= -0.3 }
          if (n.x > VB_W-PAD_LR)  { n.x = VB_W-PAD_LR;  if (n.vx > 0) n.vx *= -0.3 }
          if (n.y < PAD_TOP)       { n.y = PAD_TOP;       if (n.vy < 0) n.vy *= -0.3 }
          if (n.y > VB_H-PAD_BOT) { n.y = VB_H-PAD_BOT; if (n.vy > 0) n.vy *= -0.3 }
        }
      })
      .stop()

    // Settle synchronously → same layout every load (deterministic given fixed seed)
    for (let t = 0; t < 300; t++) sim.tick()

    initPosRef.current = nodes.map(n => ({ x: n.x, y: n.y }))
    nodesRef.current   = nodes
    setPositions(nodes.map(n => ({ x: n.x, y: n.y })))

    if (!reduced) {
      sim.on('tick', () => setPositions(nodesRef.current.map(n => ({ x: n.x, y: n.y }))))
      sim.alpha(0).restart()   // live but settled; restarts on drag
    }

    simRef.current = sim
    return () => sim.stop()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag ─────────────────────────────────────────────────────────────────

  function onDiscPointerDown(e, ni) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const node = nodesRef.current[ni]
    node.fx = node.x; node.fy = node.y
    dragRef.current = { ni }
  }

  function onDiscPointerMove(e, ni) {
    if (!dragRef.current || dragRef.current.ni !== ni) return
    const { x, y } = svgPoint(svgRef.current, e.clientX, e.clientY)
    const node = nodesRef.current[ni]
    node.fx = x; node.fy = y
    if (reduced) {
      node.x = x; node.y = y
      setPositions(nodesRef.current.map(n => ({ x: n.x, y: n.y })))
    } else {
      simRef.current?.alpha(0.3).restart()
    }
  }

  function onDiscPointerUp(e, ni) {
    if (!dragRef.current || dragRef.current.ni !== ni) return
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!reduced) simRef.current?.alphaTarget(0)
  }

  function onNodeDoubleClick(e, ni) {
    e.stopPropagation()
    const node = nodesRef.current[ni]
    node.fx = null; node.fy = null
    if (!reduced) simRef.current?.alpha(0.3).restart()
    else setPositions(nodesRef.current.map(n => ({ x: n.x, y: n.y })))
  }

  function resetLayout() {
    nodesRef.current.forEach((n, i) => {
      const p = initPosRef.current[i]
      n.x = p.x; n.y = p.y; n.vx = 0; n.vy = 0; n.fx = null; n.fy = null
    })
    setPositions(nodesRef.current.map(n => ({ x: n.x, y: n.y })))
    if (!reduced) simRef.current?.alpha(0.3).restart()
  }

  // ── Readout ──────────────────────────────────────────────────────────────

  let readout = ' '
  if (hoveredSpoke) {
    const { ni, ai } = hoveredSpoke
    const score = members[ni].scores[ai]
    if (score > 0) readout = `${members[ni].name} · ${areas[ai]} — ${scorePhrase(score)}`
  } else if (hoveredNode !== null) {
    const m      = members[hoveredNode]
    const mainAi = m.scores.indexOf(Math.max(...m.scores))
    const entries = [...adjacency[hoveredNode].entries()]
    const regular    = entries.filter(([, lv]) => lv === 2).map(([idx]) => members[idx].name)
    const occasional = entries.filter(([, lv]) => lv === 1).map(([idx]) => members[idx].name)
    const parts = []
    if (regular.length)    parts.push(`regular: ${regular.join(', ')}`)
    if (occasional.length) parts.push(`occasional: ${occasional.join(', ')}`)
    readout = `${m.name} · ${areas[mainAi]}${parts.length ? `; ${parts.join('; ')}` : ''}`
  }

  if (positions.length === 0) return <p className="cg-loading">Laying out…</p>

  return (
    <div className="cg-garden-wrap">
      <div className="cg-readout-wrap"><span className="cg-readout">{readout}</span></div>

      <svg
        ref={svgRef}
        className="cg-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'none' }}
        aria-label="Lab collaboration garden"
      >
        {/* ── Edges (all behind nodes) ────────────────────────────────── */}
        <g>
          {rawEdges.map(([i, j, level], ei) => {
            if (!positions[i] || !positions[j]) return null
            const other = i === hoveredNode ? j : j === hoveredNode ? i : -1
            const highlighted = hoveredNode !== null && other !== -1 && adjacency[hoveredNode].has(other)
            const dimmed = hoveredNode !== null && !highlighted
            // Base appearance by level
            const baseW  = level === 2 ? 2.6 : 1
            const baseOp = level === 2 ? 0.4 : 0.13
            // Highlighted appearance by level
            const hlW    = level === 2 ? 3.2 : 1.6
            const hlOp   = level === 2 ? 0.6 : 0.4
            return (
              <line key={ei}
                x1={positions[i].x} y1={positions[i].y}
                x2={positions[j].x} y2={positions[j].y}
                stroke="#5E7C5E"
                strokeWidth={highlighted ? hlW : baseW}
                strokeOpacity={dimmed ? 0.03 : highlighted ? hlOp : baseOp}
                strokeLinecap="round"
              />
            )
          })}
        </g>

        {/* ── Nodes ───────────────────────────────────────────────────── */}
        {members.map((m, ni) => {
          const pos = positions[ni]
          if (!pos) return null
          const isHovered  = hoveredNode === ni
          const isConnected = hoveredNode !== null && adjacency[hoveredNode].has(ni)
          const isDimmed   = hoveredNode !== null && !isHovered && !isConnected
          return (
            <g
              key={ni}
              transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})`}
              style={{ opacity: isDimmed ? 0.22 : 1 }}
              onPointerEnter={() => { if (!dragRef.current) setHoveredNode(ni); setHoveredSpoke(null) }}
              onPointerLeave={() => {
                if (!dragRef.current || dragRef.current.ni !== ni) {
                  setHoveredNode(null); setHoveredSpoke(null)
                }
              }}
              onDoubleClick={e => onNodeDoubleClick(e, ni)}
            >
              {/* Spokes — vivid area colors, opacity 0.6–1.0 */}
              {m.scores.map((score, ai) => {
                if (score === 0) return null
                const angle = (ai * 36 - 90) * (Math.PI / 180)
                const len   = SPOKE_MIN + SPOKE_MAX * (score / 10)
                return (
                  <line key={ai}
                    x1={0} y1={0}
                    x2={+(len * Math.cos(angle)).toFixed(2)}
                    y2={+(len * Math.sin(angle)).toFixed(2)}
                    stroke={COLORS[ai]}
                    strokeWidth={SPOKE_W}
                    strokeLinecap="round"
                    strokeOpacity={0.6 + 0.4 * (score / 10)}
                    style={{ pointerEvents: 'stroke' }}
                    onPointerEnter={e => { e.stopPropagation(); setHoveredSpoke({ ni, ai }) }}
                    onPointerLeave={e => { e.stopPropagation(); setHoveredSpoke(null) }}
                  />
                )
              })}

              {/* Transparent drag-hit circle — no fill, no visual impact */}
              <circle
                r={DR}
                fill="transparent"
                className="cg-disc"
                onPointerDown={e => onDiscPointerDown(e, ni)}
                onPointerMove={e => onDiscPointerMove(e, ni)}
                onPointerUp={e => onDiscPointerUp(e, ni)}
              />

              {/* Center dot on top */}
              <circle r={DOT_R} fill="rgba(28,30,34,0.32)" style={{ pointerEvents: 'none' }} />

              {/* Label — semi-opaque bg rect so text stays readable over edges */}
              <rect
                x={-LABEL_W / 2}
                y={LABEL_DY - 13}
                width={LABEL_W}
                height={LABEL_H}
                rx={3}
                fill="var(--color-bg-soft, #F2F0EB)"
                fillOpacity={0.82}
                style={{ pointerEvents: 'none' }}
              />
              <text
                y={LABEL_DY}
                textAnchor="middle"
                fontSize={12}
                fontFamily="'IBM Plex Mono', monospace"
                fill="rgba(28,30,34,0.62)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {m.name}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="cg-controls">
        <button className="cg-reset" onClick={resetLayout}>Reset layout</button>
      </div>

      <div className="cg-legend">
        {areas.map((area, i) => (
          <div key={i} className="cg-legend-item">
            <span className="cg-legend-swatch" style={{ background: COLORS[i] }} />
            <span className="cg-legend-name">{area}</span>
          </div>
        ))}
      </div>
      <p className="cg-edge-hint">thin line = occasional &nbsp;·&nbsp; thick line = regular / dependent</p>
    </div>
  )
}

// ── Top-level export ──────────────────────────────────────────────────────────

export default function CollaborationGarden() {
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()

  const { areas, members: rawMembers, edges } = labProfile
  const members = useMemo(
    () => [...rawMembers].sort((a, b) => a.order - b.order),
    [rawMembers]
  )

  return (
    <div className="cg-root">

      {/* Collapsed header */}
      <div className="cg-header">
        <p className="cg-title">How the lab connects</p>
        <p className="cg-subtitle">
          Each person is a research profile; lines are collaborations.
        </p>
        <button
          className="cg-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Hide the collaboration map' : 'Show the collaboration map'}
          <span className={`cg-chevron${expanded ? ' cg-chevron-open' : ''}`}>▸</span>
        </button>
      </div>

      {/* Garden — lazy: only mounts on first expand */}
      {expanded && (
        <ForceGarden
          members={members}
          areas={areas}
          edges={edges}
          reduced={reduced}
        />
      )}

      <style>{`
        .cg-root { margin-top: 2.5rem; margin-bottom: 0.5rem; }

        /* ── Header ─────────────────────────────────────────────────── */
        .cg-header { margin-bottom: 4px; }
        .cg-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: rgba(28,30,34,0.42); margin: 0 0 3px;
        }
        .cg-subtitle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: rgba(28,30,34,0.34);
          margin: 0 0 6px; line-height: 1.4;
        }
        .cg-toggle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: rgba(46,58,92,0.48);
          background: none; border: none; cursor: pointer; padding: 0;
          display: inline-flex; align-items: center; gap: 4px;
          transition: color 0.15s; white-space: nowrap;
        }
        .cg-toggle:hover { color: rgba(46,58,92,0.78); }
        .cg-chevron {
          display: inline-block; font-size: 8px;
          transition: transform 0.2s ease;
        }
        .cg-chevron-open { transform: rotate(90deg); }

        /* ── Garden ─────────────────────────────────────────────────── */
        .cg-garden-wrap { margin-top: 10px; }

        .cg-readout-wrap { height: 20px; margin-bottom: 6px; }
        .cg-readout {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: rgba(46,58,92,0.65);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: block;
        }

        .cg-svg {
          width: 100%;
          height: clamp(360px, 54vw, 500px);
          display: block;
          border-radius: 8px;
          background: var(--color-bg-soft, #F2F0EB);
        }

        .cg-disc { cursor: grab; }
        .cg-disc:active { cursor: grabbing; }

        .cg-controls { display: flex; justify-content: flex-end; margin-top: 6px; }
        .cg-reset {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
          color: rgba(46,58,92,0.36); background: none; border: none;
          cursor: pointer; padding: 2px 0; transition: color 0.15s;
        }
        .cg-reset:hover { color: rgba(46,58,92,0.66); }

        .cg-loading {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: rgba(28,30,34,0.32);
          padding: 40px 0; text-align: center;
        }

        .cg-legend {
          display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 10px;
        }
        .cg-legend-item { display: flex; align-items: center; gap: 4px; }
        .cg-legend-swatch {
          display: inline-block; width: 8px; height: 8px;
          border-radius: 2px; flex-shrink: 0;
        }
        .cg-legend-name {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: rgba(28,30,34,0.48); white-space: nowrap;
        }
        .cg-edge-hint {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; color: rgba(28,30,34,0.28);
          margin: 5px 0 0; line-height: 1;
        }

        @media (max-width: 540px) {
          .cg-svg { height: clamp(260px, 80vw, 340px); }
          .cg-readout { font-size: 10px; }
        }
      `}</style>
    </div>
  )
}
