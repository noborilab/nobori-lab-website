import { useState } from 'react'
import { researchAreas, members } from '../data/labProfile'

const COLORS = [
  '#6E9468', '#C0603A', '#8A9450', '#38476E', '#3E8E84',
  '#5E78A8', '#2F8C7E', '#8A5E84', '#9C8A48', '#4A5596',
]

const ABBR = [
  'Immunity', 'Biochem.', 'Microbiome', 'Tech.', 'Editing',
  'scSeq', 'Imaging', 'Epigenet.', 'Horticult.', 'Bioinf.',
]

// Track geometry (viewBox units)
const BLOCK_W = 12
const BLOCK_H = 13
const BLOCK_Y = (26 - BLOCK_H) / 2  // 6.5 — vertically centred
const CENTER_Y = 13                  // backbone y (mid-lane)
const TRACK_H  = 26                  // fixed CSS px height — bars never collapse

function scorePhrase(score) {
  if (score >= 9) return 'central focus'
  if (score >= 7) return 'core component'
  if (score >= 5) return 'moderate involvement'
  if (score >= 3) return 'a small component'
  if (score >= 1) return 'a minor area'
  return 'not part of their work'
}

function labPhrase(rank) {
  if (rank === 1) return "the lab's center of gravity"
  if (rank <= 3) return 'a core area for the lab'
  if (rank <= 6) return 'well represented'
  return 'a smaller focus'
}

// blocks: Array(10) of { opacity, color } | null
function getBackbone(blocks) {
  let first = -1, last = -1
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i]) { if (first === -1) first = i; last = i }
  }
  if (first === -1 || first === last) return null
  return { x1: first * 20 + 10, x2: last * 20 + 10, color: blocks[first].color }
}

function Track({ blocks, backbone, onCol, onLeave }) {
  return (
    <svg
      viewBox="0 0 200 26"
      preserveAspectRatio="none"
      height={TRACK_H}
      width="100%"
      onPointerLeave={onLeave}
      style={{ display: 'block' }}
    >
      {/* Backbone line — non-scaling stroke stays thin regardless of SVG width */}
      {backbone && (
        <line
          x1={backbone.x1} y1={CENTER_Y}
          x2={backbone.x2} y2={CENTER_Y}
          stroke={backbone.color}
          strokeOpacity={0.28}
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      )}

      {blocks.map((block, ai) => (
        <g key={ai}>
          {/* Uniform block — opacity encodes score, not height */}
          {block && (
            <rect
              x={ai * 20 + 4}
              y={BLOCK_Y}
              width={BLOCK_W}
              height={BLOCK_H}
              rx={2.5}
              ry={2.5}
              fill={block.color}
              fillOpacity={block.opacity}
            />
          )}
          {/* Full-height transparent hit rect for pointer events */}
          <rect
            x={ai * 20} y={0}
            width={20} height={26}
            fill="transparent"
            style={{ cursor: 'crosshair', pointerEvents: 'all' }}
            onPointerEnter={() => onCol(ai)}
            onPointerDown={() => onCol(ai)}
          />
        </g>
      ))}
    </svg>
  )
}

