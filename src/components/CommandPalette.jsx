import { useState, useEffect, useMemo, useRef } from 'react'
import { navLinks } from '../data/nav'
import { selected, originalArticles, reviews } from '../data/publications'
import { teamMembers } from '../data/team'
import { projects } from '../data/projects'
import { topics, topicForProject } from '../data/topics'
import { resources } from '../data/resources'
import { useCellField, setCellField } from '../hooks/useCellField'

// Quick search over sections, publications, research areas and people.
// Opens with ⌘K / Ctrl+K, "/" or the search button in the navbar
// (which dispatches the `open-command-palette` window event).

const MAX_RESULTS = 8

function buildIndex() {
  const items = navLinks.map((l) => ({
    kind: 'Section',
    title: l.label,
    detail: '',
    target: l.href.slice(1),
  }))

  items.push({ kind: 'Section', title: 'Tools & data', detail: '', target: 'resources' })

  for (const t of topics) {
    items.push({ kind: 'Page', title: t.title, detail: `${t.kind} · papers, resources`, page: t.path })
  }

  for (const p of projects) {
    // Topics with their own page are listed above
    if (topicForProject(p.id)) continue
    items.push({ kind: 'Research', title: p.title, detail: '', target: 'projects' })
  }

  for (const r of resources) {
    items.push({ kind: r.type, title: `${r.name}: ${r.label}`, detail: '', url: r.href })
  }

  const seen = new Set()
  for (const p of [...selected, ...originalArticles, ...reviews]) {
    if (seen.has(p.title)) continue
    seen.add(p.title)
    items.push({
      kind: 'Paper',
      title: p.title,
      detail: [p.journal, p.year].filter(Boolean).join(' · '),
      extra: p.authors,
      url: p.link,
      target: 'publications',
    })
  }

  for (const m of teamMembers) {
    items.push({ kind: 'Person', title: m.name, detail: m.role, target: 'team' })
  }

  return items.map((item) => ({
    ...item,
    haystack: [item.title, item.detail, item.extra, item.kind].join(' ').toLowerCase(),
  }))
}

const index = buildIndex()
const paperCount = index.filter((i) => i.kind === 'Paper').length

// Hidden option: listed (last) only when searched for, e.g. "cells" or "animation".
const CELL_FIELD_WORDS = 'hero cells animation effect background'
const matchesCellField = (tokens) => tokens.every((t) => t.length >= 4 && CELL_FIELD_WORDS.includes(t))

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const returnFocus = useRef(null)
  const cellField = useCellField()

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!tokens.length) return index.filter((i) => i.kind === 'Section')
    const matches = index.filter((i) => tokens.every((t) => i.haystack.includes(t)))
    if (!matchesCellField(tokens)) return matches.slice(0, MAX_RESULTS)
    return [
      ...matches.slice(0, MAX_RESULTS - 1),
      {
        kind: 'Option',
        title: cellField ? 'Turn off the hero cell animation' : 'Turn on the hero cell animation',
        detail: 'Remembered in this browser',
        action: 'cell-field',
      },
    ]
  }, [query, cellField])

  // Global shortcuts and the navbar button
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement
      setQuery('')
      setActive(0)
      setOpen(true)
    }
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        show()
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', show)
    }
  }, [])

  // Focus the field and hold the page still while open
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  if (!open) return null

  const close = () => {
    setOpen(false)
    returnFocus.current?.focus?.()
  }

  const choose = (item) => {
    setOpen(false)
    if (item.action === 'cell-field') {
      setCellField(!cellField)
      // Show it straight away when turning it on
      if (!cellField) {
        requestAnimationFrame(() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      }
      return
    }
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      return
    }
    if (item.page) {
      window.location.assign(item.page)
      return
    }
    // Wait a frame so the scroll lock is released before scrolling.
    requestAnimationFrame(() => {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${item.target}`)
    })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      choose(results[active])
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-navy/25 backdrop-blur-[3px] px-4 pt-[12vh]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="palette-in w-full max-w-xl overflow-hidden rounded-xl border border-border bg-bg shadow-[0_24px_60px_-20px_rgba(46,58,92,0.45)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <svg className="h-4 w-4 shrink-0 text-text/40" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={results[active] ? `command-palette-option-${active}` : undefined}
            aria-label="Search papers, people and sections"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onKeyDown}
            placeholder={`Search ${paperCount} papers, people, sections`}
            className="h-14 w-full bg-transparent text-[18px] text-text placeholder:text-text/35 outline-none"
          />
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text/45 hover:text-navy hover:border-navy/40 transition-colors"
          >
            Esc
          </button>
        </div>

        <ul
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label="Results"
          className="max-h-[min(52vh,420px)] overflow-y-auto p-2"
        >
          {results.map((item, i) => (
            <li
              key={`${item.kind}-${item.title}-${item.url ?? ''}`}
              id={`command-palette-option-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(item)}
              className={`flex cursor-pointer items-baseline gap-3 rounded-lg px-3 py-2.5 ${
                i === active ? 'bg-bg-soft' : ''
              }`}
            >
              <span className="w-[4.5rem] shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-sage">
                {item.kind}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] leading-snug text-navy">{item.title}</span>
                {item.detail && (
                  <span className="mt-0.5 block font-mono text-[12px] tracking-[0.04em] text-text/45">
                    {item.detail}
                  </span>
                )}
              </span>
              {item.url && (
                <span className="shrink-0 font-mono text-[12px] text-text/35" aria-hidden="true">&#8599;</span>
              )}
            </li>
          ))}
          {!results.length && (
            <li className="px-3 py-6 text-center text-[15px] text-text/50">
              Nothing matches &ldquo;{query}&rdquo;. Try an author, a journal or a year.
            </li>
          )}
        </ul>

        <div className="hidden sm:flex items-center gap-4 border-t border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text/40">
          <span>&uarr;&darr; move</span>
          <span>&crarr; open</span>
          <span className="ml-auto">Papers and resources open in a new tab</span>
        </div>
      </div>
    </div>
  )
}
