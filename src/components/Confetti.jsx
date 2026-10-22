import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#f95a16', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#0ea5e9']

export default function Confetti({ count = 45 }) {
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 720 - 360,
      round: i % 3 === 0,
    })),
    [count]
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{ left: `${p.left}%`, width: p.size, height: p.size * (p.round ? 1 : 0.5), background: p.color }}
          className={`absolute top-0 ${p.round ? 'rounded-full' : 'rounded-sm'}`}
        />
      ))}
    </div>
  )
}
