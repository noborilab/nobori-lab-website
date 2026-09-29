/* global process, Buffer */
// Generates the downloadable CV PDF from the site's data files.
//
// - `npm run dev`: the PDF is rebuilt from the current data on every request
//   to cvPdfPath, so edits to src/data/ show up on reload.
// - `npm run build`: the PDF is written into dist/ alongside the site.
//
// Printing uses a locally installed Google Chrome or Chromium, driven over the
// DevTools protocol through a pipe (no extra npm dependencies). Set
// CHROME_PATH to override the browser location. In CI a missing browser fails
// the build so a broken download link is never deployed; locally it only warns.

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cvPdfPath } from '../src/data/identity.js'
import { renderCvHtml, CV_FONTS } from './cv-template.js'

const DATA_MODULES = ['cv', 'publications', 'team', 'identity']

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
]

export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  return CHROME_CANDIDATES.find((p) => existsSync(p)) || null
}

// Minimal DevTools-protocol client over --remote-debugging-pipe:
// messages are JSON separated by NUL bytes (we write fd 3, Chrome writes fd 4).
function pipeClient(proc) {
  const [, , , toChrome, fromChrome] = proc.stdio
  toChrome.on('error', () => {}) // EPIPE once Chrome has exited; handled via 'exit'
  let nextId = 1
  let buffer = ''
  const pending = new Map()
  const waiters = []

  fromChrome.setEncoding('utf8')
  fromChrome.on('data', (chunk) => {
    buffer += chunk
    let end
    while ((end = buffer.indexOf('\0')) !== -1) {
      const msg = JSON.parse(buffer.slice(0, end))
      buffer = buffer.slice(end + 1)
      if (msg.id && pending.has(msg.id)) {
        const { resolve: ok, reject, method } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) reject(new Error(`${method}: ${msg.error.message}`))
        else ok(msg.result)
      } else if (msg.method) {
        for (const w of waiters.filter((w) => w.method === msg.method && w.sessionId === msg.sessionId)) {
          waiters.splice(waiters.indexOf(w), 1)
          w.resolve(msg.params)
        }
      }
    }
  })

  const failAll = (err) => {
    for (const { reject } of pending.values()) reject(err)
    pending.clear()
  }
  proc.on('exit', (code) => failAll(new Error(`Chrome exited unexpectedly (code ${code})`)))

  return {
    send(method, params = {}, sessionId) {
      const id = nextId++
      toChrome.write(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }) + '\0')
      return new Promise((ok, reject) => pending.set(id, { resolve: ok, reject, method }))
    },
    once(method, sessionId) {
      return new Promise((ok) => waiters.push({ method, sessionId, resolve: ok }))
    },
  }
}

// Prints an HTML string to PDF. Returns { pdf: Buffer, missingFonts: string[] }.
export async function htmlToPdf(html, { timeoutMs = 60_000 } = {}) {
  const chrome = findChrome()
  if (!chrome) {
    throw new Error('Google Chrome or Chromium not found. Install it or set CHROME_PATH.')
  }

  const dir = await mkdtemp(join(tmpdir(), 'nobori-cv-'))
  const htmlFile = join(dir, 'cv.html')
  await writeFile(htmlFile, html)

  const args = [
    '--headless',
    '--remote-debugging-pipe',
    `--user-data-dir=${join(dir, 'profile')}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    '--mute-audio',
    ...(process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
    'about:blank',
  ]
  const proc = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] })
  const exited = new Promise((ok) => proc.once('exit', ok).once('error', ok))
  const spawnError = new Promise((_, reject) => proc.once('error', reject))
  const cdp = pipeClient(proc)

  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`CV PDF generation timed out after ${timeoutMs / 1000}s`)), timeoutMs)
  })

  const run = async () => {
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
    await cdp.send('Page.enable', {}, sessionId)
    const loaded = cdp.once('Page.loadEventFired', sessionId)
    await cdp.send('Page.navigate', { url: pathToFileURL(htmlFile).href }, sessionId)
    await loaded

    const { result } = await cdp.send(
      'Runtime.evaluate',
      {
        expression: `document.fonts.ready.then(() => ${JSON.stringify(CV_FONTS)}.filter((f) => !document.fonts.check(f)))`,
        awaitPromise: true,
        returnByValue: true,
      },
      sessionId,
    )

    const { data } = await cdp.send(
      'Page.printToPDF',
      {
        printBackground: true,
        preferCSSPageSize: true,
        generateTaggedPDF: true,
        generateDocumentOutline: true,
      },
      sessionId,
    )
    return { pdf: Buffer.from(data, 'base64'), missingFonts: result.value || [] }
  }

  try {
    return await Promise.race([run(), timeout, spawnError])
  } finally {
    clearTimeout(timer)
    cdp.send('Browser.close').catch(() => {})
    const killer = setTimeout(() => proc.kill('SIGKILL'), 3000)
    await Promise.race([exited, new Promise((ok) => setTimeout(ok, 5000))])
    clearTimeout(killer)
    await rm(dir, { recursive: true, force: true })
  }
}

// `load` imports a module by its root-relative path ('/src/data/cv.js').
export async function buildCvPdf(load, options) {
  const modules = await Promise.all(DATA_MODULES.map((name) => load(`/src/data/${name}.js`)))
  const data = Object.fromEntries(DATA_MODULES.map((name, i) => [name, modules[i]]))
  return htmlToPdf(renderCvHtml(data, options))
}

function reportFonts(logger, missingFonts) {
  if (missingFonts.length) {
    logger.warn(`CV PDF: web fonts did not load (${missingFonts.join(', ')}); fallback fonts were used.`)
  }
}

export function cvPdfPlugin() {
  let root = process.cwd()

  return {
    name: 'nobori-cv-pdf',

    configResolved(config) {
      root = config.root
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || req.url.split('?')[0] !== cvPdfPath) return next()
        try {
          const { pdf, missingFonts } = await buildCvPdf((p) => server.ssrLoadModule(p))
          reportFonts(server.config.logger, missingFonts)
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Cache-Control', 'no-store')
          res.end(pdf)
        } catch (err) {
          server.config.logger.error(`CV PDF: ${err.message}`)
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(`Could not generate the CV PDF: ${err.message}`)
        }
      })
    },

    async generateBundle() {
      try {
        const load = (p) => import(pathToFileURL(resolve(root, `.${p}`)).href)
        const { pdf, missingFonts } = await buildCvPdf(load)
        reportFonts(this, missingFonts)
        this.emitFile({ type: 'asset', fileName: cvPdfPath.replace(/^\//, ''), source: pdf })
      } catch (err) {
        const message = `CV PDF was not generated: ${err.message}`
        if (process.env.CI) this.error(message)
        this.warn(message)
      }
    },
  }
}
