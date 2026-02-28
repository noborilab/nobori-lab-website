import { motion } from 'framer-motion'
import { teamMembers, alumni } from '../data/team'

export default function Team() {
  return (
    <section id="team" className="py-24 bg-bg-soft px-6">
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
            The Team
          </p>
        </motion.div>

        {/* Group page link */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <a
            href="https://www.tsl.ac.uk/our-work/scientific-groups/tatsuya-nobori-group"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-navy hover:text-coral transition-colors"
          >
            Visit our group page &rarr;
          </a>
        </motion.div>

        {/* Members grid — compact circles */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="text-center"
            >
              <div className="w-[72px] h-[72px] rounded-full mx-auto bg-border/30 flex items-center justify-center hover:bg-border/50 transition-colors">
                <span className="font-display text-lg text-navy/30">
                  {member.initials}
                </span>
              </div>
              <h3 className="mt-2.5 font-display text-[15px] font-semibold text-navy leading-tight">
                {member.name}
              </h3>
              {member.role && (
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-sage">
                  {member.role}
                </p>
              )}
            </motion.div>
          ))}

          {/* Open Positions card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: teamMembers.length * 0.05 }}
            className="text-center"
          >
            <a
              href="#contact"
              className="block w-[72px] h-[72px] rounded-full mx-auto border-2 border-dashed border-border hover:border-navy flex items-center justify-center transition-colors group"
            >
              <span className="font-display text-2xl text-text/20 group-hover:text-navy transition-colors">
                +
              </span>
            </a>
            <h3 className="mt-2.5 font-display text-[15px] font-semibold text-navy leading-tight">
              Join Us
            </h3>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-coral">
              Open Positions
            </p>
          </motion.div>
        </div>

        {/* Alumni */}
        {alumni.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text/30 mb-4">
              Alumni
            </h3>
            <div className="space-y-2">
              {alumni.map((alum, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13px]"
                >
                  <span className="text-navy font-medium">{alum.name}</span>
                  <span className="text-text/35">{alum.period}</span>
                  {alum.current && (
                    <span className="text-text/45">
                      &rarr; {alum.current}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
