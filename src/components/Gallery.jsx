import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryAlbums } from '../data/gallery'

export default function Gallery() {
  const [activeAlbum, setActiveAlbum] = useState(galleryAlbums[0]?.id)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  const album = galleryAlbums.find((a) => a.id === activeAlbum)
  const images = album?.images || []

  const openLightbox = (i) => setLightboxIdx(i)
  const closeLightbox = () => setLightboxIdx(null)

  const goPrev = useCallback(
    (e) => {
      e.stopPropagation()
      setLightboxIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    },
    [images.length],
  )

  const goNext = useCallback(
    (e) => {
      e.stopPropagation()
      setLightboxIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    },
    [images.length],
  )

  const currentImage = lightboxIdx !== null ? images[lightboxIdx] : null

  return (
    <section id="gallery" className="py-24 bg-bg px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Gallery
          </p>
        </motion.div>

        {/* Album tabs — underline style */}
        <div className="flex gap-6 mb-10">
          {galleryAlbums.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setActiveAlbum(a.id)
                setLightboxIdx(null)
              }}
              className={`font-mono text-xs uppercase tracking-[0.15em] pb-1 transition-all ${
                activeAlbum === a.id
                  ? 'text-navy border-b-2 border-navy'
                  : 'text-text/35 hover:text-text/60'
              }`}
            >
              {a.title}
            </button>
          ))}
        </div>

        {/* Image grid — every 5th item spans 2 columns */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAlbum}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-[5px]"
          >
            {images.map((img, i) => {
              const isWide = (i + 1) % 5 === 0
              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`aspect-[4/3] rounded-[6px] overflow-hidden cursor-pointer hover:scale-[1.015] transition-transform duration-300 ${
                    isWide ? 'md:col-span-2' : ''
                  }`}
                  onClick={() => openLightbox(i)}
                >
                  {img.src ? (
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: img.color }}
                    >
                      <span className="font-mono text-[10px] text-white/40 uppercase">
                        Photo
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox with prev/next */}
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
              className="max-w-[85vw] max-h-[80vh] aspect-[4/3] rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {currentImage.src ? (
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center min-w-[60vw] min-h-[40vh]"
                  style={{ backgroundColor: currentImage.color }}
                >
                  <span className="font-mono text-sm text-white/30">
                    {currentImage.alt}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Next */}
            <button
              onClick={goNext}
              className="absolute right-4 md:right-8 text-white/50 hover:text-white text-4xl z-10 select-none"
            >
              &#8250;
            </button>

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white text-2xl"
            >
              &times;
            </button>

            {/* Counter */}
            <span className="absolute bottom-4 font-mono text-xs text-white/30">
              {lightboxIdx + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
