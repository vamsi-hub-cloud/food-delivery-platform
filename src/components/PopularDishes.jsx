import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import VegDot from './VegDot'
import { restaurants, categoryMap } from '../data/restaurants'
import { currency } from '../utils/format'

const dishes = restaurants
  .flatMap((r) => r.menu.filter((m) => m.popular).map((m) => ({ ...m, restaurant: r })))
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 12)

export default function PopularDishes() {
  return (
    <section>
      <SectionHeader eyebrow="🔥 Trending now" title="Most loved dishes" subtitle="Bestsellers our customers keep coming back for. Tap a dish to see full details." />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {dishes.map((d, i) => {
          const cat = categoryMap[d.category]
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -8, rotate: -1 }} className="w-56 shrink-0 snap-start sm:w-60">
              <Link to={`/restaurant/${d.restaurant.id}?item=${d.id}`} className="card block overflow-hidden transition-shadow hover:shadow-lift">
                <div className={`relative grid h-36 place-items-center bg-gradient-to-br ${cat.grad}`}>
                  <span className="text-7xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{d.emoji}</span>
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink">🔥 Bestseller</span>
                  <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">★ {d.rating.toFixed(1)}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2"><VegDot veg={d.veg} /><h3 className="truncate text-sm font-bold">{d.name}</h3></div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{d.restaurant.name}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-extrabold text-brand-600">{currency(d.price)}</span>
                    <span className="text-xs text-gray-400">{d.calories} kcal</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
