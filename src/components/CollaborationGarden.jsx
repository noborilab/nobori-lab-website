import { useState, useEffect, useRef, useMemo } from 'react'
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force'
import { useReducedMotion } from '../hooks/useReducedMotion'
import labProfile from '../data/labProfile.json'

// ── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  '#6E9468', '#C0603A', '#8A9450', '#38476E', '#3E8E84',
  '#5E78A8', '#2F8C7E', '#8A5E84', '#9C8A48', '#4A5596',
]

const ABBR = [
  'Immunity', 'Biochem.', 'Microbiome', 'Tech.', 'Editing',
  'scSeq', 'Imaging', 'Epigenet.', 'Horticult.', 'Bioinf.',
]

// Fingerprint track geometry
const FP_BLOCK_W = 12
const FP_BLOCK_H = 13
const FP_BLOCK_Y = (26 - FP_BLOCK_H) / 2
const FP_CENTER_Y = 13

// Rose geometry
const SPOKE_MIN = 6
const SPOKE_MAX = 18      // extra length at score=10
const DISC_R    = 27      // backing disc radius
const LABEL_DY  = DISC_R + 14

// ── Helpers ──────────────────────────────────────────────────────────────────

function scorePhrase(score) {
  if (score >= 9) return 'central focus'
  if (score >= 7) return 'core component'
  if (score >= 5) return 'moderate involvement'
  if (score >= 3) return 'a small component'
  return 'a minor area'
}

function svgPoint(svg, clientX, clientY) {
  const pt = new DOMPoint(clientX, clientY)
  return pt.matrixTransform(svg.getScreenCTM().inverse())
}

// ── Fingerprint bar (collapsed summary) ──────────────────────────────────────

function Fingerprint({ members, areas }) {
  const sums = areas.map((_, ai) =>
    members.reduce((s, m) => s + m.scores[ai], 0)
  )
  const maxSum = Math.max(...sums, 1)

  const blocks = sums.map((s, ai) =>
    s > 0 ? { opacity: 0.32 + 0.68 * (s / maxSum), color: COLORS[ai] } : null
  )

  // Backbone: span leftmost → rightmost active column
  let first = -1, last = -1
  blocks.forEach((b, i) => { if (b) { if (first < 0) first = i; last = i } })
  const bbone = first >= 0 && first !== last
    ? { x1: first * 20 + 10, x2: last * 20 + 10, color: blocks[first].color }
    : null

  return (
    <div className="cg-fp-row">
      <div className="cg-fp-label">
        <span className="cg-fp-label-text">Lab</span>
      </div>
      <div className="cg-fp-track">
        <svg viewBox="0 0 200 26" preserveAspectRatio="none" height={26} width="100%"
          style={{ display: 'block' }}>
          {bbone && (
            <line x1={bbone.x1} y1={FP_CENTER_Y} x2={bbone.x2} y2={FP_CENTER_Y}
              stroke={bbone.color} strokeOpacity={0.28} strokeWidth={0.8}
              vectorEffect="non-scaling-stroke" />
          )}
          {blocks.map((b, ai) => b && (
            <rect key={ai}
              x={ai * 20 + 4} y={FP_BLOCK_Y}
              width={FP_BLOCK_W} height={FP_BLOCK_H}
              rx={2.5} ry={2.5}
              fill={b.color} fillOpacity={b.opacity} />
          ))}
        </svg>
      </div>
    </div>
  )
}

// ── Force garden ─────────────────────────────────────────────────────────────

