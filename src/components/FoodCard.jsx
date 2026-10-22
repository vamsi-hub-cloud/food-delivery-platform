import { motion } from 'framer-motion'
import VegDot from './VegDot'
import { categoryMap } from '../data/restaurants'
import { currency } from '../utils/format'

export default function FoodCard({ item, onAdd, onOpen, index = 0 }) {
  const cat = categoryMap[item.category]
  const customizable = !!(item.sizes || item.addons)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
    >
      <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left" aria-label={`View details of ${item.name}`}>
        <div className="flex flex-wrap items-center gap-2">
          <VegDot veg={item.veg} />
          {item.popular && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">🔥 Bestseller</span>}
          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">★ {item.rating.toFixed(1)}</span>
        </div>
        <h4 className="mt-1 font-semibold">{item.name}</h4>
        <p className="mt-0.5 font-bold text-brand-600">{currency(item.price)}</p>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.desc}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-gray-600">
          <span className="rounded-full bg-orange-50 px-2 py-0.5">🔥 {item.calories} kcal</span>
          <span className="rounded-full bg-sky-50 px-2 py-0.5">⏱ {item.prepTime} min</span>
          {item.spice > 0 && <span className="rounded-full bg-rose-50 px-2 py-0.5">{'🌶️'.repeat(item.spice)}</span>}
        </div>
        <span className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline">View details →</span>
      </button>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <button type="button" onClick={() => onOpen(item)} className={`grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br ${cat.tile} text-5xl transition hover:scale-105 sm:h-28 sm:w-28`} aria-hidden="true" tabIndex={-1}>
          <motion.span whileHover={{ rotate: 12, scale: 1.15 }}>{item.emoji}</motion.span>
        </button>
        <button onClick={() => onAdd(item)} className="btn-outline -mt-5 bg-white !px-6 !py-1.5 font-bold uppercase text-emerald-600 shadow-card">Add</button>
        {customizable && <span className="-mt-1 text-[10px] text-gray-400">Customisable</span>}
      </div>
    </motion.div>
  )
}
