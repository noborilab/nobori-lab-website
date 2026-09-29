// Renders the downloadable CV as a standalone A4 HTML page. All content comes
// from the src/data/ modules passed in, so the PDF stays in sync with the
// site. scripts/cv-pdf.js prints this page to PDF with headless Chrome.

import { readFileSync } from 'node:fs'

// Static (non-variable) Karla and Cormorant Garamond from Fontsource, OFL
// licensed (see scripts/cv-fonts/). Chrome embeds variable web fonts as Type 3
// glyphs, which print less crisply, so the CV uses these local files instead.
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
const FONT_FILES = [
  ['Karla', 'karla', 400, 'normal'],
  ['Karla', 'karla', 500, 'normal'],
  ['Karla', 'karla', 700, 'normal'],
  ['Karla', 'karla', 400, 'italic'],
  ['Cormorant Garamond', 'cormorant-garamond', 600, 'normal'],
]

function fontFaceCss() {
  return FONT_FILES.flatMap(([family, file, weight, style]) =>
    [['latin', LATIN], ['latin-ext', LATIN_EXT]].map(([subset, range]) => {
      const url = new URL(`./cv-fonts/${file}-${subset}-${weight}-${style}.woff2`, import.meta.url)
      const data = readFileSync(url).toString('base64')
      return `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: ${style}; src: url(data:font/woff2;base64,${data}) format("woff2"); unicode-range: ${range}; }`
    }),
  ).join('\n')
}

// Fonts that must be loaded before printing (checked in cv-pdf.js).
export const CV_FONTS = ['600 12px "Cormorant Garamond"', '400 12px Karla', '700 12px Karla']

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const cssString = (s) => `"${String(s).replace(/["\\]/g, '\\$&')}"`

const link = (href, html) => (href ? `<a href="${esc(href)}">${html}</a>` : html)

// "Senior Editor, MPMI, 2025–present" → { what: 'Senior Editor, MPMI', when: '2025–present' }
// Falls back to the whole string when there is no trailing date.
const MONTH = '(?:[A-Z][a-z]{2} )?'
const TRAILING_DATE = new RegExp(
  `^(.*?)[,\\s]+(${MONTH}\\d{4}(?:\\s*[\\u2013-]\\s*(?:${MONTH}\\d{4}|present))?)$`,
  'i',
)
function splitTrailingDate(text) {
  const m = String(text).match(TRAILING_DATE)
  return m ? { what: m[1], when: m[2] } : { what: text, when: '' }
}

const normTitle = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const isPreprint = (p) => /rxiv$/i.test(p.journal || '')

function row(when, body, cls = '') {
  return `<div class="row${cls ? ` ${cls}` : ''}"><div class="when">${when}</div><div class="what">${body}</div></div>`
}

function section(title, body) {
  return `<section><h2>${esc(title)}</h2>${body}</section>`
}

// Rows grouped by year: the year is shown only on the first row of each group.
function yearRows(items, yearOf, render, cls) {
  let last = null
  return items
    .map((item) => {
      const year = String(yearOf(item))
      const label = year === last ? '' : esc(year)
      last = year
      return row(label, render(item), cls)
    })
    .join('')
}

function socialLabel(url) {
  const u = new URL(url)
  const host = u.hostname.replace(/^www\./, '')
  const handle = u.pathname.split('/').filter(Boolean).pop() || ''
  if (host === 'scholar.google.com') return 'Google Scholar'
  if (host === 'bsky.app') return `Bluesky @${handle.replace(/\.bsky\.social$/, '')}`
  if (host === 'twitter.com' || host === 'x.com') return `X @${handle}`
  if (host === 'tsl.ac.uk') return 'TSL group page'
  if (host === 'the-scientist.com') return 'Profile in The Scientist'
  return host
}

