import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const photos = [
  { src: '/images/lab/20240925_group_photo.jpg', alt: 'Group photo Sep 2024' },
  { src: '/images/lab/20241101_group_photo.jpg', alt: 'Group photo Nov 2024' },
  { src: '/images/lab/DSC_1340.JPG', alt: 'Conference at TSL' },
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
  const stripRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const animRef = useRef(null)
  const posRef = useRef(0)

  // Auto-scroll animation
  useEffect(() => {
    const el = stripRef.current
    if (!el) return

    let lastTime = null
    const speed = 0.5 // px per frame (~30px/s)

    const tick = (time) => {
      if (lastTime !== null && !paused) {
        const dt = time - lastTime
        posRef.current += speed * (dt / 16)
        // Reset when first set is fully scrolled
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
  }, [paused])

  const openLightbox = (i) => setLightboxIdx(i % photos.length)
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
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Gallery
          </p>
        </motion.div>
      </div>

      {/* Film strip carousel */}
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
              onClick={() => openLightbox(i)}
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

      {/* Caption */}
      <div className="max-w-5xl mx-auto px-6 mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text/30 text-center">
          Lab Life &middot; Conferences &middot; Norwich
        </p>
      </div>

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
            {/* Prev */}
            <button
              onClick={goPrev}
              className="absolute left-4 md:left-8 text-white/50 hover:text-white text-4xl z-10 select-none"
            >
              &#8249;
            </button>

            {/* Image */}
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

            {/* Next */}
            <button
              onClick={goNext}
              className="absolute right-4 md:right-8 text-white/50 hover:text-white text-4xl z-10 select-none"
            >
              &#8250;
            </button>

            {/* Caption */}
            <p className="absolute bottom-8 font-mono text-xs text-white/40">
              {currentImage.alt}
            </p>

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white text-2xl"
            >
              &times;
            </button>

            {/* Counter */}
            <span className="absolute bottom-4 font-mono text-[10px] text-white/25">
              {lightboxIdx + 1} / {photos.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
