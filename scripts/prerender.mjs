// Runs after `vite build` (see package.json). For every page it:
//   1. renders the React tree to static HTML and writes it into #root, so
//      search engines, link previews and AI crawlers get the real content
//      instead of an empty <div> (the browser bundle then takes over as before);
//   2. gives topic pages (/phytomap/, /primer-cells/) their own index.html with
//      their own title, description and canonical URL;
//   3. writes sitemap.xml listing every page with today's date.
// Pages come from `routes` in src/prerender.jsx.

import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'node_modules', '.prerender')

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function setHead(html, { title, description, url }) {
  const t = escapeAttr(title)
  const d = escapeAttr(description)
  const swaps = [
    [/<title>[^<]*<\/title>/, `<title>${t}</title>`],
    [/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
    [/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`],
    [/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`],
    [/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`],
    [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`],
  ]
  for (const [pattern, replacement] of swaps) {
    if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in index.html`)
    html = html.replace(pattern, replacement)
  }
  return html
}

async function main() {
  // Server build of the same components (no assets emitted; image URLs match
  // the browser build because file hashes depend only on content).
  await build({
    root,
    configFile: false,
    logLevel: 'warn',
    plugins: [react(), tailwindcss()],
    build: { ssr: 'src/prerender.jsx', outDir: ssrDir, emptyOutDir: true },
  })
  const { routes, SITE_URL } = await import(pathToFileURL(path.join(ssrDir, 'prerender.js')).href)

  const template = await readFile(path.join(dist, 'index.html'), 'utf8')
  const mount = '<div id="root"></div>'
  if (!template.includes(mount)) throw new Error('prerender: #root mount point not found')

  for (const route of routes) {
    const body = route.render()
    let html = template.replace(mount, () => `<div id="root">${body}</div>`)
    if (route.head) html = setHead(html, { ...route.head, url: SITE_URL + route.path })

    // Every image the static HTML points at must exist in the build.
    for (const [, src] of body.matchAll(/<img[^>]+src="(\/assets\/[^"]+)"/g)) {
      if (!existsSync(path.join(dist, decodeURI(src)))) {
        throw new Error(`prerender: ${route.path} references missing file ${src}`)
      }
    }

    const dir = path.join(dist, route.path)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), html)
    console.log(`prerendered ${route.path.padEnd(18)} ${(html.length / 1024).toFixed(0)} kB`)
  }

  const today = new Date().toISOString().slice(0, 10)
  const urls = routes
    .map((r) => `  <url>\n    <loc>${SITE_URL}${r.path === '/' ? '' : r.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n')
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
  console.log(`sitemap.xml: ${routes.length} pages, lastmod ${today}`)

  await rm(ssrDir, { recursive: true, force: true })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
