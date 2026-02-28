import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  experience,
  editorial,
  awards,
  invitedTalksByYear,
  reviewerGrants,
  reviewerJournals,
} from '../data/cv'
import headshotUrl from '/images/team/tatsuya-nobori.jpg'

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between group"
      >
        <h3 className="font-display text-xl font-semibold text-navy">
          {title}
        </h3>
        <span className="text-text/30 group-hover:text-navy transition-colors text-lg">
          {open ? '\u2212' : '+'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function YearToggle({ year, talks, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 group"
      >
        <span className="font-display text-[15px] italic text-sage">
          {year}
        </span>
        <span className="text-text/25 group-hover:text-navy transition-colors text-sm">
          {open ? '\u2212' : '+'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="pt-2 pb-1 pl-4 space-y-1.5">
              {talks.map((talk, i) => (
                <li key={i} className="text-[13.5px] text-text/55 flex gap-2">
                  <span className="text-navy/40 mt-0.5 shrink-0">&#9656;</span>
                  {talk}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CV() {
  const talkYears = Object.keys(invitedTalksByYear).sort((a, b) =>
    String(b).localeCompare(String(a)),
  )

  return (
    <section id="cv" className="py-24 bg-bg px-6">
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
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Tatsuya Nobori
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          {/* Left — photo + identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="shrink-0 md:w-[200px]"
          >
            <img
              src={headshotUrl}
              alt="Tatsuya Nobori"
              className="w-40 h-40 rounded-full mx-auto md:mx-0 object-cover"
            />
            <div className="mt-5 text-center md:text-left">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Tatsuya Nobori
              </h2>
              <p className="mt-1 text-[14px] text-text/55 leading-snug">
                Group Leader,
                <br />
                The Sainsbury Laboratory
              </p>
              <div className="mt-4 space-y-1.5">
                <a
                  href="mailto:Tatsuya.Nobori@tsl.ac.uk"
                  className="block font-mono text-[11px] text-text/45 hover:text-navy transition-colors"
                >
                  Tatsuya.Nobori@tsl.ac.uk
                </a>
                <a
                  href="https://twitter.com/nobolly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-[11px] text-text/45 hover:text-navy transition-colors"
                >
                  Twitter @nobolly
                </a>
                <a
                  href="https://bsky.app/profile/tatsuyanobori.bsky.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-[11px] text-text/45 hover:text-navy transition-colors"
                >
                  Bluesky @tatsuyanobori
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right — CV content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 space-y-8"
          >
            {/* Education & Research Experience */}
            <CollapsibleSection title="Education & Research Experience">
              <div className="space-y-4">
                {experience.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-display text-[14px] italic text-sage shrink-0 w-[135px]">
                      {item.period}
                    </span>
                    <div>
                      <p className="text-[14px] text-text/70">
                        <span className="font-medium text-navy">
                          {item.institution}
                        </span>
                        {' \u2014 '}
                        {item.role}
                      </p>
                      {item.detail && (
                        <p className="text-[13px] text-text/40 mt-0.5">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Editorial Activities */}
            <CollapsibleSection title="Editorial Activities">
              <ul className="space-y-2">
                {editorial.map((item, i) => (
                  <li key={i} className="text-[14px] text-text/60 flex gap-2">
                    <span className="text-sage mt-0.5 shrink-0">&#9656;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* Awards & Honors */}
            <CollapsibleSection title="Awards & Honors">
              <ul className="space-y-2">
                {awards.map((item, i) => (
                  <li key={i} className="text-[14px] text-text/60 flex gap-2">
                    <span className="text-coral mt-0.5 shrink-0">&#9656;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* Selected Invited Talks — collapsed by default, year toggles */}
            <CollapsibleSection
              title="Selected Invited Talks"
              defaultOpen={false}
            >
              <div className="space-y-3">
                {talkYears.map((year) => (
                  <YearToggle
                    key={year}
                    year={year}
                    talks={invitedTalksByYear[year]}
                    defaultOpen={year === '2025' || year === '2026' || year === '2027'}
                  />
                ))}
              </div>
            </CollapsibleSection>

            {/* Ad Hoc Reviewer — compact inline */}
            <CollapsibleSection title="Ad Hoc Reviewer">
              <div className="space-y-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text/35">
                    Grants
                  </span>
                  <p className="mt-1 text-[13.5px] text-text/55 leading-relaxed">
                    {reviewerGrants.join(', ')}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text/35">
                    Journals
                  </span>
                  <p className="mt-1 text-[13.5px] text-text/55 leading-relaxed">
                    {reviewerJournals.join(', ')}
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