export default function LabProfile() {
  const [expanded, setExpanded] = useState(false)
  const [hover, setHover]       = useState(null) // { lane: 'lab' | number, col: 0–9 }

  const current = members
    .filter(m => m.status === 'current')
    .sort((a, b) => a.order - b.order)

  // Lab aggregate
  const labSums = researchAreas.map((_, ai) =>
    current.reduce((s, m) => s + m.scores[ai], 0)
  )
  const maxSum = Math.max(...labSums, 1)

  // Rank columns 1 = highest sum (for readout phrases)
  const ranks = labSums
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s)
    .reduce((acc, { i }, ri) => { acc[i] = ri + 1; return acc }, Array(10).fill(0))

  const labBlocks = labSums.map((s, ai) =>
    s > 0 ? { opacity: 0.32 + 0.68 * (s / maxSum), color: COLORS[ai] } : null
  )
  const labBackbone = getBackbone(labBlocks)

  // Readout (no raw numbers, per spec)
  let readout = ' '
  if (hover) {
    const area = researchAreas[hover.col]
    readout = hover.lane === 'lab'
      ? `${area} — ${labPhrase(ranks[hover.col])}`
      : `${area} — ${scorePhrase(current[hover.lane].scores[hover.col])}`
  }

  const clear   = () => setHover(null)
  const toggle  = () => { setExpanded(e => !e); setHover(null) }

  return (
    <div className="lp-root">

      {/* Caption bar + toggle button */}
      <div className="lp-header-bar">
        <span className="lp-caption">Research areas across the lab</span>
        <button
          className="lp-toggle"
          aria-expanded={expanded}
          onClick={toggle}
        >
          Show how each of us contributes
          <span className={`lp-chevron${expanded ? ' lp-chevron-open' : ''}`}>{'▸'}</span>
        </button>
      </div>

      {/* Lab aggregate lane — always visible */}
      <div className="lp-row lp-lab-row">
        <div className="lp-label">
          <span className="lp-label-text lp-lab-name">Lab</span>
        </div>
        <div className="lp-track">
          <Track
            blocks={labBlocks}
            backbone={labBackbone}
            onCol={col => setHover({ lane: 'lab', col })}
            onLeave={clear}
          />
        </div>
      </div>

      {/* ── Expanded section ─────────────────────────────────────────── */}
      {expanded && (
        <>
          {/* Readout — fixed height prevents layout shift */}
          <div className="lp-readout-wrap">
            <span className="lp-readout">{readout}</span>
          </div>

          {/* Column headers */}
          <div className="lp-row lp-hdr-row">
            <div className="lp-label" aria-hidden="true" />
            <div className="lp-track lp-hdr-cols">
              {researchAreas.map((area, i) => (
                <div
                  key={i}
                  className="lp-hdr-cell"
                  style={{ color: COLORS[i] }}
                  title={area}
                >
                  <span className="lp-abbr-show">{ABBR[i]}</span>
                  <span className="lp-num-show">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member lanes */}
          {current.map((m, mi) => {
            const blocks = m.scores.map((sc, ai) =>
              sc > 0 ? { opacity: 0.22 + 0.78 * (sc / 10), color: COLORS[ai] } : null
            )
            return (
              <div
                key={mi}
                className="lp-row"
                style={mi % 2 === 0 ? { background: 'rgba(28,30,34,0.022)' } : undefined}
              >
                <div className="lp-label">
                  <span className="lp-label-text">{m.name}</span>
                </div>
                <div className="lp-track">
                  <Track
                    blocks={blocks}
                    backbone={getBackbone(blocks)}
                    onCol={col => setHover({ lane: mi, col })}
                    onLeave={clear}
                  />
                </div>
              </div>
            )
          })}

          {/* Color legend — full area names */}
          <div className="lp-legend">
            {researchAreas.map((area, i) => (
              <div key={i} className="lp-legend-item">
                <span className="lp-legend-swatch" style={{ background: COLORS[i] }} />
                <span className="lp-legend-name">{area}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .lp-root { margin-top: 2.5rem; margin-bottom: 0.5rem; }

        .lp-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 5px;
        }
        .lp-caption {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(28,30,34,0.35);
        }
        .lp-toggle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: rgba(46,58,92,0.45);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .lp-toggle:hover { color: rgba(46,58,92,0.75); }
        .lp-chevron {
          display: inline-block;
          font-size: 8px;
          transition: transform 0.2s ease;
        }
        .lp-chevron-open { transform: rotate(90deg); }

        .lp-row {
          display: flex;
          align-items: center;
          margin-bottom: 2px;
          border-radius: 3px;
        }
        .lp-hdr-row  { align-items: flex-end; margin-top: 8px; margin-bottom: 3px; }
        .lp-lab-row  { margin-bottom: 0; }

        .lp-label {
          width: 120px;
          min-width: 120px;
          padding-right: 10px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .lp-label-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: rgba(28,30,34,0.55);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .lp-lab-name {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(28,30,34,0.30);
        }
        .lp-track { flex: 1; min-width: 0; }

        .lp-hdr-cols {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
        }
        .lp-hdr-cell {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          text-align: center;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          line-height: 1.2;
          padding-bottom: 2px;
        }
        .lp-abbr-show { display: block; }
        .lp-num-show  { display: none; }

        .lp-readout-wrap { height: 20px; margin-top: 5px; margin-bottom: 3px; }
        .lp-readout {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: rgba(46,58,92,0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .lp-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 12px;
          margin-top: 10px;
          margin-left: 120px;
          margin-bottom: 4px;
        }
        .lp-legend-item { display: flex; align-items: center; gap: 4px; }
        .lp-legend-swatch {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .lp-legend-name {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: rgba(28,30,34,0.50);
          white-space: nowrap;
        }

        @media (max-width: 540px) {
          .lp-label      { width: 52px; min-width: 52px; padding-right: 5px; }
          .lp-label-text { font-size: 10px; }
          .lp-abbr-show  { display: none; }
          .lp-num-show   { display: block; }
          .lp-legend     { margin-left: 52px; }
        }
      `}</style>
    </div>
  )
}
