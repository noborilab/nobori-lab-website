import { motion } from 'framer-motion'

const links = [
  { label: 'TSL Group Page', href: 'https://www.tsl.ac.uk/our-work/scientific-groups/tatsuya-nobori-group' },
  { label: 'The Scientist Profile', href: 'https://www.the-scientist.com/living-maps-uncovering-the-spatial-biology-of-plants-73690' },
  { label: 'Bluesky @tatsuyanobori', href: 'https://bsky.app/profile/tatsuyanobori.bsky.social' },
  { label: 'X / Twitter @nobolly', href: 'https://twitter.com/nobolly' },
  { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=35_IIHgAAAAJ&hl=en' },
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
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40">
            Contact
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-14">
          {/* Left — contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-display text-4xl md:text-[45px] font-semibold text-navy mb-8">
              Get in touch
            </h2>

            <div className="space-y-5 text-[18px] text-text/60">
              <div>
                <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/35 block mb-1">
                  Email
                </span>
                <a
                  href="mailto:Tatsuya.Nobori@tsl.ac.uk"
                  className="hover:text-navy transition-colors"
                >
                  Tatsuya.Nobori@tsl.ac.uk
                </a>
              </div>
              <div>
                <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/35 block mb-1">
                  Address
                </span>
                <p>
                  Norwich Research Park
                  <br />
                  Norwich NR4 7UH, United Kingdom
                </p>
              </div>
              <div>
                <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/35 block mb-1">
                  Phone
                </span>
                <p>(+44) 01603 450504</p>
              </div>
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
                  <span className="text-[19px] text-text/70 group-hover:text-navy transition-colors">
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
