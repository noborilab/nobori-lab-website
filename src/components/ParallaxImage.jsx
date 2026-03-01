import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Wraps an image/video in a subtle parallax container.
 * The child scrolls at ~15% slower rate than the page.
 */
export default function ParallaxImage({ children, className = '' }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y, willChange: 'transform' }}>
        {children}
      </motion.div>
    </div>
  )
}
