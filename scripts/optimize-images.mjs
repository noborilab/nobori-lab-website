// Recompress heavy site images in place using macOS `sips` (no dependencies).
// Gallery photos are served raw from public/, so their file size is their
// download size — a few 6000x4000 JPGs at 5-6 MB dominate first paint.
//
// This is idempotent: files already within limits are skipped, so it's safe to
// re-run. It OVERWRITES the source files; the pre-optimization versions remain
// recoverable from git history (these assets are committed).
//
// It then writes display-size WebP copies ("thumbs") of images that the site
// shows much smaller than the original (team circles, gallery squares, figure
// thumbnails...) to src/assets/thumbs/. src/lib/thumbs.js serves those copies
// and falls back to the original when one is missing. Originals are untouched
// by this step and are still used for lightboxes and downloads. Needs `cwebp`
// (brew install webp). Commit src/assets/thumbs/ along with the images.
//
// Hand-made derivatives (regenerate only if the logo or video changes):
//   public/images/lab-logo.webp           still logo, 1000px:
//     sips -Z 1000 -s format png public/images/lab-logo.png --out /tmp/logo.png
//     cwebp -q 85 -m 6 /tmp/logo.png -o public/images/lab-logo.webp
//   public/images/lab-logo-animated.webp  animated logo, 1000px, 330ms/frame:
//     ffmpeg -i public/images/lab-logo.gif -fps_mode passthrough -vf scale=1000:-1:flags=lanczos /tmp/f%02d.png
//     img2webp -loop 0 -lossy -q 75 -m 6 -d 330 /tmp/f*.png -o public/images/lab-logo-animated.webp
//   public/images/projects/phytomap-poster.webp  first video frame:
//     ffmpeg -i public/images/projects/phytomap.mp4 -frames:v 1 /tmp/p.png
//     cwebp -q 75 /tmp/p.png -o public/images/projects/phytomap-poster.webp
//
// Usage: node scripts/optimize-images.mjs [--dry] [--thumbs-only]

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.join(import.meta.dirname, '..')
const GALLERY_DIR = path.join(ROOT, 'public/images/lab')
const FAVICON = path.join(ROOT, 'public/favicon.png')
const IMAGES_DIR = path.join(ROOT, 'public/images')
const THUMBS_DIR = path.join(ROOT, 'src/assets/thumbs')

const MAX_EDGE = 2000        // px, long edge for gallery photos
const SIZE_BUDGET = 700 * 1024 // bytes; re-encode JPEGs above this even if dims are fine
const JPEG_QUALITY = 80
const THUMB_QUALITY = 75
const DRY = process.argv.includes('--dry')
const THUMBS_ONLY = process.argv.includes('--thumbs-only')

// Which images get a thumb, and how big. Paths are relative to public/images;
// first match wins. Sized for the on-page slot at 2-3x pixel density, never
// upscaled. shortEdge suits slots cropped with object-cover; longEdge suits
// images shown whole. After changing a rule, delete the affected thumbs so they
// are regenerated.
const THUMB_RULES = [
  { test: /^team\/[^/]+$/, shortEdge: 320 },             // 72px circles, 160px CV headshot
  { test: /^lab\/group_photo\/[^/]+$/, longEdge: 1600 }, // video poster, group photo timeline
  { test: /^lab\/\d{4}\/[^/]+$/, shortEdge: 512 },       // gallery squares, news thumbnails
  { test: /^publications\/[^/]+$/, shortEdge: 400 },     // selected-paper figures (not first-pages/)
  { test: /^projects\/[^/]+$/, longEdge: 1200 },         // half-width project cards
  { test: /^funders\/[^/]+$/, longEdge: 480 },           // 50px-tall logos
]

const sips = (args) => execFileSync('sips', args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const kb = (b) => `${(b / 1024).toFixed(0)} kB`

function dimsOf(file) {
  const out = sips(['-g', 'pixelWidth', '-g', 'pixelHeight', file])
  const w = +(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0)
  const h = +(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
  return { w, h }
}

function walk(dir, pattern = /\.(jpe?g|png)$/i) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, pattern))
    else if (pattern.test(entry.name)) out.push(full)
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

// EXIF orientation -> clockwise rotation, so camera photos aren't sideways
// (cwebp ignores the tag). Mirrored orientations are rare enough to skip.
const ROTATION = { 3: 180, 6: 90, 8: 270 }

