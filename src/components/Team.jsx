import { motion } from 'framer-motion'
import { teamMembers } from '../data/team'

export default function Team() {
  return (
    <section id="team" className="py-24 bg-bg-soft px-6">
      <div className="max-w-[700px] mx-auto">
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
            The Team
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-bg rounded-[10px] border border-border overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-300"
            >
              {/* Gradient header with avatar */}
              <div
                className="h-28 flex items-end justify-center pb-0"
                style={{
                  background:
                    'linear-gradient(180deg, #E8E4D8 0%, #F2F0EB 100%)',
                }}
              >
                <div className="w-20 h-20 rounded-full bg-bg border-[3px] border-bg flex items-center justify-center translate-y-10 shadow-sm">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-2xl text-navy/40">
                      {member.initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="pt-12 pb-6 px-6 text-center">
                <h3 className="font-display text-[20px] font-semibold text-navy">
                  {member.name}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage mt-1">
                  {member.role}
                </p>
                <p className="mt-3 text-[14px] text-text/55 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
