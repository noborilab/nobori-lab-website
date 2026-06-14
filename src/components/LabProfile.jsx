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

const TRACK_H = 34 // px — fixed; bars scale within this, never collapse

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

// bars: [{h:0–1, opacity:0–1, color:string}]
function Track({ bars, onCol, onLeave }) {
  return (
    <svg
      viewBox="0 0 200 34"
      preserveAspectRatio="none"
      height={TRACK_H}
      width="100%"
      onPointerLeave={onLeave}
      style={{ display: 'block' }}
    >
      {bars.map((b, ai) => (
        <g key={ai}>
          {b.h > 0 && (
            <rect
              x={ai * 20 + 1.5}
              y={34 - b.h * 34}
              width={17}
              height={b.h * 34}
              rx={1.5}
              ry={1.5}
              fill={b.color}
              fillOpacity={b.opacity}
            />
          )}
          {/* Transparent full-height hit rect per column */}
          <rect
            x={ai * 20}
            y={0}
            width={20}
            height={34}
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
  const [hover, setHover] = useState(null) // { lane: 'lab' | number, col: 0–9 }

  const current = members
    .filter(m => m.status === 'current')
    .sort((a, b) => a.order - b.order)

  // Lab aggregate: sum each area column across all current members
  const labSums = researchAreas.map((_, ai) =>
    current.reduce((s, m) => s + m.scores[ai], 0)
  )
  const maxSum = Math.max(...labSums, 1)

  // Rank each column 1 = highest sum
  const ranks = labSums
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s)
    .reduce((acc, { i }, ri) => { acc[i] = ri + 1; return acc }, Array(10).fill(0))

  // Readout text (no raw numbers, per spec)
  let readout = ' ' // non-breaking space preserves height
  if (hover) {
    const area = researchAreas[hover.col]
    if (hover.lane === 'lab') {
      readout = `${area} — ${labPhrase(ranks[hover.col])}`
    } else {
      const score = current[hover.lane].scores[hover.col]
      readout = `${area} — ${scorePhrase(score)}`
    }
  }

  const clear = () => setHover(null)

  const labBars = labSums.map((s, ai) => ({
    h: s / maxSum,
    opacity: 1,
    color: COLORS[ai],
  }))

  return (
    <div className="lp-root">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text/40 mb-3">
        Research Profile
      </p>

      {/* Readout line — fixed height so layout never jumps */}
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

      {/* Lab aggregate lane */}
      <div className="lp-row lp-lab-row">
        <div className="lp-label">
          <span className="lp-label-text lp-lab-name">Lab</span>
        </div>
        <div className="lp-track">
          <Track
            bars={labBars}
            onCol={col => setHover({ lane: 'lab', col })}
            onLeave={clear}
          />
        </div>
      </div>

      {/* Divider below Lab lane */}
      <div className="lp-divider" />

      {/* Member lanes */}
      {current.map((m, mi) => {
        const bars = m.scores.map((sc, ai) => ({
          h: sc / 10,
          opacity: sc > 0 ? 0.42 + 0.58 * (sc / 10) : 0,
          color: COLORS[ai],
        }))
        return (
          <div key={mi} className="lp-row">
            <div className="lp-label">
              <span className="lp-label-text">{m.name}</span>
            </div>
            <div className="lp-track">
              <Track
                bars={bars}
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

      <style>{`
        .lp-root { margin-bottom: 3rem; }

        .lp-readout-wrap { height: 22px; margin-bottom: 8px; }
        .lp-readout {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: rgba(46,58,92,0.70);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .lp-row {
          display: flex;
          align-items: center;
          margin-bottom: 3px;
        }
        .lp-hdr-row { align-items: flex-end; margin-bottom: 5px; }
        .lp-lab-row { margin-bottom: 0; }

        .lp-label {
          width: 120px;
          min-width: 120px;
          padding-right: 10px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .lp-label-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
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
          color: rgba(28,30,34,0.32);
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
          padding-bottom: 3px;
        }
        .lp-abbr-show { display: block; }
        .lp-num-show  { display: none; }

        .lp-divider {
          height: 1px;
          background: var(--color-border, rgba(200,198,192,0.6));
          margin: 5px 0 5px 120px;
        }

        .lp-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 5px 14px;
          margin-top: 14px;
          margin-left: 120px;
        }
        .lp-legend-item { display: flex; align-items: center; gap: 5px; }
        .lp-legend-swatch {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .lp-legend-name {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: rgba(28,30,34,0.55);
          white-space: nowrap;
        }

        @media (max-width: 540px) {
          .lp-label     { width: 52px; min-width: 52px; padding-right: 5px; }
          .lp-label-text { font-size: 10px; }
          .lp-abbr-show { display: none; }
          .lp-num-show  { display: block; }
          .lp-divider   { margin-left: 52px; }
          .lp-legend    { margin-left: 52px; }
        }
      `}</style>
    </div>
  )
}
