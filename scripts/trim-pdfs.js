/**
 * trim-pdfs.js
 *
 * For each PDF in public/images/publications/first-pages/:
 *   1. Extract first-page text with pdf-parse
 *   2. Fuzzy-match against all publication titles in src/data/publications.js
 *   3. If matched (>60% word overlap):
 *        - Rename to standardised name: {firstauthor}-{year}-{journal}.pdf
 *        - Print: "old.pdf → new.pdf  (matched: 'Title…')"
 *   4. If unmatched:
 *        - Print warning with top guess
 *        - Leave file unchanged
 *   5. Trim to page 1 with pdf-lib (always)
 *   6. Convert to JPG with sips (always); update firstPage in publications.js
 */

import { readdir, readFile, writeFile, rename } from 'fs/promises'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'
import { PDFDocument } from 'pdf-lib'
import { PDFParse } from 'pdf-parse'

const execAsync = promisify(exec)

const __dir     = fileURLToPath(new URL('..', import.meta.url))
const FOLDER    = join(__dir, 'public/images/publications/first-pages')
const PUB_FILE  = join(__dir, 'src/data/publications.js')

// ─── Load publication data ───────────────────────────────────────────────────

const { selected, originalArticles, reviews } = await import('../src/data/publications.js')
const ALL_PUBS = [...selected, ...originalArticles, ...reviews]

// ─── Helpers ────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

function firstAuthorSlug(authors) {
  // "Nobori, T." → "nobori"   |   "Lee, T.A.*" → "lee"
  const first = authors.split(',')[0].replace(/[^a-zA-Z\s-]/g, '').trim()
  return toSlug(first.split(/\s+/)[0])
}

