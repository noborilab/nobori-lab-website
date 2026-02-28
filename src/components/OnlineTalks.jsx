import { motion } from 'framer-motion'

const podcasts = [
  {
    title: '#59 Minds Meet Weeds \u2013 Part 1',
    show: 'NeuroRadio',
    href: 'https://neuroradio.tokyo/2023/07/10/59-minds-meet-weeds-part-1/',
  },
  {
    title: '#60 Minds Meet Weeds \u2013 Part 2',
    show: 'NeuroRadio',
    href: 'https://neuroradio.tokyo/2023/07/17/60-minds-meet-weeds-part-2/',
  },
]

export default function OnlineTalks() {
  return (
    <section id="talks" className="py-24 bg-bg px-6">
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
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text/40">
            Online Talks
          </p>
        </motion.div>

        {/* Talks — YouTube embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <h3 className="font-display text-2xl font-semibold text-navy mb-6">
            Talks
          </h3>
          <div className="max-w-3xl">
            <p className="text-[13px] text-text/45 mb-3">
              EMBL-EBI Webinar (2023)
            </p>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
              <iframe
                src="https://www.youtube.com/embed/i9Lk_mAyShU"
                title="EMBL-EBI Webinar — Tatsuya Nobori"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Podcast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="font-display text-2xl font-semibold text-navy mb-2">
            Podcast
          </h3>
          <p className="text-[13px] text-text/40 mb-6 font-mono">(in Japanese)</p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
            {podcasts.map((ep) => (
              <a
                key={ep.title}
                href={ep.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-bg-soft hover:border-navy/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Play icon */}
                <div className="w-10 h-10 rounded-full bg-navy/10 group-hover:bg-navy/20 flex items-center justify-center shrink-0 transition-colors">
                  <svg
                    className="w-4 h-4 text-navy ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-[15px] font-medium text-navy leading-snug group-hover:text-navy/80 transition-colors">
                    {ep.title}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-text/40">
                    {ep.show}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
