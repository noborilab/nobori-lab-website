import { motion } from 'framer-motion'
import { newsItems } from '../data/news'

const tagColors = {
  coral: 'bg-coral/10 text-coral',
  sage: 'bg-sage/10 text-sage',
  navy: 'bg-navy/10 text-navy',
}

export default function News() {
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
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Lab News
          </p>
        </motion.div>

        {/* Auto-fit grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {newsItems.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-bg rounded-lg border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300"
            >
              {/* Tag + date */}
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${tagColors[item.color]}`}
                >
                  {item.tag}
                </span>
                <span className="font-mono text-[11px] text-text/35">
                  {item.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-[19px] font-semibold text-navy leading-snug">
                {item.title}
              </h3>

              {/* Body */}
              <p className="mt-2 text-[13.5px] text-text/55 leading-relaxed">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
