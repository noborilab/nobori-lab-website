import { useState } from 'react'
import { motion } from 'framer-motion'
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

const VISIBLE_COUNT = 4

export default function News() {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? newsItems : newsItems.slice(0, VISIBLE_COUNT)
  const hasMore = newsItems.length > VISIBLE_COUNT

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

        {/* Desktop timeline */}
        <div className="hidden md:block relative">
          {visible.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
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
        </div>

        {/* Mobile layout: stacked, no line */}
        <div className="md:hidden space-y-6">
          {visible.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
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
        </div>

        {/* Show more / less */}
        {hasMore && (
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
