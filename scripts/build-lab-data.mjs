/**
 * build-lab-data.mjs
 *
 * Reads data/source/scores.csv + data/source/collaborations.csv
 * (or fetches from Google Sheet CSV URLs via env vars SCORES_CSV_URL /
 * COLLAB_CSV_URL when present), validates, and writes src/data/labProfile.json.
 *
 * Usage:
 *   node scripts/build-lab-data.mjs
 *
 * With remote sheets (once consent obtained and secrets configured):
 *   SCORES_CSV_URL="…" COLLAB_CSV_URL="…" node scripts/build-lab-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DATA = join(ROOT, 'src', 'data')
const DATA_SRC  = join(ROOT, 'data', 'source')

// ── Helpers ──────────────────────────────────────────────────────────────────

async function loadText(envVar, localPath) {
  const url = process.env[envVar]
  if (url) {
    console.log(`  Fetching ${envVar} …`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${envVar}: HTTP ${res.status}`)
    return res.text()
  }
  console.log(`  Reading ${localPath} …`)
  return readFileSync(localPath, 'utf8')
}

/** Parse a CSV string → array of row-objects; skips comment lines (#). */
function parseCSV(text) {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))

  if (lines.length < 2) throw new Error('CSV has fewer than 2 non-comment lines')
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']))
  })
}

// ── Load & parse ──────────────────────────────────────────────────────────────

console.log('Building lab profile data…')

const [scoresText, collabText] = await Promise.all([
  loadText('SCORES_CSV_URL', join(DATA_SRC, 'scores.csv')),
  loadText('COLLAB_CSV_URL', join(DATA_SRC, 'collaborations.csv')),
])

const scoreRows = parseCSV(scoresText)
const collabRows = parseCSV(collabText)

// ── Research areas = all columns after name/status/order ──────────────────────

const FIXED_COLS = new Set(['name', 'status', 'order'])
const areas = Object.keys(scoreRows[0]).filter(k => !FIXED_COLS.has(k))

if (areas.length === 0) throw new Error('No area columns found in scores.csv')
console.log(`  ${areas.length} research areas: ${areas.join(', ')}`)

// ── Filter to current members ─────────────────────────────────────────────────

const currentRows = scoreRows.filter(r => (r.status || '').toLowerCase() === 'current')
if (currentRows.length === 0) throw new Error('No current members found in scores.csv')

const members = currentRows
  .sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10))
  .map(r => {
    const scores = areas.map(area => {
      const v = parseInt(r[area], 10)
      if (isNaN(v)) throw new Error(`Non-integer score for "${r.name}" / "${area}": "${r[area]}"`)
      if (v < 0 || v > 10) throw new Error(`Score out of range [0,10] for "${r.name}" / "${area}": ${v}`)
      return v
    })
    return { name: r.name, order: parseInt(r.order, 10), scores }
  })

console.log(`  ${members.length} current members`)

// ── Build edges ───────────────────────────────────────────────────────────────
// edges emit as [i, j, level] where level ∈ {1, 2}

const nameToIdx = Object.fromEntries(members.map((m, i) => [m.name, i]))
const edgeSet = new Set()
const edges = []

for (const row of collabRows) {
  const a = (row.person_a || '').trim()
  const b = (row.person_b || '').trim()
  if (!a || !b) continue

  // Parse and validate level
  const rawLevel = (row.level || '').trim()
  if (rawLevel === '' || rawLevel === '0') continue   // omit level-0 rows
  const level = parseInt(rawLevel, 10)
  if (level !== 1 && level !== 2) {
    console.warn(`  [skip] invalid level "${rawLevel}" for "${a}" — "${b}" (must be 1 or 2)`)
    continue
  }

  if (nameToIdx[a] === undefined) { console.warn(`  [skip] "${a}" not in current members`); continue }
  if (nameToIdx[b] === undefined) { console.warn(`  [skip] "${b}" not in current members`); continue }
  const i = nameToIdx[a], j = nameToIdx[b]
  if (i === j) continue
  const key = `${Math.min(i, j)}-${Math.max(i, j)}`
  if (edgeSet.has(key)) continue
  edgeSet.add(key)
  edges.push([Math.min(i, j), Math.max(i, j), level])
}

edges.sort(([a1, b1], [a2, b2]) => a1 - a2 || b1 - b2)
const nRegular = edges.filter(e => e[2] === 2).length
console.log(`  ${edges.length} collaboration edges (${nRegular} regular, ${edges.length - nRegular} occasional)`)

// ── Write output ──────────────────────────────────────────────────────────────

const output = { areas, members, edges }
const outPath = join(SRC_DATA, 'labProfile.json')
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n')
console.log(`✓ Wrote ${outPath}`)
