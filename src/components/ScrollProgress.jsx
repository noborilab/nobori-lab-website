import { motion, useScroll } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] opacity-50"
      aria-hidden
    >
      <div className="w-full h-full bg-gradient-to-r from-sage to-navy" />
    </motion.div>
  )
}
