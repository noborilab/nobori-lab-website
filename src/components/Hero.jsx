import { motion } from 'framer-motion'
import labLogo from '/images/lab-logo.gif'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-bg px-6"
    >
      {/* Logo with radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative mb-10"
      >
        {/* Warm radial glow */}
        <div
          className="absolute inset-0 rounded-full blur-[60px] -z-10 scale-110"
          style={{ background: 'radial-gradient(circle, rgba(232,228,216,0.5) 0%, transparent 70%)' }}
        />
        <img
          src={labLogo}
          alt="Nobori Lab"
          className="w-[min(500px,85vw)] h-auto"
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-display text-[clamp(1.1rem,3vw,1.5rem)] text-text/70 text-center max-w-2xl leading-relaxed italic"
      >
        Understanding the molecular and cellular basis of plant-microbe interactions
      </motion.p>

      {/* Institution */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-3 font-mono text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] text-text/40"
      >
        The Sainsbury Laboratory &middot; Norwich, UK
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
      >
        <a
          href="#projects"
          className="px-6 py-3 border border-border text-text/50 font-mono text-sm uppercase tracking-widest rounded-lg hover:bg-navy/5 hover:border-navy/30 hover:text-navy transition-all text-center"
        >
          Explore Projects
        </a>
        <a
          href="#publications"
          className="px-6 py-3 border border-border text-text/50 font-mono text-sm uppercase tracking-widest rounded-lg hover:bg-navy/5 hover:border-navy/30 hover:text-navy transition-all text-center"
        >
          Publications
        </a>
      </motion.div>

      {/* Group leader link */}
      <motion.a
        href="#cv"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="mt-5 font-body text-[16px] text-navy hover:underline transition-all"
      >
        Tatsuya Nobori, Group Leader &rarr;
      </motion.a>

      {/* Scroll indicator — desktop only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 border-2 border-text/20 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-text/30 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
