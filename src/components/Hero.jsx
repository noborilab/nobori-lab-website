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
          className="w-[min(420px,70vw)] h-auto"
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-display text-xl md:text-2xl text-text/70 text-center max-w-2xl leading-relaxed italic"
      >
        Decoding the molecular dialogue between plants and microbes
      </motion.p>

      {/* Institution */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-text/40"
      >
        The Sainsbury Laboratory &middot; Norwich, UK
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-8 flex gap-4"
      >
        <a
          href="#research"
          className="px-6 py-3 bg-navy text-white font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-navy/90 transition-colors"
        >
          Explore Research
        </a>
        <a
          href="#publications"
          className="px-6 py-3 border border-navy text-navy font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-navy/5 transition-colors"
        >
          Publications
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10"
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
