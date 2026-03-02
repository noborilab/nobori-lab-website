import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  selected,
  originalArticles,
  reviews,
  journalColors,
} from '../data/publications'
import TypewriterLabel from './TypewriterLabel'

let twitterLoaded = false
function loadTwitterWidgets() {
  if (twitterLoaded) return Promise.resolve()
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.onload = () => {
      twitterLoaded = true
      resolve()
    }
    document.head.appendChild(script)
  })
}

const tabs = [
  { key: 'selected', label: 'Selected' },
  { key: 'original', label: 'Original Articles' },
  { key: 'reviews', label: 'Reviews & Commentaries' },
]

function LinkChip({ href, children }) {
  if (!href) {
    return (
      <span className="font-mono text-[13px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border border-border text-text/25">
        {children}
      </span>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[13px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border border-border text-text/50 hover:text-navy hover:border-navy transition-colors"
    >
      {children}
    </a>
  )
}

function JournalName({ journal, journalNote }) {
  return (
    <span>
      <span
        className="font-display text-[18px] italic"
        style={{ color: journalColors[journal] || '#666' }}
      >
        {journal}
      </span>
      {journalNote && (
        <span className="text-[15px] text-text/35 ml-1">{journalNote}</span>
      )}
    </span>
  )
}

function TweetEmbed({ url }) {
  const containerRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | loaded | failed

  useEffect(() => {
    let cancelled = false
    const el = containerRef.current
    if (!el) return

    const timeout = setTimeout(() => {
      if (!cancelled) setStatus('failed')
    }, 8000)

    loadTwitterWidgets()
      .then(() => {
        if (cancelled || !window.twttr || !containerRef.current) return
        const tweetId = url.split('/').pop().split('?')[0]
        return window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          conversation: 'none',
          width: 550,
        })
      })
      .then((embedEl) => {
        if (cancelled) return
        clearTimeout(timeout)
        setStatus(embedEl ? 'loaded' : 'failed')
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeout)
          setStatus('failed')
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [url])

  return (
    <div className="max-w-[550px]">
      {status === 'loading' && (
        <div className="flex items-center gap-3 py-6">
          <div
            className="w-5 h-5 border-2 border-text/15 border-t-navy/50 rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          <span className="text-[14px] text-text/30">Loading tweet...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div ref={containerRef} style={{ display: status === 'loaded' ? 'block' : 'none' }} />
      {status === 'failed' && (
        <div className="py-4">
          <p className="text-[14px] text-text/35">
            Could not load tweet.{' '}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy hover:underline"
            >
              View on X &rarr;
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

function SelectedCard({ pub, index }) {
  const [showThread, setShowThread] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-bg rounded-xl border border-border overflow-hidden"
    >
      {/* Top row: image + info side by side */}
      <div className="flex flex-col md:flex-row md:items-start">
        {/* Thumbnail — uniform square */}
        <div className="shrink-0 w-[160px] h-[160px] relative m-4 rounded-lg overflow-hidden hidden md:block">
          {pub.figure ? (
            <>
              <img
                src={import.meta.env.BASE_URL + pub.figure.replace(/^\//, '')}
                alt={pub.title}
                className="w-full h-full object-cover"
              />
              {pub.figureCredit && (
                <p className="absolute bottom-1 right-2 text-[11px] text-white/60 italic">
                  {pub.figureCredit}
                </p>
              )}
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center px-4"
              style={{ background: `${journalColors[pub.journal] || '#666'}12` }}
            >
              <span
                className="font-display text-[16px] italic text-center leading-snug"
                style={{ color: journalColors[pub.journal] || '#666' }}
              >
                {pub.journal}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <JournalName journal={pub.journal} journalNote={pub.journalNote} />
            <span className="font-mono text-[14px] text-text/30">{pub.year}</span>
          </div>

          <h3 className="font-display text-[24px] font-semibold text-navy leading-snug">
            {pub.title}
          </h3>

          <p className="mt-1.5 text-[16px] text-text/45">{pub.authors}</p>

          {/* Link chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            <LinkChip href={pub.link}>Link</LinkChip>
            <LinkChip href={pub.pdf}>PDF</LinkChip>
            {pub.biorxiv && <LinkChip href={pub.biorxiv}>bioRxiv</LinkChip>}
            {/* Desktop: Thread pill link */}
            {pub.threadUrl && <LinkChip href={pub.threadUrl}><span className="hidden md:inline">Thread</span></LinkChip>}
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
                    className="block text-[15px] text-text/40 hover:text-navy transition-colors"
                  >
                    {h.text}
                  </a>
                ) : (
                  <p key={i} className="text-[15px] text-text/40">
                    {h.text}
                  </p>
                ),
              )}
            </div>
          )}

          {/* Mobile: Tweet thread toggle button */}
          {pub.threadUrl && (
            <div className="mt-4 md:hidden">
              <button
                onClick={() => setShowThread(!showThread)}
                className={`font-mono uppercase tracking-[0.1em] hover:text-navy transition-colors ${showThread ? 'text-[12px] text-text/25' : 'text-[13px] text-text/35'}`}
              >
                {showThread ? 'Hide thread \u25B4' : 'View thread \u25BE'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Tweet embed — full width below both image and info */}
      {pub.threadUrl && (
        <AnimatePresence>
          {showThread && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden md:hidden"
            >
              <div className="border-t border-border px-5 pt-4 pb-5 flex justify-center">
                <div className="max-w-[550px] w-full rounded-xl p-6" style={{ backgroundColor: '#F8F8F4' }}>
                  <TweetEmbed url={pub.threadUrl} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
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
        <span className="font-mono text-[15px] text-text/28 shrink-0 w-9">
          {pub.year}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-display text-[20px] text-navy font-medium leading-snug">
            {pub.title}
          </span>
        </div>
        <JournalName journal={pub.journal} journalNote={pub.journalNote} />
      </div>
      <div className="md:pl-[52px] mt-1 flex items-center gap-3">
        <span className="text-[15px] text-text/35 truncate">{pub.authors}</span>
        {pub.link && (
          <a
            href={pub.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[13px] uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full border border-border text-text/45 hover:text-navy hover:border-navy transition-colors shrink-0"
          >
            Link
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"/></svg>
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
        <TypewriterLabel text="Publications" className="mb-10" />

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-5 mb-10"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-mono text-[14px] uppercase tracking-[0.12em] pb-1 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-navy border-b-2 border-navy'
                  : 'text-text/30 hover:text-text/55'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://scholar.google.com/citations?user=35_IIHgAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border text-navy font-mono text-[16px] tracking-[0.08em] hover:bg-navy/5 hover:border-navy/30 transition-all"
          >
            <svg className="w-4 h-4 text-navy/60 group-hover:text-navy transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
            Google Scholar
            <span className="text-navy/40 group-hover:text-navy transition-colors">&rarr;</span>
          </a>
          <a
            href="https://plantae.org/?s=tatsuya+nobori+-Weekly+-Webinar"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border text-navy font-mono text-[16px] tracking-[0.08em] hover:bg-navy/5 hover:border-navy/30 transition-all"
          >
            <svg className="w-4 h-4 text-navy/60 group-hover:text-navy transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Plant Science Research Weekly
            <span className="text-navy/40 group-hover:text-navy transition-colors">&rarr;</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
