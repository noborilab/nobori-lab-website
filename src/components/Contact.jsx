import { motion } from 'framer-motion'

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-bg-soft px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">
            Get in Touch
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Contact
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-12 grid md:grid-cols-2 gap-12"
        >
          <div>
            <h3 className="font-display text-2xl font-semibold text-navy">
              Nobori Lab
            </h3>
            <div className="mt-6 space-y-4 text-text/60">
              <p>
                <span className="font-mono text-xs uppercase tracking-widest text-text/40 block mb-1">
                  Address
                </span>
                Department of Plant Science
                <br />
                University Address Here
              </p>
              <p>
                <span className="font-mono text-xs uppercase tracking-widest text-text/40 block mb-1">
                  Email
                </span>
                nobori@university.edu
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl font-semibold text-navy">
              Join Us
            </h3>
            <p className="mt-4 text-text/60 leading-relaxed">
              We are always looking for motivated students and postdocs to join
              our team. If you are interested in nanotechnology, plant biology,
              or biosensing, please reach out with your CV and a brief
              description of your research interests.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
