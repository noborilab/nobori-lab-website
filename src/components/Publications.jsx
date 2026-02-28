import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  selected,
  originalArticles,
  reviews,
  journalColors,
} from '../data/publications'

const tabs = [
  { key: 'selected', label: 'Selected' },
  { key: 'original', label: 'Original Articles' },
  { key: 'reviews', label: 'Reviews & Commentaries' },
]

function LinkChip({ href, children }) {
  if (!href) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border border-border text-text/25">
        {children}
      </span>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border border-border text-text/50 hover:text-navy hover:border-navy transition-colors"
    >
      {children}
    </a>
  )
}

function JournalName({ journal, journalNote }) {
  return (
    <span>
      <span
        className="font-display text-[14px] italic"
        style={{ color: journalColors[journal] || '#666' }}
      >
        {journal}
      </span>
      {journalNote && (
        <span className="text-[12px] text-text/35 ml-1">{journalNote}</span>
      )}
    </span>
  )
}

function SelectedCard({ pub, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`bg-bg rounded-xl border border-border overflow-hidden ${pub.figure ? 'flex flex-col md:flex-row' : 'p-5'}`}
    >
      {/* Optional figure */}
      {pub.figure && (
        <div className="md:w-[200px] shrink-0 bg-bg-soft relative">
          <img
            src={import.meta.env.BASE_URL + pub.figure.replace(/^\//, '')}
            alt={pub.title}
            className="w-full h-full object-cover"
          />
          {pub.figureCredit && (
            <p className="absolute bottom-1 right-2 text-[9px] text-white/60 italic">
              {pub.figureCredit}
            </p>
          )}
        </div>
      )}

      <div className={pub.figure ? 'p-5 flex-1' : ''}>
        <div className="flex items-center gap-2 mb-2">
        <JournalName journal={pub.journal} journalNote={pub.journalNote} />
        <span className="font-mono text-[11px] text-text/30">{pub.year}</span>
      </div>

      <h3 className="font-display text-[19px] font-semibold text-navy leading-snug">
        {pub.title}
      </h3>

      <p className="mt-1.5 text-[13px] text-text/45">{pub.authors}</p>

      {/* Link chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <LinkChip href={pub.link}>Link</LinkChip>
        <LinkChip href={pub.pdf}>PDF</LinkChip>
        {pub.biorxiv && <LinkChip href={pub.biorxiv}>bioRxiv</LinkChip>}
      </div>

      {/* Highlights / media */}
      {pub.highlights && pub.highlights.length > 0 && (
        <div className="mt-3 pl-3 border-l-2 border-border space-y-1">
          {pub.highlights.map((h, i) =>
            h.href ? (
              <a
                key={i}
                href={h.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[12px] text-text/40 hover:text-navy transition-colors"
              >
                {h.text}
              </a>
            ) : (
              <p key={i} className="text-[12px] text-text/40">
                {h.text}
              </p>
            ),
          )}
        </div>
      )}
      </div>
    </motion.div>
  )
}

function CompactRow({ pub, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="py-3.5 border-t border-border first:border-t-0"
    >
      <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
        <span className="font-mono text-[12px] text-text/28 shrink-0 w-9">
          {pub.year}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-display text-[16px] text-navy font-medium leading-snug">
            {pub.title}
          </span>
        </div>
        <JournalName journal={pub.journal} journalNote={pub.journalNote} />
      </div>
      <div className="md:pl-[52px] mt-1 flex items-center gap-3">
        <span className="text-[12px] text-text/35 truncate">{pub.authors}</span>
        {pub.link && (
          <a
            href={pub.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-text/35 hover:text-navy transition-colors shrink-0"
          >
            Link &rarr;
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function Publications() {
  const [activeTab, setActiveTab] = useState('selected')

  const dataMap = {
    selected,
    original: originalArticles,
    reviews,
  }

  const items = dataMap[activeTab]

  return (
    <section id="publications" className="py-24 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Publications
          </p>
        </motion.div>

        {/* Heading + tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Publications
          </h2>
          <div className="flex gap-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`font-mono text-[11px] uppercase tracking-[0.12em] pb-1 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-navy border-b-2 border-navy'
                    : 'text-text/30 hover:text-text/55'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'selected' ? (
              <div className="space-y-5">
                {items.map((pub, i) => (
                  <SelectedCard key={pub.id} pub={pub} index={i} />
                ))}
              </div>
            ) : (
              <div>
                {items.map((pub, i) => (
                  <CompactRow key={pub.id} pub={pub} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a
            href="https://scholar.google.com/citations?user=35_IIHgAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-text/40 hover:text-navy transition-colors"
          >
            Google Scholar &rarr;
          </a>
          <span className="hidden sm:inline text-text/15">|</span>
          <a
            href="https://plantae.org/?s=tatsuya+nobori+-Weekly+-Webinar"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-text/40 hover:text-navy transition-colors"
          >
            Plant Science Research Weekly &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  )
}
