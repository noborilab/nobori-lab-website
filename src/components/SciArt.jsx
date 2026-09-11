import { motion } from 'framer-motion'
import { sciArtItems } from '../data/sciart'
import TypewriterLabel from './TypewriterLabel'

const asset = (src) => import.meta.env.BASE_URL + src.replace(/^\//, '')

function DownloadPill({ item, file }) {
  return (
    <a
      href={asset(file.src)}
      download={file.filename}
      aria-label={`Download ${item.title} as ${file.format.toUpperCase()}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.1em] text-text/50 hover:text-navy hover:border-navy/40 hover:bg-navy/5 transition-colors"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      {file.format}
    </a>
  )
}

function ArtCard({ item, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
      className="flex flex-col rounded-xl border border-border bg-bg overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-shadow duration-300"
    >
      <a
        href={asset(item.preview)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${item.title} at full size`}
        className="group relative block aspect-[4/3] bg-bg-soft overflow-hidden"
      >
        <img
          src={asset(item.preview)}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-5 group-hover:scale-[1.03] transition-transform duration-300"
        />
        <span className="absolute bottom-2 right-3 font-mono text-[11px] uppercase tracking-[0.1em] text-text/30 opacity-0 group-hover:opacity-100 transition-opacity">
          View full size
        </span>
      </a>
      <div className="flex flex-col flex-1 gap-1.5 p-4">
        <p className="font-display text-[19px] font-medium text-navy leading-snug">
          {item.title}
        </p>
        {item.description && (
          <p className="text-[14px] text-text/50 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex flex-wrap gap-2">
          {item.files.map((file) => (
            <DownloadPill key={file.src} item={item} file={file} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function SciArt() {
  if (!sciArtItems.length) return null

  return (
    <section id="sci-art" className="py-24 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">
        <TypewriterLabel text="Sci-Art" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mt-6 mb-12 max-w-2xl"
        >
          <p className="font-mono text-[13px] text-text/40">
            More to come.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sciArtItems.map((item, i) => (
            <ArtCard key={item.id} item={item} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
