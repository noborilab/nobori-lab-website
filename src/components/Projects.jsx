import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects } from '../data/projects'

export default function Projects() {
  const [activeId, setActiveId] = useState(projects[0].id)
  const active = projects.find((p) => p.id === activeId)

  return (
    <section id="projects" className="py-24 bg-bg px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            Our Work
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Projects
          </h2>
        </motion.div>

        <div className="mt-12 flex flex-col md:flex-row gap-8">
          {/* Tab buttons */}
          <div className="flex md:flex-col gap-2 md:w-64 shrink-0 overflow-x-auto md:overflow-visible">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveId(project.id)}
                className={`text-left px-5 py-3 rounded-xl font-mono text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
                  activeId === project.id
                    ? 'bg-navy text-white'
                    : 'bg-bg-soft text-text/60 hover:text-navy hover:bg-border/50'
                }`}
              >
                {project.title}
              </button>
            ))}
          </div>

          {/* Active panel */}
          <div className="flex-1 min-h-[300px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-bg-soft rounded-2xl p-8 border border-border"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-coral">
                  {active.subtitle}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-navy">
                  {active.title}
                </h3>
                <p className="mt-4 text-text/70 leading-relaxed">
                  {active.description}
                </p>
                <ul className="mt-6 space-y-2">
                  {active.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-text/70"
                    >
                      <span className="text-sage mt-0.5">&#9656;</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