function ForceGarden({ members, areas, edges: rawEdges, reduced }) {
  const [positions, setPositions] = useState([])
  const [viewBox, setViewBox]     = useState('-250 -200 500 420')
  const [hoveredNode, setHoveredNode] = useState(null)  // index | null
  const [hoveredSpoke, setHoveredSpoke] = useState(null) // {ni, ai} | null

  const svgRef      = useRef(null)
  const simRef      = useRef(null)
  const nodesRef    = useRef([])
  const initPosRef  = useRef([])
  const dragRef     = useRef(null) // { ni } | null

  // Precompute adjacency sets
  const adjacency = useMemo(() => {
    const adj = members.map(() => new Set())
    rawEdges.forEach(([i, j]) => { adj[i].add(j); adj[j].add(i) })
    return adj
  }, [members, rawEdges])

  // ── Simulation init (once, deterministic) ─────────────────────────────────
  useEffect(() => {
    const N = members.length
    if (N === 0) return

    const R = 140

    // Deterministic initial positions: evenly-spaced circle, starting top
    const nodes = members.map((_, i) => ({
      index: i,
      x: R * Math.cos((2 * Math.PI * i / N) - Math.PI / 2),
      y: R * Math.sin((2 * Math.PI * i / N) - Math.PI / 2),
      vx: 0, vy: 0,
      fx: null, fy: null,
    }))

    const links = rawEdges.map(([i, j]) => ({ source: i, target: j }))

    const sim = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-360))
      .force('link',   forceLink(links).distance(130).strength(0.5))
      .force('center', forceCenter(0, 0))
      .stop()

    // Settle synchronously → deterministic layout every load
    for (let t = 0; t < 300; t++) sim.tick()

    // Derive viewBox from settled positions + padding for disc + labels
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)
    const pad = { t: 44, r: 52, b: 58, l: 52 }
    const vbX = Math.min(...xs) - pad.l
    const vbY = Math.min(...ys) - pad.t
    const vbW = Math.max(...xs) + pad.r - vbX
    const vbH = Math.max(...ys) + pad.b - vbY
    setViewBox(`${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}`)

    initPosRef.current = nodes.map(n => ({ x: n.x, y: n.y }))
    nodesRef.current   = nodes
    setPositions(nodes.map(n => ({ x: n.x, y: n.y })))

    if (!reduced) {
      // Start live simulation at alpha=0 (settled); restarts on drag
      sim.on('tick', () => {
        setPositions(nodesRef.current.map(n => ({ x: n.x, y: n.y })))
      })
      sim.alpha(0).restart()
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
    node.fx = node.x
    node.fy = node.y
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
      n.x = p.x; n.y = p.y
      n.fx = null; n.fy = null
      n.vx = 0; n.vy = 0
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
    const m = members[hoveredNode]
    const maxScore = Math.max(...m.scores)
    const mainAi = m.scores.indexOf(maxScore)
    const collab = [...adjacency[hoveredNode]].map(i => members[i].name)
    readout = `${m.name} · ${areas[mainAi]}; works with ${collab.length}: ${collab.join(', ')}`
  }

  if (positions.length === 0) {
    return <p className="cg-loading">Laying out…</p>
  }

  return (
    <div className="cg-garden-wrap">
      <div className="cg-readout-wrap">
        <span className="cg-readout">{readout}</span>
      </div>

      <svg
        ref={svgRef}
        className="cg-svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'none' }}
        aria-label="Collaboration garden"
      >
        {/* ── Edges (behind nodes) ────────────────────────────────────── */}
        <g>
          {rawEdges.map(([i, j], ei) => {
            if (!positions[i] || !positions[j]) return null
            const edgeTouchesHovered =
              hoveredNode !== null &&
              (i === hoveredNode || j === hoveredNode)
            const isHighlighted = edgeTouchesHovered &&
              adjacency[hoveredNode].has(i === hoveredNode ? j : i)
            const isDimmed = hoveredNode !== null && !isHighlighted
            return (
              <line key={ei}
                x1={positions[i].x} y1={positions[i].y}
                x2={positions[j].x} y2={positions[j].y}
                stroke="#6B8F6B"
                strokeWidth={isHighlighted ? 2 : 0.8}
                strokeOpacity={isDimmed ? 0.04 : isHighlighted ? 0.70 : 0.14}
              />
            )
          })}
        </g>

        {/* ── Nodes ───────────────────────────────────────────────────── */}
        {members.map((m, ni) => {
          const pos = positions[ni]
          if (!pos) return null
          const isHovered = hoveredNode === ni
          const isConnected = hoveredNode !== null && adjacency[hoveredNode].has(ni)
          const isDimmed = hoveredNode !== null && !isHovered && !isConnected
          return (
            <g
              key={ni}
              transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})`}
              style={{ opacity: isDimmed ? 0.25 : 1 }}
              onPointerEnter={() => { if (!dragRef.current) setHoveredNode(ni); setHoveredSpoke(null) }}
              onPointerLeave={() => { if (!dragRef.current || dragRef.current.ni !== ni) { setHoveredNode(null); setHoveredSpoke(null) } }}
              onDoubleClick={e => onNodeDoubleClick(e, ni)}
            >
              {/* Spokes (petals) — drawn BEFORE disc so disc covers inner ends */}
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
                    strokeWidth={3.6}
                    strokeLinecap="round"
                    strokeOpacity={0.5 + 0.5 * (score / 10)}
                    style={{ pointerEvents: 'stroke' }}
                    onPointerEnter={e => { e.stopPropagation(); setHoveredSpoke({ ni, ai }) }}
                    onPointerLeave={e => { e.stopPropagation(); setHoveredSpoke(null) }}
                  />
                )
              })}

              {/* Pale backing disc — covers petal inner segments, stops edges piercing */}
              <circle
                r={DISC_R}
                fill="var(--color-bg, #FAFAF6)"
                fillOpacity={0.88}
                stroke="rgba(200,198,192,0.45)"
                strokeWidth={0.5}
                className="cg-disc"
                onPointerDown={e => onDiscPointerDown(e, ni)}
                onPointerMove={e => onDiscPointerMove(e, ni)}
                onPointerUp={e => onDiscPointerUp(e, ni)}
              />

              {/* Center dot */}
              <circle r={2.5} fill="rgba(28,30,34,0.30)" style={{ pointerEvents: 'none' }} />

              {/* Name label */}
              <text
                y={LABEL_DY}
                textAnchor="middle"
                fontSize={11}
                fontFamily="'IBM Plex Mono', monospace"
                fill="rgba(28,30,34,0.60)"
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

      {/* Color legend */}
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
      {/* Caption + toggle */}
      <div className="cg-header-bar">
        <span className="cg-caption">Lab composition</span>
        <button
          className="cg-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(e => !e)}
        >
          Show how the lab connects
          <span className={`cg-chevron${expanded ? ' cg-chevron-open' : ''}`}>▸</span>
        </button>
      </div>

      {/* Fingerprint — always visible */}
      <Fingerprint members={members} areas={areas} />

      {/* Expanded: collaboration garden */}
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

        /* ── Header bar ─────────────────────────────────────────────── */
        .cg-header-bar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; margin-bottom: 5px;
        }
        .cg-caption {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.15em; color: rgba(28,30,34,0.35);
        }
        .cg-toggle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: rgba(46,58,92,0.45);
          background: none; border: none; cursor: pointer; padding: 0;
          display: inline-flex; align-items: center; gap: 4px;
          transition: color 0.15s; white-space: nowrap;
        }
        .cg-toggle:hover { color: rgba(46,58,92,0.75); }
        .cg-chevron {
          display: inline-block; font-size: 8px;
          transition: transform 0.2s ease;
        }
        .cg-chevron-open { transform: rotate(90deg); }

        /* ── Fingerprint ─────────────────────────────────────────────── */
        .cg-fp-row { display: flex; align-items: center; }
        .cg-fp-label {
          width: 120px; min-width: 120px; padding-right: 10px;
          flex-shrink: 0; overflow: hidden;
        }
        .cg-fp-label-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.14em; color: rgba(28,30,34,0.30);
          white-space: nowrap; display: block;
        }
        .cg-fp-track { flex: 1; min-width: 0; }

        /* ── Garden ──────────────────────────────────────────────────── */
        .cg-garden-wrap { margin-top: 12px; }

        .cg-readout-wrap { height: 20px; margin-bottom: 6px; }
        .cg-readout {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: rgba(46,58,92,0.65);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: block;
        }

        .cg-svg {
          width: 100%;
          height: clamp(300px, 50vw, 440px);
          display: block;
          border-radius: 8px;
          background: var(--color-bg-soft, #F2F0EB);
        }

        .cg-controls { display: flex; justify-content: flex-end; margin-top: 6px; }
        .cg-reset {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
          color: rgba(46,58,92,0.38); background: none; border: none;
          cursor: pointer; padding: 2px 0; transition: color 0.15s;
        }
        .cg-reset:hover { color: rgba(46,58,92,0.68); }
        .cg-disc { cursor: grab; }
        .cg-disc:active { cursor: grabbing; }

        .cg-loading {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: rgba(28,30,34,0.35);
          padding: 40px 0; text-align: center;
        }

        .cg-legend {
          display: flex; flex-wrap: wrap; gap: 4px 12px;
          margin-top: 10px;
        }
        .cg-legend-item { display: flex; align-items: center; gap: 4px; }
        .cg-legend-swatch {
          display: inline-block; width: 8px; height: 8px;
          border-radius: 2px; flex-shrink: 0;
        }
        .cg-legend-name {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: rgba(28,30,34,0.50); white-space: nowrap;
        }

        @media (max-width: 540px) {
          .cg-fp-label { width: 52px; min-width: 52px; padding-right: 5px; }
          .cg-fp-label-text { font-size: 9px; }
          .cg-svg { height: clamp(240px, 80vw, 320px); }
          .cg-readout { font-size: 10px; }
        }
      `}</style>
    </div>
  )
}
