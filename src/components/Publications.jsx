import { motion } from 'framer-motion'
import { publications } from '../data/publications'

export default function Publications() {
  const featured = publications.filter((p) => p.featured)
  const others = publications.filter((p) => !p.featured)

  return (
    <section id="publications" className="py-24 bg-bg px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            Our Papers
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Publications
          </h2>
        </motion.div>

        {/* Featured cards */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {featured.map((pub, i) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-bg-soft rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Figure placeholder */}
              {pub.figure ? (
                <img
                  src={pub.figure}
                  alt={pub.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-border/30 flex items-center justify-center">
                  <span className="font-mono text-xs text-text/30 uppercase">
                    Figure
                  </span>
                </div>
              )}
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-coral">
                  {pub.journal} &middot; {pub.year}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-navy leading-snug">
                  {pub.title}
                </h3>
                <p className="mt-2 text-sm text-text/50">
                  {pub.authors.join(', ')}
                </p>
                <p className="mt-3 text-sm text-text/60 leading-relaxed">
                  {pub.abstract}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other publications */}
        {others.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-text/40">
              All Publications
            </h3>
            {others.map((pub) => (
              <div
                key={pub.id}
                className="py-4 border-b border-border last:border-0"
              >
                <p className="font-display text-lg text-navy font-medium">
                  {pub.title}
                </p>
                <p className="mt-1 text-sm text-text/50">
                  {pub.authors.join(', ')} &middot;{' '}
                  <span className="italic">{pub.journal}</span> ({pub.year})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
