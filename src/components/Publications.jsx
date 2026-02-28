import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { publications, journalColors } from '../data/publications'

const gradients = {
  Nature: 'linear-gradient(135deg, #C85A3A 0%, #8B3A22 100%)',
  'Nature Plants': 'linear-gradient(135deg, #4A6E4A 0%, #2E4A2E 100%)',
}

export default function Publications() {
  const [view, setView] = useState('featured')
  const [expandedThread, setExpandedThread] = useState(null)

  const featured = publications.filter((p) => p.featured)
  const all = publications

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
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Selected work
          </h2>
          <div className="flex gap-6">
            {['featured', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`font-mono text-xs uppercase tracking-[0.15em] pb-1 transition-all ${
                  view === tab
                    ? 'text-navy border-b-2 border-navy'
                    : 'text-text/35 hover:text-text/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'featured' ? (
            <motion.div
              key="featured"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {featured.map((pub, i) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="bg-bg rounded-xl border border-border overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Figure — 4:3 */}
                  <div className="md:w-[280px] shrink-0">
                    {pub.figure ? (
                      <img
                        src={pub.figure}
                        alt={pub.title}
                        className="w-full aspect-[4/3] object-cover"
                      />
                    ) : (
                      <div
                        className="w-full aspect-[4/3]"
                        style={{
                          background:
                            gradients[pub.journal] ||
                            'linear-gradient(135deg, #2E3A5C 0%, #1C1E22 100%)',
                        }}
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 flex flex-col justify-center flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="font-display text-sm italic"
                        style={{
                          color:
                            journalColors[pub.journal] || '#2E3A5C',
                        }}
                      >
                        {pub.journal}
                      </span>
                      <span className="font-mono text-[11px] text-text/30">
                        {pub.year}
                      </span>
                    </div>

                    <h3 className="font-display text-[21px] font-semibold text-navy leading-snug">
                      {pub.title}
                    </h3>

                    <p className="mt-2 text-[13px] text-text/45">
                      {pub.authors}
                    </p>

                    {/* Chip buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {pub.doi && (
                        <a
                          href={pub.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-border text-text/50 hover:text-navy hover:border-navy transition-colors"
                        >
                          Paper
                        </a>
                      )}
                      {!pub.doi && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-border text-text/30">
                          Paper
                        </span>
                      )}
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-border text-text/30">
                        PDF
                      </span>
                      {pub.thread !== undefined && (
                        <button
                          onClick={() =>
                            setExpandedThread(
                              expandedThread === pub.id ? null : pub.id,
                            )
                          }
                          className={`font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-colors ${
                            expandedThread === pub.id
                              ? 'border-navy text-navy bg-navy/5'
                              : 'border-border text-text/50 hover:text-navy hover:border-navy'
                          }`}
                        >
                          &#x1D54F; Thread
                        </button>
                      )}
                    </div>

                    {/* Inline thread preview */}
                    <AnimatePresence>
                      {expandedThread === pub.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-4 bg-bg-soft rounded-lg border border-border">
                            <p className="font-mono text-[11px] text-text/40">
                              {pub.thread
                                ? 'Thread preview loading...'
                                : 'Thread link coming soon'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {all.map((pub, i) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="py-4 border-t border-border last:border-b flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6"
                >
                  <span className="font-mono text-[12px] text-text/30 shrink-0 w-10">
                    {pub.year}
                  </span>
                  <div className="flex-1">
                    <span className="font-display text-[17px] text-navy font-medium">
                      {pub.title}
                    </span>
                    <span className="text-[13px] text-text/40 ml-2">
                      {pub.authors}
                    </span>
                  </div>
                  <span
                    className="font-display text-[14px] italic shrink-0"
                    style={{
                      color: journalColors[pub.journal] || '#2E3A5C',
                    }}
                  >
                    {pub.journal}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Scholar link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a
            href="https://scholar.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-text/40 hover:text-navy transition-colors"
          >
            View all on Google Scholar &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  )
}
