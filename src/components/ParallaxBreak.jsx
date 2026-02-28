import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ParallaxBreak({ gradient }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [25, -25])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05])

  return (
    <div ref={ref} className="h-48 md:h-64 overflow-hidden relative">
      <motion.div
        style={{ y, scale, background: gradient }}
        className="absolute inset-[-30px] w-[calc(100%+60px)]"
      />
    </div>
  )
}
