import { motion } from 'framer-motion'
import { teamMembers } from '../data/team'

export default function Team() {
  return (
    <section id="team" className="py-24 bg-bg-soft px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            Who We Are
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Team
          </h2>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-bg rounded-2xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
            >
              {/* Photo placeholder */}
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-border/30 flex items-center justify-center">
                  <span className="font-display text-3xl text-text/20">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="mt-4 font-display text-xl font-semibold text-navy">
                {member.name}
              </h3>
              <p className="font-mono text-xs uppercase tracking-widest text-coral mt-1">
                {member.role}
              </p>
              <p className="mt-3 text-sm text-text/60">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
