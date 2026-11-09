import { useState, useCallback, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { labMoments, galleryByYear } from '../data/gallery'
import { thumbUrl } from '../lib/thumbs'
import ParallaxImage from './ParallaxImage'
import TypewriterLabel from './TypewriterLabel'
import ProgressivePhoto from './ProgressivePhoto'
import { MORPH_NAME, supportsMorph, morph, ratioOf } from '../lib/viewTransition'

// Flatten all photos for lightbox navigation
const allPhotos = galleryByYear.flatMap((g) => g.photos)

// Aspect ratios seen on clicked thumbnails, keyed by photo src
const ratios = new Map()

/* ── Group Photos (group photos) ── */

function MomentItem({ moment, i, total, isDesktop }) {
  if (isDesktop) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: i * 0.08 }}
        className="relative flex items-start gap-10 pb-10 last:pb-0"
      >
        <div className="w-[120px] shrink-0 text-right pt-4">
          <p className="font-display text-[17px] italic text-text/45">
            {moment.date}
          </p>
        </div>
        <div className="relative flex flex-col items-center shrink-0">
          <div className="pt-[18px]">
            <div className="w-3 h-3 rounded-full z-10 ring-4 ring-bg bg-sage" />
          </div>
          {i < total - 1 && <div className="w-px flex-1 bg-border" />}
        </div>
        <div className="flex-1 max-w-[600px]">
          <ParallaxImage className="rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <img
              src={thumbUrl(moment.src)}
              alt={moment.caption}
              loading="lazy"
              decoding="async"
              className="w-full"
            />
          </ParallaxImage>
          <p className="mt-2 text-[15px] text-text/40 italic">{moment.caption}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-sage" />
        <p className="font-display text-[16px] italic text-text/45">{moment.date}</p>
      </div>
      <ParallaxImage className="rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <img
          src={thumbUrl(moment.src)}
          alt={moment.caption}
          loading="lazy"
          className="w-full"
        />
      </ParallaxImage>
      <p className="mt-2 text-[15px] text-text/40 italic">{moment.caption}</p>
    </motion.div>
  )
}

