import { motion } from 'framer-motion'
import { newsItems } from '../data/news'

export default function News() {
  return (
    <section id="news" className="py-24 bg-bg-soft px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            Latest Updates
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            News
          </h2>
        </motion.div>

        <div className="mt-12 space-y-6">
          {newsItems.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-bg rounded-2xl p-6 border border-border flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="shrink-0 flex flex-col items-start gap-2">
                <time className="font-mono text-xs text-text/40">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <span className="font-mono text-[10px] uppercase tracking-widest bg-sage/10 text-sage px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-navy">
                  {item.title}
                </h3>
                <p className="mt-1 text-text/60 text-sm">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
