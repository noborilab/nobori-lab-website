import { motion } from 'framer-motion'
import { resourcesByType } from '../data/resources'

// "Tools & data": every openly shared dataset, protocol, code repository and
// poster in one place. Rendered at the foot of the Contributions section.
export default function Resources() {
  if (!resourcesByType.length) return null

  return (
    <motion.div
      id="resources"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="mt-16 scroll-mt-24 rounded-xl border border-border bg-bg p-6 md:p-8"
    >
      <h3 className="font-display text-[28px] font-semibold text-navy leading-snug">
        Tools &amp; data
      </h3>
      <p className="mt-1 text-[16px] text-text/60">
        Everything we share openly, in one place.
      </p>

      <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {resourcesByType.map((group) => (
          <div key={group.type}>
            <dt className="font-mono text-[12px] uppercase tracking-[0.15em] text-sage">
              {group.type}
            </dt>
            <dd className="mt-2">
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group text-[16px] leading-snug text-navy hover:text-sage transition-colors"
                    >
                      <span>{item.name}</span>{' '}
                      <span className="ml-1 font-mono text-[12px] tracking-[0.04em] text-text/45 group-hover:text-sage transition-colors">
                        {item.label} &rarr;
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  )
}
