import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import labLogo from '/images/lab-logo.gif'

export default function Hero() {
  const sectionRef = useRef(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Hero parallax: subtle depth, not a disappearing act
  const logoScale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const logoOpacity = useTransform(scrollYProgress, [0.4, 0.9], [1, 0.1])
  const logoY = useTransform(scrollYProgress, [0, 1], [0, 30])
  const taglineY = useTransform(scrollYProgress, [0, 1], [0, 15])
  const contentOpacity = useTransform(scrollYProgress, [0.5, 0.9], [1, 0.1])

  const parallax = !reduced

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-bg px-6"
    >
      {/* Logo with radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={parallax ? { scale: logoScale, opacity: logoOpacity, y: logoY, willChange: 'transform, opacity' } : undefined}
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
          className="w-[min(500px,calc(100vw-3rem))] h-auto"
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={parallax ? { y: taglineY, opacity: contentOpacity, willChange: 'transform, opacity' } : undefined}
        className="font-display text-[clamp(1.1rem,3vw,1.5rem)] text-text/70 text-center max-w-2xl leading-relaxed italic"
      >
        Decoding the molecular and cellular basis of plant-microbe interactions
      </motion.p>

      {/* Institution */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={parallax ? { opacity: contentOpacity, willChange: 'opacity' } : undefined}
        className="mt-3 font-mono text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] text-text/40 text-center"
      >
        <span className="sm:hidden">The Sainsbury Laboratory<br />Norwich, UK</span>
        <span className="hidden sm:inline">The Sainsbury Laboratory &middot; Norwich, UK</span>
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        style={parallax ? { opacity: contentOpacity, willChange: 'opacity' } : undefined}
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
        style={parallax ? { opacity: contentOpacity, willChange: 'opacity' } : undefined}
        className="mt-5 font-body text-[16px] text-navy hover:underline transition-all"
      >
        Tatsuya Nobori, Group Leader &rarr;
      </motion.a>

      {/* Scroll indicator — desktop only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={parallax ? { opacity: contentOpacity, willChange: 'opacity' } : undefined}
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
