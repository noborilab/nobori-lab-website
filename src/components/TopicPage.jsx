import { org } from '../data/identity'
import { thumbUrl } from '../lib/thumbs'

// Stand-alone page for one method or discovery (/phytomap/, /primer-cells/).
// Content comes from src/data/topics.js, which joins the project card, the
// papers and the resource links that already exist elsewhere on the site.

const asset = (src) => import.meta.env.BASE_URL + src.replace(/^\//, '')

function Kicker({ children }) {
  return (
    <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/45">{children}</p>
  )
}

function Chip({ href, children }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[13px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border border-border text-text/55 hover:text-navy hover:border-navy transition-colors"
    >
      {children}
    </a>
  )
}

export default function TopicPage({ topic }) {
  const { project, papers, faq } = topic
  const resources = project.resources ?? []

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            className="font-logo text-xl font-light uppercase tracking-[0.2em] text-navy whitespace-nowrap"
          >
            Nobori Lab
          </a>
          <a
            href="/#projects"
            className="font-mono text-[13px] uppercase tracking-[0.1em] text-text/60 hover:text-navy transition-colors"
          >
            All research &rarr;
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <Kicker>
          {topic.kind}
          {project.title !== topic.title && <> &middot; {project.title}</>}
        </Kicker>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,3.6rem)] font-semibold text-navy leading-[1.08]">
          {topic.title}
        </h1>
        <p className="mt-6 text-[19px] leading-relaxed text-text/75">{project.description}</p>

        {project.image && (
          <figure className="mt-10">
            <img
              src={thumbUrl(project.image)}
              alt={project.title}
              className="w-full rounded-xl border border-border"
            />
            {project.imageCredit && (
              <figcaption className="mt-2 text-[14px] italic text-text/45">
                Image credit: {project.imageCredit}
              </figcaption>
            )}
          </figure>
        )}
        {project.video && (
          <video
            src={asset(project.video)}
            poster={project.videoPoster ? asset(project.videoPoster) : undefined}
            className="mt-10 w-full rounded-xl border border-border"
            controls
            muted
            loop
            playsInline
            preload="none"
          />
        )}

        {resources.length > 0 && (
          <section className="mt-14" aria-labelledby="topic-resources">
            <h2 id="topic-resources" className="font-display text-[28px] font-semibold text-navy">
              Use it
            </h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {resources.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-4 py-3.5 text-[18px] text-navy hover:text-sage transition-colors"
                  >
                    <span className="shrink-0">{r.label}</span>
                    <span className="min-w-0 truncate font-mono text-[13px] text-text/40 group-hover:text-sage transition-colors">
                      {new URL(r.href).hostname.replace(/^www\./, '')} &rarr;
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {papers.length > 0 && (
          <section className="mt-14" aria-labelledby="topic-papers">
            <h2 id="topic-papers" className="font-display text-[28px] font-semibold text-navy">
              {papers.length > 1 ? 'Papers' : 'Paper'}
            </h2>
            <div className="mt-4 space-y-8">
              {papers.map((pub) => (
                <article key={pub.id}>
                  <p className="font-mono text-[13px] tracking-[0.04em] text-text/45">
                    {pub.journal} &middot; {pub.year}
                  </p>
                  <h3 className="mt-1 font-display text-[23px] font-semibold text-navy leading-snug">
                    {pub.title}
                  </h3>
                  <p className="mt-1.5 text-[16px] text-text/55">{pub.authors}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip href={pub.link}>Link</Chip>
                    <Chip href={pub.pdf}>PDF</Chip>
                    <Chip href={pub.biorxiv}>bioRxiv</Chip>
                    <Chip href={pub.threadUrl}>Thread</Chip>
                  </div>
                  {/* Plain-text citation, easy to select and copy */}
                  <p className="mt-4 rounded-lg bg-bg-soft px-4 py-3 text-[15px] leading-relaxed text-text/70 select-all">
                    {pub.authors} ({pub.year}) {pub.title}. <em>{pub.journal}</em>. {pub.link}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {faq.length > 0 && (
          <section className="mt-14" aria-labelledby="topic-faq">
            <h2 id="topic-faq" className="font-display text-[28px] font-semibold text-navy">
              Questions we get asked
            </h2>
            <dl className="mt-4 space-y-6">
              {faq.map((item) => (
                <div key={item.q}>
                  <dt className="text-[18px] font-semibold text-navy">{item.q}</dt>
                  <dd className="mt-1.5 text-[17px] leading-relaxed text-text/70">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mt-14 rounded-xl border border-sage/40 bg-sage/5 p-6">
          <h2 className="font-display text-[24px] font-semibold text-navy">Get in touch</h2>
          <p className="mt-2 text-[17px] leading-relaxed text-text/70">
            Questions about {topic.title}, or interested in working together? Write to{' '}
            <a
              href={`mailto:${org.email}`}
              className="text-navy underline underline-offset-2 hover:text-sage transition-colors"
            >
              {org.email}
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="bg-navy text-white/60 py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="font-logo text-lg font-light uppercase tracking-[0.2em] text-white">
            Nobori Lab
          </a>
          <p className="font-mono text-sm">{org.parent.name}</p>
        </div>
      </footer>
    </div>
  )
}
