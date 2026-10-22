import { motion } from 'framer-motion'
import { categories } from '../data/restaurants'

export default function CategoryChips({ active, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-3 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
      {categories.map((c, i) => {
        const isActive = active === c.id
        return (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(isActive ? null : c.id)}
            className={`flex w-24 shrink-0 flex-col items-center gap-1 rounded-2xl p-3 transition-shadow ${isActive ? `bg-gradient-to-br ${c.grad} text-white shadow-lift` : `bg-gradient-to-br ${c.tile} shadow-card`}`}
            aria-pressed={isActive}
          >
            <motion.span animate={isActive ? { rotate: [0, -12, 12, 0] } : {}} className="text-3xl">{c.emoji}</motion.span>
            <span className={`text-xs font-bold ${isActive ? 'text-white' : c.text}`}>{c.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