function LabMoments() {
  const [showPrevious, setShowPrevious] = useState(false)
  const newest = labMoments[0]
  const older = labMoments.slice(1)

  return (
    <div className="max-w-5xl mx-auto px-6 mb-16">
      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="font-display text-[28px] font-semibold text-navy mb-8"
      >
        Group Photos
      </motion.h3>

      {/* Desktop */}
      <div className="hidden md:block">
        <MomentItem moment={newest} i={0} total={showPrevious ? labMoments.length : 1} isDesktop />
        <AnimatePresence>
          {showPrevious && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              {older.map((moment, i) => (
                <MomentItem key={moment.id} moment={moment} i={i} total={older.length} isDesktop />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-8">
        <MomentItem moment={newest} i={0} total={1} isDesktop={false} />
        <AnimatePresence>
          {showPrevious && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden space-y-8"
            >
              {older.map((moment, i) => (
                <MomentItem key={moment.id} moment={moment} i={i} total={older.length} isDesktop={false} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {older.length > 0 && (
        <div className="mt-6 md:pl-[164px]">
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className="font-mono text-[14px] uppercase tracking-[0.12em] text-text/35 hover:text-navy transition-colors"
          >
            {showPrevious ? 'Hide \u25B4' : 'Previous photos \u25BE'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Year section ── */

function YearSection({ year, photos, defaultOpen, onOpenLightbox, startIndex, morphIndex }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 group mb-4"
      >
        <h3 className="font-display text-[36px] font-semibold text-navy">
          {year}
        </h3>
        <span className="font-mono text-[14px] text-text/30 group-hover:text-navy transition-colors">
          {photos.length} photos
        </span>
        <span className="text-text/25 group-hover:text-navy transition-colors text-lg">
          {open ? '\u2212' : '+'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-10">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300"
                  style={morphIndex === startIndex + i ? { viewTransitionName: MORPH_NAME } : undefined}
                  onClick={(e) => {
                    const ratio = ratioOf(e.currentTarget)
                    if (ratio) ratios.set(photo.src, ratio)
                    onOpenLightbox(startIndex + i)
                  }}
                >
                  <img
                    src={thumbUrl(photo.src)}
                    alt={photo.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Lightbox ── */

// `morphing`: opened through a view transition, which animates the entrance and
// exit itself, so the framer fades are skipped for the photo it opened on.
function Lightbox({ photos, index, onClose, onPrev, onNext, morphing, openedAt }) {
  const photo = photos[index]

  // Esc closes, arrow keys move between photos
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  if (!photo) return null

  return (
    <motion.div
      initial={morphing ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={morphing ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      onClick={onClose}
    >
      <div className="relative flex items-center gap-2 md:gap-4 max-w-[calc(100vw-1rem)]">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Previous photo"
          className="shrink-0 text-white/50 hover:text-white text-[45px] z-10 select-none px-1 md:px-2"
        >
          &#8249;
        </button>

        <motion.div
          key={index}
          initial={morphing && index === openedAt ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className="max-w-[80vw] max-h-[85vh] rounded-lg overflow-hidden"
          style={morphing ? { viewTransitionName: MORPH_NAME } : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <ProgressivePhoto
            src={import.meta.env.BASE_URL + photo.src.replace(/^\//, '')}
            thumb={thumbUrl(photo.src)}
            ratio={ratios.get(photo.src)}
            alt={photo.name}
          />
        </motion.div>

        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Next photo"
          className="shrink-0 text-white/50 hover:text-white text-[45px] z-10 select-none px-1 md:px-2"
        >
          &#8250;
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Close"
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white text-3xl"
      >
        &times;
      </button>

      <span className="absolute bottom-4 font-mono text-[13px] text-white/25">
        {index + 1} / {photos.length}
      </span>
    </motion.div>
  )
}

/* ── Main Gallery ── */

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState(null)

  // Where view transitions are available the clicked thumbnail grows into the
  // lightbox and shrinks back on close; elsewhere the framer fade is used.
  const [morphing] = useState(supportsMorph)
  const [morphIdx, setMorphIdx] = useState(null)
  const [openedAt, setOpenedAt] = useState(null)

  const openLightbox = useCallback((i) => {
    if (!morphing) {
      setLightboxIdx(i)
      return
    }
    // Name the thumbnail first so it is in the "before" snapshot.
    flushSync(() => setMorphIdx(i))
    morph(() => {
      setOpenedAt(i)
      setLightboxIdx(i)
    })
  }, [morphing])

  const closeLightbox = useCallback(() => {
    if (!morphing) {
      setLightboxIdx(null)
      return
    }
    // The name moves to the thumbnail of whichever photo is showing now.
    const transition = morph(() => {
      setMorphIdx(lightboxIdx)
      setLightboxIdx(null)
    })
    transition.finished.finally(() => setMorphIdx(null))
  }, [morphing, lightboxIdx])
  const goPrev = useCallback(
    () => setLightboxIdx((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1)),
    [],
  )
  const goNext = useCallback(
    () => setLightboxIdx((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0)),
    [],
  )

  // Compute starting index for each year group
  let runningIndex = 0

  return (
    <section id="gallery" className="py-16 bg-bg">
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <TypewriterLabel text="Gallery" />
      </div>

      {/* Group Photos (group photos) */}
      <LabMoments />

      {/* Year-based photo grid */}
      <div className="max-w-5xl mx-auto px-6">
        {galleryByYear.map((group, gi) => {
          const startIndex = runningIndex
          runningIndex += group.photos.length
          return (
            <YearSection
              key={group.year}
              year={group.year}
              photos={group.photos}
              defaultOpen={gi === 0}
              onOpenLightbox={openLightbox}
              startIndex={startIndex}
              morphIndex={lightboxIdx === null ? morphIdx : null}
            />
          )
        })}
      </div>

      {/* Lightbox */}
      {morphing ? (
        lightboxIdx !== null && (
          <Lightbox
            photos={allPhotos}
            index={lightboxIdx}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
            morphing
            openedAt={openedAt}
          />
        )
      ) : (
        <AnimatePresence>
          {lightboxIdx !== null && (
            <Lightbox
              photos={allPhotos}
              index={lightboxIdx}
              onClose={closeLightbox}
              onPrev={goPrev}
              onNext={goNext}
            />
          )}
        </AnimatePresence>
      )}
    </section>
  )
}
