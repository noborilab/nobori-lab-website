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
const DR       = 36    // backing disc radius
const SPOKE_MIN = 10
const SPOKE_MAX = 28   // extra length at score=10 → max spoke = 38
const SPOKE_W   = 5
const DOT_R     = 2.4
const LABEL_DY  = DR + 17  // label baseline below node center

// Fixed working canvas — force layout is tuned to spread 12 nodes across this
const VB_W = 720
const VB_H = 480
const CX   = VB_W / 2   // 360
const CY   = VB_H / 2   // 240

// Clamp padding so no node (disc + label) bleeds outside the canvas
const PAD_LR  = DR + 14
const PAD_TOP = DR + 14
const PAD_BOT = DR + LABEL_DY + 6   // 36+17+6 = 59

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

  const adjacency = useMemo(() => {
    const adj = members.map(() => new Set())
    rawEdges.forEach(([i, j]) => { adj[i].add(j); adj[j].add(i) })
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
      .force('charge',  forceManyBody().strength(-580))
      .force('link',    forceLink(links).distance(120).strength(0.5))
      .force('center',  forceCenter(CX, CY))
      .force('x',       forceX(CX).strength(0.05))
      .force('y',       forceY(CY).strength(0.07))
      .force('collide', forceCollide(DR + 10))
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
    const collab = [...adjacency[hoveredNode]].map(i => members[i].name)
    readout = `${m.name} · ${areas[mainAi]}; works with ${collab.length}: ${collab.join(', ')}`
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
        {/* ── Edges ───────────────────────────────────────────────────── */}
        <g>
          {rawEdges.map(([i, j], ei) => {
            if (!positions[i] || !positions[j]) return null
            const touches = hoveredNode !== null && (i === hoveredNode || j === hoveredNode)
            const highlighted = touches && adjacency[hoveredNode].has(i === hoveredNode ? j : i)
            const dimmed = hoveredNode !== null && !highlighted
            return (
              <line key={ei}
                x1={positions[i].x} y1={positions[i].y}
                x2={positions[j].x} y2={positions[j].y}
                stroke="#6B8F6B"
                strokeWidth={highlighted ? 2.4 : 1}
                strokeOpacity={dimmed ? 0.04 : highlighted ? 0.70 : 0.14}
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
              {/* Spokes drawn first so the disc hides their inner stubs */}
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
                    strokeOpacity={0.5 + 0.5 * (score / 10)}
                    style={{ pointerEvents: 'stroke' }}
                    onPointerEnter={e => { e.stopPropagation(); setHoveredSpoke({ ni, ai }) }}
                    onPointerLeave={e => { e.stopPropagation(); setHoveredSpoke(null) }}
                  />
                )
              })}

              {/* Backing disc — masks spoke stubs, drag handle */}
              <circle
                r={DR}
                fill="var(--color-bg, #FAFAF6)"
                fillOpacity={0.90}
                stroke="rgba(200,198,192,0.40)"
                strokeWidth={0.6}
                className="cg-disc"
                onPointerDown={e => onDiscPointerDown(e, ni)}
                onPointerMove={e => onDiscPointerMove(e, ni)}
                onPointerUp={e => onDiscPointerUp(e, ni)}
              />

              <circle r={DOT_R} fill="rgba(28,30,34,0.28)" style={{ pointerEvents: 'none' }} />

              <text
                y={LABEL_DY}
                textAnchor="middle"
                fontSize={12}
                fontFamily="'IBM Plex Mono', monospace"
                fill="rgba(28,30,34,0.58)"
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
          height: clamp(360px, 56vw, 520px);
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

        @media (max-width: 540px) {
          .cg-svg { height: clamp(280px, 80vw, 360px); }
          .cg-readout { font-size: 10px; }
        }
      `}</style>
    </div>
  )
}
