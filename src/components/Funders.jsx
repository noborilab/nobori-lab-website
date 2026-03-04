import { motion } from 'framer-motion'
import TypewriterLabel from './TypewriterLabel'

const funders = [
  { name: 'UKRI', logo: '/images/funders/UKRI_logo.webp', href: 'https://www.ukri.org/' },
  { name: 'BBSRC', logo: '/images/funders/bbsrc-logo.png', href: 'https://www.ukri.org/councils/bbsrc/' },
  { name: 'Gatsby Foundation', logo: '/images/funders/GATSBY_Logo_RGB-1_Jessica-Roberts.jpg', href: 'https://www.gatsby.org.uk/' },
]

export default function Funders() {
  return (
    <section className="py-16 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <TypewriterLabel text="Supported By" className="mb-10" />

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
              <img
                src={import.meta.env.BASE_URL + funder.logo.replace(/^\//, '')}
                alt={funder.name}
                loading="lazy"
                className="h-[50px] w-auto object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
