// Generates src/data/world-110m.json — the base map for the team origins map.
//
// Source: Natural Earth 1:110m "Admin 0 – Countries" (public domain),
// via https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
//
// What it does:
//   - keeps only { iso, name } per country (iso = ISO_A2_EH when valid, else ISO_A2 —
//     the plain ISO_A2 field is "-99" for France/Norway and "CN-TW" for Taiwan)
//   - drops Antarctica (not needed; it also contains the dataset's only
//     antimeridian-crossing ring, which would streak across a naive SVG path)
//   - rounds coordinates to 2 decimals (~1 km) and removes the resulting
//     consecutive duplicate points
//
// Usage: node scripts/prepare-world-geojson.mjs [path-to-local-source.geojson]
// Without an argument it downloads the source from the URL above.

import fs from 'node:fs'
import path from 'node:path'

const SOURCE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
const OUT = path.join(import.meta.dirname, '..', 'src', 'data', 'world-110m.json')

async function loadSource() {
  const local = process.argv[2]
  if (local) return JSON.parse(fs.readFileSync(local, 'utf8'))
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`download failed: ${res.status}`)
  return await res.json()
}

const round = (v) => Math.round(v * 100) / 100

function slimRing(ring) {
  const out = []
  for (const [lon, lat] of ring) {
    const p = [round(lon), round(lat)]
    const prev = out[out.length - 1]
    if (prev && prev[0] === p[0] && prev[1] === p[1]) continue
    out.push(p)
  }
  return out.length >= 4 ? out : null
}

function slimPolygon(rings) {
  const out = rings.map(slimRing).filter(Boolean)
  return out.length ? out : null
}

const src = await loadSource()
const features = []

for (const f of src.features) {
  const p = f.properties
  const iso = /^[A-Z]{2}$/.test(p.ISO_A2_EH) ? p.ISO_A2_EH : p.ISO_A2
  if (iso === 'AQ') continue

  const polys =
    f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  const slimmed = polys.map(slimPolygon).filter(Boolean)
  if (!slimmed.length) continue

  features.push({
    type: 'Feature',
    properties: { iso, name: p.NAME },
    geometry:
      slimmed.length === 1
        ? { type: 'Polygon', coordinates: slimmed[0] }
        : { type: 'MultiPolygon', coordinates: slimmed },
  })
}

// Sanity check: a segment jumping more than 180° of longitude would render as a
// horizontal streak across the map.
for (const f of features) {
  const polys =
    f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys)
    for (const ring of poly)
      for (let i = 1; i < ring.length; i++)
        if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180)
          throw new Error(`antimeridian crossing in ${f.properties.name}`)
}

const json = JSON.stringify({ type: 'FeatureCollection', features })
fs.writeFileSync(OUT, json)
console.log(`wrote ${OUT}: ${features.length} countries, ${(json.length / 1024).toFixed(0)} kB`)
