import { motion } from 'framer-motion'
import TypewriterLabel from './TypewriterLabel'

export default function Mission() {
  return (
    <section id="mission" className="bg-bg py-20 px-6">
      {/* Mono kicker — matches the section-label rhythm used everywhere else,
          while Mission keeps its distinct centered treatment as the thesis. */}
      <div className="flex justify-center mb-6">
        <TypewriterLabel text="Our Question" />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="font-display italic text-navy text-center mx-auto"
        style={{ maxWidth: 700, fontSize: '1.3em', lineHeight: 1.65 }}
      >
        Cells continuously integrate ever-changing signals from developmental,
        environmental, and inter-organismal sources. How do they translate this
        information into state transitions that propagate across multicellular
        networks to shape organismal phenotype? We address this by developing
        technologies and conceptual frameworks to measure, manipulate, and
        predict cell behaviour, and by sharing these advances openly to
        accelerate discovery.
      </motion.p>
    </section>
  )
}
