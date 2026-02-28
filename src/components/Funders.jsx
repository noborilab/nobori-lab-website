import { motion } from 'framer-motion'

const funders = [
  { name: 'HFSP', href: 'https://www.hfsp.org/' },
  { name: 'BBSRC', href: 'https://www.ukri.org/councils/bbsrc/' },
  { name: 'Gatsby Foundation', href: 'https://www.gatsby.org.uk/' },
  { name: 'TSL', href: 'https://www.tsl.ac.uk/' },
]

export default function Funders() {
  return (
    <section className="py-16 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Supported By
          </p>
        </motion.div>

        {/* Funder logos / placeholders */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-10 md:gap-14"
        >
          {funders.map((funder) => (
            <a
              key={funder.name}
              href={funder.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              {/* Placeholder box — replace with <img> when logos are available */}
              <div className="h-[50px] px-6 flex items-center justify-center rounded-lg border border-border bg-bg grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                <span className="font-mono text-[12px] uppercase tracking-[0.15em] text-text/60 group-hover:text-navy transition-colors">
                  {funder.name}
                </span>
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
