import { motion } from 'framer-motion'
import TypewriterLabel from './TypewriterLabel'

const statement =
  'Cells continuously integrate ever-changing signals from developmental, ' +
  'environmental, and inter-organismal sources. How do they translate this ' +
  'information into state transitions that propagate across multicellular ' +
  'networks to shape organismal phenotype? We address this by developing ' +
  'technologies and conceptual frameworks to measure, manipulate, and ' +
  'predict cell behaviour, and by sharing these advances openly to ' +
  'accelerate discovery.'

const words = statement.split(' ')

// Scroll range (% of the paragraph's pass through the viewport) over which the
// words ink in, first to last. Used by .ink-scroll in index.css.
const INK_FROM = 12
const INK_SPAN = 37
const INK_WORD = 8

export default function Mission() {
  return (
    <section id="mission" className="bg-bg py-20 px-6">
      {/* Mono kicker — matches the section-label rhythm used everywhere else,
          while Mission keeps its distinct centered treatment as the thesis. */}
      <div className="flex justify-center mb-6">
        <TypewriterLabel text="Our Question" />
      </div>
      {/* Where scroll-driven animations are supported the words darken one by
          one as the paragraph scrolls past; elsewhere it is plain text. */}
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="ink-scroll font-display italic text-navy text-center mx-auto"
        style={{ maxWidth: 700, fontSize: '1.3em', lineHeight: 1.65 }}
      >
        {words.map((word, i) => {
          const start = INK_FROM + (INK_SPAN * i) / (words.length - 1)
          return (
            <span
              key={i}
              className="ink-word"
              style={{ '--ink-start': `${start.toFixed(1)}%`, '--ink-end': `${(start + INK_WORD).toFixed(1)}%` }}
            >
              {word}{i < words.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </motion.p>
    </section>
  )
}