// Read the EXIF orientation tag (0x0112) of a JPEG; 1 when absent. Parsed by
// hand because `sips -g orientation` reports <nil> even when the tag is set.
function exifOrientation(file) {
  if (!/\.jpe?g$/i.test(file)) return 1
  const buf = fs.readFileSync(file)
  let off = 2
  while (off + 4 < buf.length && buf[off] === 0xff) {
    const marker = buf[off + 1]
    if (marker === 0xda) break // start of image data: no more metadata
    if (marker === 0xe1 && buf.toString('latin1', off + 4, off + 10) === 'Exif\0\0') {
      const tiff = off + 10
      const le = buf.toString('latin1', tiff, tiff + 2) === 'II'
      const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o))
      const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o))
      const ifd = tiff + u32(tiff + 4)
      for (let i = 0, n = u16(ifd); i < n; i++) {
        const entry = ifd + 2 + i * 12
        if (u16(entry) === 0x0112) return u16(entry + 8)
      }
      return 1
    }
    off += 2 + buf.readUInt16BE(off + 2)
  }
  return 1
}

const thumbPathFor = (rel) => path.join(THUMBS_DIR, `${rel}.webp`)

function makeThumb(file, rule, tmpDir) {
  const rel = path.relative(IMAGES_DIR, file)
  const out = thumbPathFor(rel)
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(file).mtimeMs) return 0
  if (DRY) {
    console.log(`would create thumb for ${rel}`)
    return 1
  }

  const { w, h } = dimsOf(file)
  const long = Math.max(w, h)
  const short = Math.min(w, h)
  const target = Math.min(
    long,
    rule.longEdge ?? Math.round((rule.shortEdge * long) / short),
  )
  const orientation = exifOrientation(file)

  const tmp = path.join(tmpDir, 'thumb.png')
  const args = ['-s', 'format', 'png']
  if (target < long) args.push('-Z', String(target))
  if (ROTATION[orientation]) args.push('-r', String(ROTATION[orientation]))
  sips([...args, file, '--out', tmp])

  fs.mkdirSync(path.dirname(out), { recursive: true })
  execFileSync('cwebp', ['-quiet', '-q', String(THUMB_QUALITY), '-m', '6', '-metadata', 'none', tmp, '-o', out])
  const sizeIn = fs.statSync(file).size
  const sizeOut = fs.statSync(out).size
  if (sizeOut >= sizeIn) {
    // Already small (e.g. a tiny logo): the site falls back to the original.
    fs.unlinkSync(out)
    console.log(`thumb ${rel}: skipped, original is already smaller (${kb(sizeIn)})`)
    return 0
  }
  console.log(`thumb ${rel}: ${w}x${h} ${kb(sizeIn)} -> ${target}px ${kb(sizeOut)}`)
  return 1
}

function generateThumbs() {
  if (!DRY) {
    try {
      execFileSync('cwebp', ['-version'], { stdio: 'ignore' })
    } catch {
      console.error('\ncwebp not found; install it with `brew install webp` to generate thumbs.')
      process.exit(1)
    }
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'thumbs-'))
  const expected = new Set()
  let made = 0
  try {
    for (const file of walk(IMAGES_DIR, /\.(jpe?g|png|webp)$/i)) {
      const rel = path.relative(IMAGES_DIR, file)
      const rule = THUMB_RULES.find((r) => r.test.test(rel))
      if (!rule) continue
      expected.add(thumbPathFor(rel))
      made += makeThumb(file, rule, tmpDir)
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }

  // Thumbs whose source was removed or renamed. Left in place (they still get
  // bundled), so delete them by hand once you're sure.
  if (fs.existsSync(THUMBS_DIR)) {
    for (const t of walk(THUMBS_DIR, /\.webp$/i)) {
      if (!expected.has(t)) console.log(`orphaned thumb (no source image): ${path.relative(ROOT, t)}`)
    }
  }
  console.log(`\n${made} thumb(s) ${DRY ? 'would be ' : ''}created or updated`)
}

console.log(DRY ? '— dry run —' : '— optimizing images —')
if (!THUMBS_ONLY) {
  for (const f of walk(GALLERY_DIR)) optimizeGalleryFile(f)
  optimizeFavicon()

  console.log(
    `\n${processed} file(s) ${DRY ? 'would be ' : ''}optimized` +
      (DRY ? '' : `  (${kb(before)} -> ${kb(after)}, saved ${kb(before - after)})`),
  )
}
generateThumbs()
