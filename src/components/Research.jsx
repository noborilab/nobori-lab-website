import { motion } from 'framer-motion'
import { researchAreas } from '../data/research'

const colorMap = {
  sage: 'text-sage',
  navy: 'text-navy',
  coral: 'text-coral',
}

export default function Research() {
  return (
    <section id="research" className="py-24 bg-bg px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40">
            Research Focus
          </p>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-[45px] md:text-[62px] md:leading-[1.15] font-semibold text-navy"
        >
          Understanding cell dialogue in the holobiont
        </motion.h2>

        {/* Intro paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-[19px] text-text/60 leading-relaxed max-w-3xl"
        >
          Our lab investigates how plant and microbial cells communicate at the
          molecular level. By integrating single-cell genomics, spatial
          transcriptomics, and precision engineering approaches, we aim to
          decode the cellular interactions that shape plant immunity and
          holobiont function.
        </motion.p>

        {/* Research themes */}
        <div className="mt-14">
          {researchAreas.map((area, i) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group border-t border-border last:border-b py-8 flex gap-6 md:gap-10 items-start cursor-default hover:translate-x-[5px] transition-transform duration-300"
            >
              <span
                className={`font-display text-4xl italic ${colorMap[area.color]} shrink-0 w-10`}
              >
                {area.number}
              </span>
              <div>
                <h3 className="font-display text-3xl font-semibold text-navy">
                  {area.title}
                </h3>
                <p className="mt-2 text-[19px] text-text/60 leading-relaxed">
                  {area.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
