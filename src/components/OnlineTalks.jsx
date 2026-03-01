import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const videos = [
  {
    id: 'OgQeXcokJ_M',
    title: 'Centre for Microbial Interactions',
    venue: 'The Sainsbury Laboratory',
  },
  {
    id: '3Fr4LSkXICQ',
    title: 'Single-cell and Spatial Dissection of Plant-microbe Interactions',
    venue: 'EMSL User Meeting 2023',
  },
  {
    id: 'i9Lk_mAyShU',
    title: 'EMBL-EBI Webinar',
    venue: 'EMBL-EBI 2023',
  },
  {
    id: 'gll7sc0ashI',
    title: 'Plant Cell Atlas Symposium Talk',
    venue: '2nd PCA Symposium',
  },
  {
    id: 'CEfU8nJK-V4',
    title: 'Plants and their microbiome: From molecules to ecosystems',
    venue: 'Plantae Presents Panels',
  },
  {
    id: 'DF01CEx_ZGQ',
    title: 'Online Talk / Presentation',
    venue: '',
  },
]

const podcasts = [
  {
    title: '#59 Minds Meet Weeds \u2013 Part 1',
    show: 'NeuroRadio',
    note: 'Japanese',
    href: 'https://neuroradio.tokyo/2023/07/10/59-minds-meet-weeds-part-1/',
  },
  {
    title: '#60 Minds Meet Weeds \u2013 Part 2',
    show: 'NeuroRadio',
    note: 'Japanese',
    href: 'https://neuroradio.tokyo/2023/07/17/60-minds-meet-weeds-part-2/',
  },
]

function useScrollState(ref) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref])

  return { canScrollLeft, canScrollRight }
}

export default function OnlineTalks() {
  const scrollRef = useRef(null)
  const { canScrollLeft, canScrollRight } = useScrollState(scrollRef)

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <section id="talks" className="py-24 bg-bg px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-14"
        >
          <div className="w-8 h-px bg-text/25" />
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40">
            Online Talks
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >

            {/* Video cards */}
            {videos.map((v) => (
              <a
                key={v.id}
                href={`https://youtu.be/${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 w-[300px] sm:w-[320px] snap-start rounded-xl border border-border bg-bg overflow-hidden hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                {/* Thumbnail with play overlay */}
                <div className="relative aspect-video bg-bg-soft overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-navy/80 group-hover:bg-navy flex items-center justify-center transition-colors shadow-lg">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="font-display text-[19px] font-medium text-navy leading-snug line-clamp-2">
                    {v.title}
                  </p>
                  {v.venue && (
                    <p className="mt-1.5 font-mono text-[14px] text-text/40">
                      {v.venue}
                    </p>
                  )}
                </div>
              </a>
            ))}

            {/* Podcast cards */}
            {podcasts.map((ep) => (
              <a
                key={ep.title}
                href={ep.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 w-[300px] sm:w-[320px] snap-start rounded-xl border border-border bg-bg overflow-hidden hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                {/* Podcast art area */}
                <div className="relative aspect-video bg-bg-soft flex items-center justify-center">
                  {/* Headphone icon */}
                  <div className="w-16 h-16 rounded-full bg-navy/10 group-hover:bg-navy/20 flex items-center justify-center transition-colors">
                    <svg className="w-7 h-7 text-navy" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 17.032l.884.884a1.5 1.5 0 002.33-.234l.27-.405a1.5 1.5 0 00-.154-1.82L6.75 12.132v4.9zm0 0V12.132m10.5 4.9l-.884.884a1.5 1.5 0 01-2.33-.234l-.27-.405a1.5 1.5 0 01.154-1.82l3.33-3.325v4.9zm0 0V12.132" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2 right-3 font-mono text-[11px] uppercase tracking-[0.1em] text-text/30">
                    {ep.note}
                  </span>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="font-display text-[19px] font-medium text-navy leading-snug line-clamp-2">
                    {ep.title}
                  </p>
                  <p className="mt-1.5 font-mono text-[14px] text-text/40">
                    {ep.show}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Left fade */}
          <div
            className={`absolute left-0 top-0 bottom-4 w-12 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(to right, var(--color-bg), transparent)' }}
          />
          {/* Right fade */}
          <div
            className={`absolute right-0 top-0 bottom-4 w-12 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(to left, var(--color-bg), transparent)' }}
          />

          {/* Left arrow */}
          <button
            onClick={() => scroll(-1)}
            className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-bg border border-border shadow-sm items-center justify-center hover:border-navy/40 hover:text-navy transition-all ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4 text-text/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Right arrow */}
          <button
            onClick={() => scroll(1)}
            className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-bg border border-border shadow-sm items-center justify-center hover:border-navy/40 hover:text-navy transition-all ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4 text-text/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
