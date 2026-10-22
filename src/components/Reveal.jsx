import { motion } from 'framer-motion'

// Scroll-reveal wrapper: fades + slides content in when it enters the viewport.
export default function Reveal({ children, delay = 0, y = 28, x = 0, className = '', as = 'div' }) {
  const Tag = motion[as] || motion.div
  return (
    <Tag
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </Tag>
  )
}
