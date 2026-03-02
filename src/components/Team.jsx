import { motion } from 'framer-motion'
import { teamMembers, alumni } from '../data/team'
import TypewriterLabel from './TypewriterLabel'

export default function Team() {
  return (
    <section id="team" className="py-24 bg-bg-soft px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <TypewriterLabel text="The Team" className="mb-10" />

        {/* Group page link */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12"
        >
          <a
            href="https://www.tsl.ac.uk/our-work/scientific-groups/tatsuya-nobori-group"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.15em] text-navy hover:text-coral transition-colors"
          >
            Visit our group page &rarr;
          </a>
        </motion.div>

        {/* Members grid — compact circles */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="text-center"
            >
              <div className="w-[72px] h-[72px] rounded-full mx-auto bg-border/30 flex items-center justify-center hover:bg-border/50 transition-colors overflow-hidden">
                {member.image ? (
                  <img
                    src={import.meta.env.BASE_URL + member.image.replace(/^\//, '')}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-xl text-navy/30">
                    {member.initials}
                  </span>
                )}
              </div>
              <h3 className="mt-2.5 font-display text-[19px] font-semibold text-navy leading-tight">
                {member.name}
              </h3>
              {member.role && (
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-sage">
                  {member.role}
                </p>
              )}
            </motion.div>
          ))}

        </div>

        {/* Join Us card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-14 max-w-2xl mx-auto bg-bg rounded-xl border border-border border-l-4 border-l-sage p-6 md:p-8"
        >
          <h3 className="font-display text-[28px] font-semibold text-navy mb-3">
            Join Us!
          </h3>
          <p className="text-[17px] text-text/60 leading-relaxed">
            If you are interested in joining our lab, please{' '}
            <a
              href="mailto:tatsuya.nobori@tsl.ac.uk"
              className="text-navy underline underline-offset-2 hover:text-coral transition-colors"
            >
              email Tatsuya
            </a>{' '}
            your <span className="text-sage font-medium">CV</span> along with a{' '}
            <span className="text-sage font-medium">cover letter</span> that includes:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] text-text/60 leading-relaxed pl-5">
            <li className="list-disc">Your research experience so far</li>
            <li className="list-disc">(for PD/PhD) your intended research focus</li>
            <li className="list-disc">Why you are interested in joining us at TSL</li>
          </ul>
        </motion.div>

        {/* Alumni */}
        {alumni.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h3 className="font-mono text-[13px] uppercase tracking-[0.2em] text-text/30 mb-4">
              Alumni
            </h3>
            <div className="space-y-2">
              {alumni.map((alum, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-x-3 gap-y-0.5 text-[16px]"
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
