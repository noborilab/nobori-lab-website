import { motion } from 'framer-motion'

const timeline = [
  { years: '2024\u2014', role: 'Group Leader, The Sainsbury Laboratory' },
  { years: '2019\u201324', role: 'HFSP Fellow, Salk Institute' },
  { years: '2015\u201319', role: 'Ph.D., MPI Plant Breeding Research' },
]

const links = [
  { label: 'TSL Group Page', href: 'https://www.tsl.ac.uk/' },
  { label: 'The Scientist Profile', href: 'https://www.the-scientist.com/' },
  { label: 'Bluesky @tatsuyanobori', href: 'https://bsky.app/' },
  { label: 'X / Twitter @nobolly', href: 'https://x.com/nobolly' },
  { label: 'Google Scholar', href: 'https://scholar.google.com/' },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-bg px-6">
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
            Contact
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-14">
          {/* Left — heading + timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy mb-8">
              Get in touch
            </h2>

            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4 items-baseline">
                  <span className="font-display text-[15px] italic text-sage shrink-0 w-20">
                    {item.years}
                  </span>
                  <span className="text-[14px] text-text/60">
                    {item.role}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-0">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-3.5 border-t border-border last:border-b hover:translate-x-1 transition-transform duration-200"
                >
                  <span className="text-[15px] text-text/70 group-hover:text-navy transition-colors">
                    {link.label}
                  </span>
                  <span className="text-text/25 group-hover:text-navy transition-colors">
                    &rarr;
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
