/**
 * fetch-lab-profile.mjs
 *
 * Fetches lab research-profile data from a Google Sheet published as CSV and
 * writes src/data/labProfile.json.  This file is then imported by the build.
 *
 * Setup (once consent is obtained):
 *   1. In Google Sheets → File → Share → Publish to web → Sheet "Profile" → CSV
 *   2. Copy the generated URL and store it as the SHEET_CSV_URL repository secret
 *   3. Enable the workflow in .github/workflows/lab-profile.yml
 *
 * Expected sheet layout (row 1 = header):
 *   Name | Status | Order | <Area 1 name> | <Area 2 name> | … | <Area 10 name>
 *
 * Status values: "current" | "former"
 * Score values:  integers 0–10
 *
 * Run locally (with the URL set):
 *   SHEET_CSV_URL="https://…" node scripts/fetch-lab-profile.mjs
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const SHEET_CSV_URL = process.env.SHEET_CSV_URL

if (!SHEET_CSV_URL) {
  console.error('Error: SHEET_CSV_URL environment variable is not set.')
  console.error('Set it to the "Publish to web → CSV" URL for the profile sheet.')
  process.exit(1)
}

console.log('Fetching lab profile sheet…')
const res = await fetch(SHEET_CSV_URL)
if (!res.ok) {
  console.error(`Failed to fetch sheet: HTTP ${res.status} ${res.statusText}`)
  process.exit(1)
}

const text = await res.text()
const rows = text
  .trim()
  .split('\n')
  .map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))

const [header, ...dataRows] = rows

// Area names are columns 3 onwards (after Name, Status, Order)
const researchAreas = header.slice(3, 13)

if (researchAreas.length !== 10) {
  console.error(`Expected 10 area columns, found ${researchAreas.length}. Check sheet layout.`)
  process.exit(1)
}

const members = dataRows
  .filter(r => r[0])
  .map(r => ({
    name:   r[0],
    status: (r[1] || '').toLowerCase(),
    order:  parseInt(r[2], 10) || 0,
    scores: r.slice(3, 13).map(v => Math.min(10, Math.max(0, parseInt(v, 10) || 0))),
  }))

const output = { researchAreas, members }

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'labProfile.json')
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n')

console.log(`✓ Wrote ${members.length} members (${members.filter(m => m.status === 'current').length} current) to ${outPath}`)
