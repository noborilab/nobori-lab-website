import { motion } from 'framer-motion'
import { researchAreas } from '../data/research'

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15 },
  }),
}

export default function Research() {
  return (
    <section id="research" className="py-24 bg-bg-soft px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            What We Study
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Research
          </h2>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {researchAreas.map((area, i) => (
            <motion.div
              key={area.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="bg-bg rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow"
            >
              <span className="text-4xl">{area.icon}</span>
              <h3 className="mt-4 font-display text-2xl font-semibold text-navy">
                {area.title}
              </h3>
              <p className="mt-3 text-text/60 leading-relaxed">
                {area.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
