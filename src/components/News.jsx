import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { newsItems } from '../data/news'

const dotColors = {
  coral: '#C85A3A',
  sage: '#6B8F6B',
  navy: '#2E3A5C',
}

const tagStyles = {
  coral: { background: 'rgba(200,90,58,0.07)', color: '#C85A3A' },
  sage: { background: 'rgba(107,143,107,0.07)', color: '#6B8F6B' },
  navy: { background: 'rgba(46,58,92,0.07)', color: '#2E3A5C' },
}

const tagColorMap = { Paper: 'coral', Press: 'navy', Lab: 'sage' }

const VISIBLE_COUNT = 5

// Extract unique years from dates (e.g. "Feb 2026" → "2026", "2024" → "2024")
const allYears = [...new Set(newsItems.map((n) => n.date.match(/\d{4}/)?.[0]).filter(Boolean))].sort((a, b) => b - a)

const tagOptions = ['All', 'Paper', 'Press', 'Lab']

export default function News() {
  const [expanded, setExpanded] = useState(false)
  const [activeTag, setActiveTag] = useState('All')
  const [activeYear, setActiveYear] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return newsItems.filter((item) => {
      if (activeTag !== 'All' && item.tag !== activeTag) return false
      if (activeYear !== 'All' && !item.date.includes(activeYear)) return false
      if (q && !item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [activeTag, activeYear, search])

  const isFiltered = activeTag !== 'All' || activeYear !== 'All' || search.trim() !== ''
  const showPagination = filtered.length > VISIBLE_COUNT
  const visible = !isFiltered && !expanded && showPagination ? filtered.slice(0, VISIBLE_COUNT) : filtered

  return (
    <section id="news" className="py-24 bg-bg px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-14"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40">
            Lab News
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          {/* Tag pills */}
          <div className="flex gap-2">
            {tagOptions.map((tag) => {
              const isActive = activeTag === tag
              const color = tag === 'All' ? '#2E3A5C' : dotColors[tagColorMap[tag]]
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="font-mono text-[13px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border transition-all duration-200"
                  style={
                    isActive
                      ? { backgroundColor: color, borderColor: color, color: '#fff' }
                      : { backgroundColor: 'transparent', borderColor: `${color}30`, color }
                  }
                >
                  {tag}
                </button>
              )
            })}
          </div>

          {/* Year filter */}
          <div className="flex gap-2 ml-1">
            {['All', ...allYears].map((yr) => {
              const isActive = activeYear === yr
              const label = yr === 'All' ? 'All Years' : yr
              return (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={`font-mono text-[13px] tracking-[0.1em] px-3 py-1 rounded-full border transition-all duration-200 ${
                    isActive
                      ? 'bg-navy text-white border-navy'
                      : 'bg-transparent text-text/40 border-border hover:text-navy hover:border-navy/30'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Search box */}
          <div className="relative ml-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news..."
              className="font-mono text-[13px] tracking-[0.05em] pl-9 pr-3 py-1.5 rounded-full border border-border bg-transparent text-text/70 placeholder:text-text/25 focus:outline-none focus:border-navy/30 transition-colors w-[180px]"
            />
          </div>
        </motion.div>

        {/* Result count when filtered */}
        {isFiltered && (
          <p className="font-mono text-[13px] text-text/30 mb-6">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </p>
        )}

        {/* No results */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="font-display text-[22px] italic text-text/30">
              No matching news
            </p>
          </motion.div>
        )}

        {/* Desktop timeline */}
        <div className="hidden md:block relative">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                layout
                className="relative flex items-start gap-10 pb-10 last:pb-0"
              >
                {/* Left column: date */}
                <div className="w-[100px] shrink-0 text-right pt-5">
                  <p className="font-display text-[17px] italic text-text/45">
                    {item.date}
                  </p>
                </div>

                {/* Center: dot + line */}
                <div className="relative flex flex-col items-center shrink-0">
                  <div className="pt-[22px]">
                    <div
                      className="w-3 h-3 rounded-full z-10 ring-4 ring-bg"
                      style={{ backgroundColor: dotColors[item.color] }}
                    />
                  </div>
                  {i < visible.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>

                {/* Right: card */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 bg-bg rounded-lg border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-navy/20 transition-all duration-300"
                >
                  <CardContent item={item} />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile layout: stacked, no line */}
        <div className="md:hidden space-y-6">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                layout
              >
                {/* Date with dot */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: dotColors[item.color] }}
                  />
                  <p className="font-display text-[16px] italic text-text/45">
                    {item.date}
                  </p>
                </div>
                {/* Card */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-bg rounded-lg border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-navy/20 transition-all duration-300"
                >
                  <CardContent item={item} />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more / less — only when not filtered */}
        {!isFiltered && showPagination && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="font-mono text-[14px] uppercase tracking-[0.15em] text-text/40 hover:text-navy transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function CardContent({ item }) {
  return (
    <>
      {/* Tag pill */}
      <span
        className="inline-block font-mono text-[13px] font-medium uppercase tracking-[0.15em] px-2.5 py-1 rounded-full mb-3"
        style={tagStyles[item.color]}
      >
        {item.tag}
      </span>

      {/* Title */}
      <h3 className="font-display text-[24px] font-semibold text-navy leading-snug group-hover:text-navy/80 transition-colors">
        {item.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-[17px] text-text/55 leading-relaxed">
        {item.description}
      </p>

      {/* Read link */}
      <p className="mt-3 font-mono text-[13px] uppercase tracking-[0.12em] text-text/30 group-hover:text-navy transition-colors">
        Read &rarr;
      </p>
    </>
  )
}
