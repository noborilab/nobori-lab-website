// Recompress heavy site images in place using macOS `sips` (no dependencies).
// Gallery photos are served raw from public/, so their file size is their
// download size — a few 6000x4000 JPGs at 5-6 MB dominate first paint.
//
// This is idempotent: files already within limits are skipped, so it's safe to
// re-run. It OVERWRITES the source files; the pre-optimization versions remain
// recoverable from git history (these assets are committed).
//
// Usage: node scripts/optimize-images.mjs [--dry]

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(import.meta.dirname, '..')
const GALLERY_DIR = path.join(ROOT, 'public/images/lab')
const FAVICON = path.join(ROOT, 'public/favicon.png')

const MAX_EDGE = 2000        // px, long edge for gallery photos
const SIZE_BUDGET = 700 * 1024 // bytes; re-encode JPEGs above this even if dims are fine
const JPEG_QUALITY = 80
const DRY = process.argv.includes('--dry')

const sips = (args) => execFileSync('sips', args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const kb = (b) => `${(b / 1024).toFixed(0)} kB`

function dimsOf(file) {
  const out = sips(['-g', 'pixelWidth', '-g', 'pixelHeight', file])
  const w = +(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0)
  const h = +(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
  return { w, h }
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(full)
  }
  return out
}

let processed = 0
let before = 0
let after = 0

function optimizeGalleryFile(file) {
  const isJpeg = /\.jpe?g$/i.test(file)
  const sizeBefore = fs.statSync(file).size
  const { w, h } = dimsOf(file)
  const longEdge = Math.max(w, h)
  const needsResize = longEdge > MAX_EDGE
  const needsRecompress = isJpeg && sizeBefore > SIZE_BUDGET
  if (!needsResize && !needsRecompress) return

  before += sizeBefore
  const rel = path.relative(ROOT, file)
  if (DRY) {
    console.log(`would optimize ${rel}  (${w}x${h}, ${kb(sizeBefore)})`)
    processed++
    return
  }

  // Optimize into a temp file first; recompressing an already-small JPEG can
  // make it larger, so only replace the original when we actually save bytes.
  const tmp = `${file}.opt${path.extname(file)}`
  const args = []
  if (needsResize) args.push('-Z', String(MAX_EDGE)) // preserves aspect ratio
  if (isJpeg) args.push('-s', 'format', 'jpeg', '-s', 'formatOptions', String(JPEG_QUALITY))
  args.push(file, '--out', tmp)
  sips(args)

  const sizeAfter = fs.statSync(tmp).size
  if (sizeAfter >= sizeBefore) {
    fs.unlinkSync(tmp)
    before -= sizeBefore
    console.log(`${rel}: kept original (${kb(sizeBefore)}; re-encode was ${kb(sizeAfter)})`)
    return
  }
  fs.renameSync(tmp, file)
  after += sizeAfter
  processed++
  console.log(`${rel}: ${w}x${h} ${kb(sizeBefore)} -> ${kb(sizeAfter)}`)
}

function optimizeFavicon() {
  if (!fs.existsSync(FAVICON)) return
  const sizeBefore = fs.statSync(FAVICON).size
  const { w, h } = dimsOf(FAVICON)
  if (Math.max(w, h) <= 256 && sizeBefore < SIZE_BUDGET) return
  before += sizeBefore
  if (DRY) {
    console.log(`would optimize favicon.png (${w}x${h}, ${kb(sizeBefore)})`)
    processed++
    return
  }
  const tmp = `${FAVICON}.opt.png`
  sips(['-Z', '256', FAVICON, '--out', tmp])
  const sizeAfter = fs.statSync(tmp).size
  if (sizeAfter >= sizeBefore) {
    fs.unlinkSync(tmp)
    before -= sizeBefore
    console.log(`public/favicon.png: kept original (${kb(sizeBefore)})`)
    return
  }
  fs.renameSync(tmp, FAVICON)
  after += sizeAfter
  processed++
  console.log(`public/favicon.png: ${w}x${h} ${kb(sizeBefore)} -> ${kb(sizeAfter)}`)
}

console.log(DRY ? '— dry run —' : '— optimizing images —')
for (const f of walk(GALLERY_DIR)) optimizeGalleryFile(f)
optimizeFavicon()

console.log(
  `\n${processed} file(s) ${DRY ? 'would be ' : ''}optimized` +
    (DRY ? '' : `  (${kb(before)} -> ${kb(after)}, saved ${kb(before - after)})`),
)
