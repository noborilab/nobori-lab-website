import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-bg px-6"
    >
      {/* Animated logo GIF — replace src with your actual logo GIF */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-bg-soft border border-border flex items-center justify-center">
          {/* Replace with: <img src="/logo-animated.gif" alt="Nobori Lab" className="w-full h-full object-contain" /> */}
          <span className="font-display text-6xl text-navy">N</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-display text-5xl md:text-7xl font-semibold text-navy text-center"
      >
        Nobori Lab
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-4 font-body text-lg md:text-xl text-text/60 text-center max-w-xl"
      >
        Nanotechnology &times; Plant Biology
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
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
