import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryAlbums } from '../data/gallery'

export default function Gallery() {
  const [activeAlbum, setActiveAlbum] = useState(galleryAlbums[0]?.id)
  const [lightbox, setLightbox] = useState(null)

  const album = galleryAlbums.find((a) => a.id === activeAlbum)

  return (
    <section id="gallery" className="py-24 bg-bg px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            Lab Life
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Gallery
          </h2>
        </motion.div>

        {/* Album tabs */}
        <div className="mt-8 flex gap-2">
          {galleryAlbums.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveAlbum(a.id)}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all ${
                activeAlbum === a.id
                  ? 'bg-navy text-white'
                  : 'bg-bg-soft text-text/50 hover:text-navy'
              }`}
            >
              {a.title}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album?.images.length > 0 ? (
            album.images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-sage transition-all"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={img.src}
                  alt={img.alt || ''}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="font-mono text-sm text-text/30">
                Photos coming soon
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8"
            onClick={() => setLightbox(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={lightbox.src}
              alt={lightbox.alt || ''}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
