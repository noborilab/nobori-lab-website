import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { labMoments } from '../data/gallery'

const photos = [
  { src: '/images/team/group-photo.jpg', alt: 'Nobori Lab group photo' },
  { src: '/images/lab/20250327_VIB.JPG', alt: 'VIB Conference, Antwerp 2025' },
  { src: '/images/lab/DSC_1340.JPG', alt: 'Conference at TSL' },
  { src: '/images/lab/IMG_0669.jpg', alt: 'The Sainsbury Laboratory' },
  { src: '/images/lab/20240925_group_photo.jpg', alt: 'Group photo Sep 2024' },
  { src: '/images/lab/20241101_group_photo.jpg', alt: 'Group photo Nov 2024' },
  { src: '/images/lab/IMG_0157.JPG', alt: 'Science outreach' },
  { src: '/images/lab/IMG_0158.JPG', alt: 'Norwich' },
  { src: '/images/lab/IMG_0159.JPG', alt: 'Norwich' },
  { src: '/images/lab/IMG_0160.JPG', alt: 'Norwich' },
  { src: '/images/lab/IMG_0260.jpg', alt: 'Lab life' },
  { src: '/images/lab/IMG_0566.JPG', alt: 'Lab life' },
  { src: '/images/lab/IMG_0712.jpg', alt: 'Lab life' },
  { src: '/images/lab/IMG_0714.jpg', alt: 'Lab life' },
  { src: '/images/lab/IMG_0784.JPG', alt: 'Lab life' },
  { src: '/images/lab/IMG_6668.JPG', alt: 'Conference' },
  { src: '/images/lab/IMG_7092.JPG', alt: 'TSL community' },
  { src: '/images/lab/IMG_9514.JPG', alt: 'Norwich' },
  { src: '/images/lab/IMG_9521.jpg', alt: 'Norwich' },
  { src: '/images/lab/IMG_9522.jpg', alt: 'Norwich' },
  { src: '/images/lab/IMG_9850.jpg', alt: 'Lab dinner' },
  { src: '/images/lab/IMG_9851.JPG', alt: 'Lab life' },
  { src: '/images/lab/IMG_9859.JPG', alt: 'Lab life' },
  { src: '/images/lab/IMG_9862.jpg', alt: 'Lab life' },
  { src: '/images/lab/IMG_9863.jpg', alt: 'Lab life' },
  { src: '/images/lab/e718fc1b.jpg', alt: 'Lab life' },
  { src: '/images/lab/e848ec74.JPG', alt: 'Conference' },
  { src: '/images/lab/f6bff0fe.JPG', alt: 'Lab life' },
  { src: '/images/lab/lab-88408243.JPG', alt: 'Lab life' },
  { src: '/images/lab/lab-selfie.png', alt: 'Lab selfie' },
]

// Duplicate for seamless loop
const loopPhotos = [...photos, ...photos]

export default function Gallery() {
  const [mode, setMode] = useState('carousel')
  const stripRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const animRef = useRef(null)
  const posRef = useRef(0)

  // Auto-scroll animation (only active in carousel mode)
  useEffect(() => {
    if (mode !== 'carousel') return
    const el = stripRef.current
    if (!el) return

    let lastTime = null
    const speed = 0.5

    const tick = (time) => {
      if (lastTime !== null && !paused) {
        const dt = time - lastTime
        posRef.current += speed * (dt / 16)
        const halfWidth = el.scrollWidth / 2
        if (posRef.current >= halfWidth) {
          posRef.current -= halfWidth
        }
        el.scrollLeft = posRef.current
      }
      lastTime = time
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [paused, mode])

  const openLightbox = (i) => setLightboxIdx(i)
  const closeLightbox = () => setLightboxIdx(null)

  const goPrev = useCallback(
    (e) => {
      e.stopPropagation()
      setLightboxIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
    },
    [],
  )

  const goNext = useCallback(
    (e) => {
      e.stopPropagation()
      setLightboxIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
    },
    [],
  )

  const currentImage = lightboxIdx !== null ? photos[lightboxIdx] : null

  return (
    <section id="gallery" className="py-16 bg-bg">
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40">
            Gallery
          </p>

          {/* Toggle pill */}
          <button
            onClick={() => setMode(mode === 'carousel' ? 'grid' : 'carousel')}
            className="ml-auto font-mono text-[13px] uppercase tracking-[0.15em] px-4 py-1.5 border border-border rounded-full text-text/50 hover:text-navy hover:border-navy/30 transition-colors"
          >
            {mode === 'carousel' ? 'View All' : 'Carousel'}
          </button>
        </motion.div>
      </div>

      {/* Lab Moments timeline */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="font-display text-[28px] font-semibold text-navy mb-8"
        >
          Lab Moments
        </motion.h3>

        {/* Desktop timeline */}
        <div className="hidden md:block">
          {labMoments.map((moment, i) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex items-start gap-10 pb-10 last:pb-0"
            >
              {/* Date */}
              <div className="w-[120px] shrink-0 text-right pt-4">
                <p className="font-display text-[17px] italic text-text/45">
                  {moment.date}
                </p>
              </div>
              {/* Dot + line */}
              <div className="relative flex flex-col items-center shrink-0">
                <div className="pt-[18px]">
                  <div className="w-3 h-3 rounded-full z-10 ring-4 ring-bg bg-sage" />
                </div>
                {i < labMoments.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>
              {/* Photo */}
              <div className="flex-1 max-w-[600px]">
                <img
                  src={import.meta.env.BASE_URL + moment.src.replace(/^\//, '')}
                  alt={moment.caption}
                  loading="lazy"
                  className="w-full rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                />
                <p className="mt-2 text-[15px] text-text/40 italic">
                  {moment.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: stacked, no line */}
        <div className="md:hidden space-y-8">
          {labMoments.map((moment, i) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-sage" />
                <p className="font-display text-[16px] italic text-text/45">
                  {moment.date}
                </p>
              </div>
              <img
                src={import.meta.env.BASE_URL + moment.src.replace(/^\//, '')}
                alt={moment.caption}
                loading="lazy"
                className="w-full rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              />
              <p className="mt-2 text-[15px] text-text/40 italic">
                {moment.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {mode === 'carousel' ? (
        /* Film strip carousel */
        <div
          ref={stripRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="overflow-hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex gap-[5px] w-max">
            {loopPhotos.map((photo, i) => (
              <div
                key={i}
                className="h-[220px] shrink-0 rounded-[4px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(i % photos.length)}
              >
                <img
                  src={import.meta.env.BASE_URL + photo.src.replace(/^\//, '')}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid mode */
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="aspect-square rounded-[6px] overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={import.meta.env.BASE_URL + photo.src.replace(/^\//, '')}
                  alt={photo.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={goPrev}
              className="absolute left-4 md:left-8 text-white/50 hover:text-white text-[45px] z-10 select-none"
            >
              &#8249;
            </button>

            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={import.meta.env.BASE_URL + currentImage.src.replace(/^\//, '')}
                alt={currentImage.alt}
                className="max-w-[90vw] max-h-[85vh] object-contain"
              />
            </motion.div>

            <button
              onClick={goNext}
              className="absolute right-4 md:right-8 text-white/50 hover:text-white text-[45px] z-10 select-none"
            >
              &#8250;
            </button>

            <p className="absolute bottom-8 font-mono text-sm text-white/40">
              {currentImage.alt}
            </p>

            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white text-3xl"
            >
              &times;
            </button>

            <span className="absolute bottom-4 font-mono text-[13px] text-white/25">
              {lightboxIdx + 1} / {photos.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
