import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import RestaurantCard from './RestaurantCard'
import EmptyState from './EmptyState'
import { restaurants } from '../data/restaurants'

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Rating' },
  { id: 'time', label: 'Delivery time' },
  { id: 'cost', label: 'Cost: low to high' },
]

export default function RestaurantExplorer({ query, category, onReset }) {
  const [sort, setSort] = useState('relevance')
  const [vegOnly, setVegOnly] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    let res = restaurants.filter((r) => {
      if (category && !r.categories.includes(category)) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisines.some((c) => c.toLowerCase().includes(q)) ||
        r.menu.some((m) => m.name.toLowerCase().includes(q))
      )
    })
    if (vegOnly) res = res.filter((r) => r.veg)
    const sorted = [...res]
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    if (sort === 'time') sorted.sort((a, b) => a.deliveryTime - b.deliveryTime)
    if (sort === 'cost') sorted.sort((a, b) => a.priceForTwo - b.priceForTwo)
    if (sort === 'relevance') sorted.sort((a, b) => Number(b.promoted) - Number(a.promoted))
    return sorted
  }, [query, category, sort, vegOnly])

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">{list.length} restaurant{list.length !== 1 && 's'} {category || query ? 'found' : 'near you'}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="chip cursor-pointer select-none">
            <input type="checkbox" className="accent-emerald-600" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Pure Veg
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="chip pr-8" aria-label="Sort restaurants">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {list.length ? (
          <motion.div key={`${query}-${category}-${sort}-${vegOnly}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState emoji="🔎" title="No restaurants found" message="Try a different search or clear the filters." />
            <div className="mt-4 text-center"><button className="btn-outline" onClick={() => { setVegOnly(false); onReset?.() }}>Clear filters</button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
