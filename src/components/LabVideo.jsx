import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import TypewriterLabel from './TypewriterLabel'

const VIMEO_SRC =
  'https://player.vimeo.com/video/1206218840?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1'

// TODO: replace with a dedicated still frame when available
const POSTER = '/images/lab/group_photo/20260701_group_photo.jpg'

export default function LabVideo() {
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)

  const fadeUp = (delay = 0) =>
    reduced
      ? { initial: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.7, delay },
        }

  return (
    <section className="bg-bg py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp()} className="mb-8">
          <TypewriterLabel text="Who We Are" />
        </motion.div>

        <motion.div {...fadeUp(0.1)}>
          <div
            className="relative w-full rounded-xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden"
            style={{ paddingTop: '56.25%' }}
          >
            {playing ? (
              <iframe
                src={VIMEO_SRC}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                title="Tatsuya Nobori — Nobori Lab"
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                aria-label="Play video"
                className="group absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${import.meta.env.BASE_URL}${POSTER.replace(/^\//, '')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-navy/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-navy/80 group-hover:bg-navy group-hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-lg">
                    <svg
                      className="w-7 h-7 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
