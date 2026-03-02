import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects, projectsIntro } from '../data/projects'
import ParallaxImage from './ParallaxImage'
import TypewriterLabel from './TypewriterLabel'

function ResourcePill({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block font-mono text-[14px] tracking-[0.05em] px-3 py-1 rounded-full border border-border text-text/50 hover:text-navy hover:border-navy hover:bg-navy/5 transition-all"
    >
      {children} &rarr;
    </a>
  )
}

function ProjectCard({ project, index }) {
  const [open, setOpen] = useState(false)

  const pubs = project.publications
    ? project.publications
    : project.publication
      ? [project.publication]
      : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-bg rounded-xl border border-border overflow-hidden break-inside-avoid mb-6"
    >
      {/* Media */}
      {project.image && (
        <ParallaxImage className="relative">
          <img
            src={import.meta.env.BASE_URL + project.image.replace(/^\//, '')}
            alt={project.title}
            className="w-full rounded-t-xl"
          />
          {project.imageCredit && (
            <p className="absolute bottom-1 right-2 text-[11px] text-white/60 italic">
              Image credit: {project.imageCredit}
            </p>
          )}
        </ParallaxImage>
      )}
      {project.video && (
        <ParallaxImage>
          <video
            src={import.meta.env.BASE_URL + project.video.replace(/^\//, '')}
            autoPlay
            muted
            loop
            playsInline
            className="w-full rounded-t-xl"
          />
        </ParallaxImage>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-[26px] font-semibold text-navy leading-snug">
          {project.title}
        </h3>

        {/* Collapsed: first sentence. Expanded: full. */}
        <div className="mt-3">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.p
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[17px] text-text/60 leading-relaxed"
              >
                {project.description}
              </motion.p>
            ) : (
              <motion.p
                key="short"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[17px] text-text/60 leading-relaxed"
              >
                {project.description.split('. ').slice(0, 2).join('. ')}.
                {project.description.split('. ').length > 2 && (
                  <button
                    onClick={() => setOpen(true)}
                    className="ml-1 text-navy/50 hover:text-navy transition-colors"
                  >
                    ...more
                  </button>
                )}
              </motion.p>
            )}
          </AnimatePresence>
          {open && project.description.split('. ').length > 2 && (
            <button
              onClick={() => setOpen(false)}
              className="mt-1 text-[14px] text-navy/40 hover:text-navy transition-colors"
            >
              Show less
            </button>
          )}
        </div>

        {/* Publications */}
        {pubs.length > 0 && (
          <div className="mt-4 space-y-1">
            {pubs.map((pub, i) => (
              <a
                key={i}
                href={pub.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[15px] text-text/45 hover:text-navy transition-colors"
              >
                {pub.text}
              </a>
            ))}
          </div>
        )}

        {/* Resource pills */}
        {project.resources && project.resources.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.resources.map((r, i) => (
              <ResourcePill key={i} href={r.href}>
                {r.label}
              </ResourcePill>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-24 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <TypewriterLabel text="Projects" className="mb-14" />

        {/* Intro — pull quote + body */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-[750px] mx-auto text-center py-8 mb-10"
        >
          <p className="font-display text-[1.3em] italic text-navy leading-relaxed mb-4">
            {projectsIntro.split('. ')[0]}.
          </p>
          <p className="text-[17px] text-text/55 leading-relaxed">
            {projectsIntro.split('. ').slice(1).join('. ')}
          </p>
          <div className="mt-8 mx-auto w-16 h-px bg-border" />
        </motion.div>

        {/* Project cards — masonry columns */}
        <div className="md:columns-2 gap-6 space-y-6 md:space-y-0">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