function journalSlug(journal) {
  return toSlug(journal).replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function standardName(pub) {
  return `${firstAuthorSlug(pub.authors)}-${pub.year}-${journalSlug(pub.journal)}.pdf`
}

/** Words of 4+ chars, lowercased — used for overlap scoring */
function keywords(text) {
  return new Set((text.toLowerCase().match(/\b[a-z]{4,}\b/g) || []))
}

function overlap(setA, setB) {
  let hits = 0
  for (const w of setA) if (setB.has(w)) hits++
  const denom = Math.min(setA.size, setB.size)
  return denom === 0 ? 0 : hits / denom
}

// Pre-compute keyword sets for all pub titles
const PUB_KW = ALL_PUBS.map(p => ({ pub: p, kw: keywords(p.title) }))

function bestMatch(pdfText) {
  const textKw = keywords(pdfText)
  let best = null, bestScore = 0
  for (const { pub, kw } of PUB_KW) {
    const score = overlap(kw, textKw)
    if (score > bestScore) { bestScore = score; best = pub }
  }
  return { pub: best, score: bestScore }
}

// ─── publications.js updater ─────────────────────────────────────────────────

async function updateFirstPage(pub, newPath) {
  let content = await readFile(PUB_FILE, 'utf8')

  // Find the title string in the file
  const titleIdx = content.indexOf(pub.title)
  if (titleIdx === -1) {
    console.warn(`  ⚠  Could not locate title in publications.js: "${pub.title}"`)
    return
  }

  // Find firstPage: after the title (within 2000 chars)
  const fpLabel = 'firstPage:'
  const fpIdx = content.indexOf(fpLabel, titleIdx)
  if (fpIdx === -1 || fpIdx - titleIdx > 2000) {
    console.warn(`  ⚠  No firstPage field found near title: "${pub.title}"`)
    return
  }

  // Replace whatever value is there (single or double quoted, possibly empty)
  const after = content.slice(fpIdx + fpLabel.length)
  const valMatch = after.match(/^(\s*)(['"])[^'"]*\2/)
  if (!valMatch) {
    console.warn(`  ⚠  Could not parse firstPage value for: "${pub.title}"`)
    return
  }

  const start = fpIdx + fpLabel.length
  const end   = start + valMatch[0].length
  content = content.slice(0, start) + ` '${newPath}'` + content.slice(end)
  await writeFile(PUB_FILE, content, 'utf8')
}

// ─── Main ────────────────────────────────────────────────────────────────────

const files = (await readdir(FOLDER)).filter(f => extname(f).toLowerCase() === '.pdf')

if (files.length === 0) {
  console.log('No PDF files found in', FOLDER)
  process.exit(0)
}

const THRESHOLD = 0.60
let matched = 0, unmatched = 0, trimmed = 0, converted = 0

for (const file of files) {
  const filePath = join(FOLDER, file)
  const pdfBytes = await readFile(filePath)
  console.log(`\nProcessing: ${file}`)

  // ── 1. Extract text ──────────────────────────────────────────────────────
  let pdfText = ''
  let textSource = 'pdf'
  try {
    const parser = new PDFParse({ data: pdfBytes })
    const result = await parser.getText({ first: 1 })
    pdfText = result.text || ''
    await parser.destroy()
  } catch (err) {
    console.warn(`  ⚠  Could not extract text (${err.message}) — falling back to filename`)
  }

  // ── 2. Fuzzy match (text first, filename fallback) ───────────────────────
  let { pub, score } = bestMatch(pdfText)

  // If text match is weak, also try the filename itself
  const filenameStem = basename(file, extname(file))
    .replace(/[-_.]+/g, ' ')   // treat separators as spaces
    .replace(/[()[\]]/g, '')
  const filenameMatch = bestMatch(filenameStem)

  if (filenameMatch.score > score) {
    pub = filenameMatch.pub
    score = filenameMatch.score
    textSource = 'filename'
  }

  const pct = Math.round(score * 100)
  if (pdfText || textSource === 'filename') {
    console.log(`  (matched via ${textSource})`)
  }

  let destFile = file // default: keep name
  let matched_this = false

  if (score >= THRESHOLD && pub) {
    destFile = standardName(pub)
    const destPath = join(FOLDER, destFile)
    const newPublicPath = `/images/publications/first-pages/${destFile}`

    // Rename if needed
    if (destFile !== file) {
      await rename(filePath, destPath)
      console.log(`  ✓  ${file} → ${destFile}`)
    } else {
      console.log(`  ✓  ${file} (name already correct)`)
    }
    console.log(`      matched: "${pub.title.slice(0, 60)}${pub.title.length > 60 ? '…' : ''}" (${pct}%)`)

    matched++
    matched_this = true
  } else {
    const guess = pub ? `"${pub.title.slice(0, 55)}…" (${pct}%)` : 'none'
    console.warn(`  ✗  ${file} — could not match (threshold ${THRESHOLD * 100}%)`)
    console.warn(`      Top guess: ${guess}`)
    unmatched++
  }

  // ── 3. Trim to 1 page ───────────────────────────────────────────────────
  const finalPath = join(FOLDER, destFile)
  try {
    const srcBytes = await readFile(finalPath)
    const srcDoc   = await PDFDocument.load(srcBytes)
    const pageCount = srcDoc.getPageCount()

    if (pageCount > 1) {
      const newDoc = await PDFDocument.create()
      const [page] = await newDoc.copyPages(srcDoc, [0])
      newDoc.addPage(page)
      const trimmed_bytes = await newDoc.save()
      await writeFile(finalPath, trimmed_bytes)
      console.log(`      trimmed: ${pageCount} → 1 page`)
      trimmed++
    } else {
      console.log(`      pages: 1 (no trim needed)`)
    }
  } catch (err) {
    console.warn(`  ⚠  Could not trim: ${err.message}`)
  }

  // ── 4. Convert to JPG ────────────────────────────────────────────────────
  const jpgFile = basename(destFile, '.pdf') + '.jpg'
  const jpgPath = join(FOLDER, jpgFile)
  let jpgOk = false
  try {
    await execAsync(`/usr/bin/sips -s format jpeg -s formatOptions 90 --resampleWidth 800 "${finalPath}" --out "${jpgPath}"`)
    jpgOk = true
    console.log(`      → converted to ${jpgFile}`)
    converted++
  } catch (err) {
    console.warn(`  ⚠  JPG conversion failed: ${err.message}`)
  }

  if (matched_this) {
    const publicPath = jpgOk
      ? `/images/publications/first-pages/${jpgFile}`
      : `/images/publications/first-pages/${destFile}`
    await updateFirstPage(pub, publicPath)
    console.log(`      → firstPage updated: ${basename(publicPath)}`)
  }
}

console.log(`\n─────────────────────────────────────`)
console.log(`Done. ${matched} matched, ${unmatched} unmatched, ${trimmed} trimmed, ${converted} converted to JPG.`)
