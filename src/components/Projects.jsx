import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects } from '../data/projects'

const dotColor = {
  sage: 'bg-sage',
  navy: 'bg-navy',
  coral: 'bg-coral',
}

const gradients = {
  navy: 'linear-gradient(135deg, #2E3A5C 0%, #1C1E22 100%)',
  sage: 'linear-gradient(135deg, #6B8F6B 0%, #3A5C3A 100%)',
  coral: 'linear-gradient(135deg, #C85A3A 0%, #8B3A22 100%)',
}

export default function Projects() {
  const [activeId, setActiveId] = useState(projects[0].id)
  const active = projects.find((p) => p.id === activeId)

  return (
    <section id="projects" className="py-24 bg-bg-soft px-6">
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
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-text/40">
            Projects
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* LEFT — project cards */}
          <div className="flex flex-col gap-0 lg:w-[340px] shrink-0">
            {projects.map((project, i) => {
              const isActive = activeId === project.id
              return (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onClick={() => setActiveId(project.id)}
                  className={`text-left py-6 border-t border-border last:border-b transition-all duration-300 ${
                    isActive
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-70 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${dotColor[project.color]}`}
                    />
                    <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/50">
                      {project.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-[32px] font-semibold text-navy leading-snug">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 text-[18px] text-text/50 leading-relaxed">
                    {project.summary}
                  </p>
                </motion.button>
              )
            })}
          </div>

          {/* RIGHT — sticky detail panel */}
          <div className="flex-1 lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Image / gradient */}
                {active.image ? (
                  <div>
                    <img
                      src={import.meta.env.BASE_URL + active.image.replace(/^\//, '')}
                      alt={active.title}
                      className="w-full rounded-2xl object-contain"
                    />
                    {active.imageCredit && (
                      <p className="mt-1.5 text-right text-[14px] text-text/30 italic">
                        Image credit: {active.imageCredit}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-full aspect-[4/3] rounded-2xl"
                    style={{ background: gradients[active.color] }}
                  />
                )}

                {/* Detail text */}
                <p className="mt-6 text-[19px] text-text/65 leading-relaxed">
                  {active.detail}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