export function renderCvHtml({ cv, publications, team, identity }, { updated = new Date() } = {}) {
  const { pi, org, SITE_URL } = identity
  const updatedLabel = updated.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const country = new Intl.DisplayNames(['en'], { type: 'region' }).of(org.address.country)
  const address = `${org.address.street}, ${org.address.locality} ${org.address.postalCode}, ${country}`

  // Bold the PI's name in author lists ("Nobori, T." with optional *).
  const nameParts = pi.name.split(' ')
  const authorName = `${nameParts.at(-1)}, ${nameParts[0][0]}.`
  const authorRe = new RegExp(`${authorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*?`, 'g')
  const authors = (s) => esc(s).replace(authorRe, (m) => `<strong>${m}</strong>`)

  // ── Header ──
  const site = SITE_URL.replace(/^https?:\/\//, '')
  const masthead = `
    <header class="masthead">
      <p class="kicker">Curriculum Vitae</p>
      <h1>${esc(pi.name)}</h1>
      <p class="position">${esc(pi.jobTitle)}, ${link(org.parent.url, esc(org.parent.name))}</p>
      <p class="contact"><span>${esc(address)}</span><span>${link(`mailto:${org.email}`, esc(org.email))}</span><span>${link(SITE_URL, esc(site))}</span></p>
      <p class="contact">${pi.sameAs.map((u) => `<span>${link(u, esc(socialLabel(u)))}</span>`).join('')}</p>
    </header>`

  // ── Appointments & education ──
  const experienceRow = (e) =>
    row(
      esc(e.period),
      `<strong>${esc(e.role)}</strong>, ${esc(e.institution)}, ${esc(e.location)}` +
        (e.detail ? `<div class="sub">${esc(e.detail)}</div>` : ''),
    )
  const appointments = cv.experience.filter((e) => e.type !== 'education')
  const education = cv.experience.filter((e) => e.type === 'education')

  // "{ text, href }" or plain-string lists with a trailing date → dated rows.
  const datedRows = (items) =>
    items
      .map((item) => {
        const { text, href } = typeof item === 'string' ? { text: item } : item
        const { what, when } = splitTrailingDate(text)
        return row(esc(when), link(href, esc(what)))
      })
      .join('')

  // ── Publications ──
  // `selected` entries carry the notes and highlights; merge them onto the
  // full lists by title so every paper appears once with its richest data.
  const selectedByTitle = new Map(publications.selected.map((p) => [normTitle(p.title), p]))
  const enrich = (p) => {
    const s = selectedByTitle.get(normTitle(p.title)) || {}
    return {
      ...p,
      journalNote: p.journalNote || s.journalNote,
      highlights: p.highlights?.length ? p.highlights : s.highlights || [],
      link: p.link || s.link,
    }
  }
  const byYearDesc = (a, b) => b.year - a.year
  const dedupe = (list) => {
    const seen = new Set()
    return list.filter((p) => !seen.has(normTitle(p.title)) && seen.add(normTitle(p.title)))
  }
  const articles = dedupe(publications.originalArticles).map(enrich).sort(byYearDesc)
  const reviews = dedupe(publications.reviews).map(enrich).sort(byYearDesc)
  const pubGroups = [
    ['Preprints', articles.filter(isPreprint)],
    ['Research articles', articles.filter((p) => !isPreprint(p))],
    ['Reviews, perspectives and commentaries', reviews],
  ].filter(([, list]) => list.length)

  const citation = (p) => {
    const note = p.journalNote
      ? ` <span class="muted">${esc(p.journalNote.startsWith('(') ? p.journalNote : `(${p.journalNote})`)}</span>`
      : ''
    const title = esc(p.title) + (/[.?!]$/.test(p.title) ? '' : '.')
    const highlights = p.highlights.length
      ? `<div class="sub">Highlighted in: ${p.highlights.map((h) => link(h.href, esc(h.text))).join('; ')}</div>`
      : ''
    return `${authors(p.authors)} ${link(p.link, title)} <em>${esc(p.journal)}</em>.${note}${highlights}`
  }
  const publicationsHtml =
    `<p class="lede">* Co-first or co-corresponding authors, as noted.</p>` +
    pubGroups
      .map(
        ([label, list]) =>
          `<h3>${esc(label)} <span class="count">(${list.length})</span></h3>` +
          yearRows(list, (p) => p.year, citation, 'pub'),
      )
      .join('')

  // ── Invited talks ──
  const talkYears = Object.keys(cv.invitedTalksByYear).sort((a, b) => b - a)
  const talks = talkYears.flatMap((year) => cv.invitedTalksByYear[year].map((text) => ({ year, text })))
  const talksHtml = yearRows(talks, (t) => t.year, (t) => esc(t.text))

  // ── Reviewing ──
  const reviewerHtml =
    row('Grants', esc(cv.reviewerGrants.join(', '))) + row('Journals', esc(cv.reviewerJournals.join(', ')))

  // ── Research group ──
  const roleGroups = new Map()
  for (const m of team.teamMembers) {
    if (m.name === pi.name) continue
    if (!roleGroups.has(m.role)) roleGroups.set(m.role, [])
    roleGroups.get(m.role).push(m.name)
  }
  const currentHtml = [...roleGroups]
    .map(([role, names]) => row(esc(names.length > 1 ? `${role}s` : role), esc(names.join(', '))))
    .join('')
  const alumni = team.alumni
    .map((a) => {
      const i = a.period.lastIndexOf(',')
      const years = i === -1 ? '' : a.period.slice(i + 1).trim()
      const role = i === -1 ? a.period : a.period.slice(0, i).trim()
      const [start = 0, end = start] = (years.match(/\d{4}/g) || []).map(Number)
      return { ...a, role, years, start, end }
    })
    .sort((a, b) => b.end - a.end || b.start - a.start)
  const alumniHtml = alumni
    .map((a) =>
      row(
        esc(a.years),
        `${esc(a.name)}, ${esc(a.role)}` + (a.current ? ` <span class="muted">(now ${esc(a.current)})</span>` : ''),
      ),
    )
    .join('')
  const groupHtml =
    `<h3>Current members</h3>${currentHtml}` + (alumniHtml ? `<h3>Former members</h3>${alumniHtml}` : '')

  const body = [
    masthead,
    section('Appointments', appointments.map(experienceRow).join('')),
    section('Education', education.map(experienceRow).join('')),
    section('Awards & Honors', datedRows(cv.awards)),
    section('Editorial Activities', datedRows(cv.editorial)),
    section('Publications', publicationsHtml),
    section('Selected Invited Talks', talksHtml),
    section('Ad Hoc Reviewer', reviewerHtml),
    section('Research Group', groupHtml),
  ].join('\n')

  const footer = `${pi.name} \u00b7 Curriculum Vitae \u00b7 Updated ${updatedLabel}`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(pi.name)}: Curriculum Vitae</title>
<meta name="author" content="${esc(pi.name)}">
<meta name="description" content="Curriculum vitae of ${esc(pi.name)}, ${esc(pi.jobTitle)} at ${esc(org.parent.name)}.">
<style>
${fontFaceCss()}
  :root {
    --text: #1C1E22;
    --muted: #595F69;
    --navy: #2E3A5C;
    --sage: #4F6E4F;
    --rule: #D3CFC6;
  }
  @page {
    size: A4;
    margin: 17mm 18mm 18mm;
    @bottom-left {
      content: ${cssString(footer)};
      font: 7.5pt Karla, "Helvetica Neue", Arial, sans-serif;
      color: #6B7079;
    }
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font: 7.5pt Karla, "Helvetica Neue", Arial, sans-serif;
      color: #6B7079;
    }
  }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    font-family: Karla, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.2pt;
    line-height: 1.42;
    color: var(--text);
    background: #fff;
    font-variant-numeric: lining-nums;
  }
  a { color: inherit; text-decoration: none; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  .muted { color: var(--muted); }

  .masthead { padding-bottom: 4mm; border-bottom: 1pt solid var(--navy); margin-bottom: 1mm; }
  .kicker {
    margin: 0 0 1mm;
    font-size: 7.5pt; font-weight: 500;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--sage);
  }
  h1 {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-weight: 600; font-size: 29pt; line-height: 1.05;
    color: var(--navy);
  }
  .position { margin: 1.2mm 0 2.5mm; font-size: 11pt; font-weight: 500; }
  .contact { margin: 0.6mm 0 0; font-size: 8.4pt; color: var(--muted); }
  .contact span + span::before { content: "\\00b7"; margin: 0 0.6em; color: #A3A7AE; }
  .contact a { color: var(--navy); }

  h2 {
    margin: 5.5mm 0 2.2mm;
    padding-bottom: 1mm;
    border-bottom: 0.5pt solid var(--rule);
    font-family: "Cormorant Garamond", Georgia, serif;
    font-weight: 600; font-size: 14.5pt; line-height: 1.2;
    color: var(--navy);
    break-after: avoid;
  }
  h3 {
    margin: 3.2mm 0 1.4mm 35mm;
    font-size: 7.6pt; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--sage);
    break-after: avoid;
  }
  h2 + h3, .lede + h3 { margin-top: 1.4mm; }
  h3 .count { font-weight: 400; letter-spacing: 0.04em; color: var(--muted); }
  .lede { margin: 0 0 0 35mm; font-size: 8pt; color: var(--muted); }

  .row {
    display: grid;
    grid-template-columns: 31mm 1fr;
    column-gap: 4mm;
    margin-bottom: 1.25mm;
    break-inside: avoid;
  }
  .row.pub { margin-bottom: 1.8mm; }
  .when { color: var(--muted); font-size: 8.6pt; padding-top: 0.25pt; font-variant-numeric: tabular-nums; }
  .sub { margin-top: 0.3mm; font-size: 8.2pt; color: var(--muted); }
  .sub a { color: var(--muted); }
</style>
</head>
<body>
${body}
</body>
</html>
`
}
