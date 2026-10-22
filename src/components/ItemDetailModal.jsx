import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import VegDot from './VegDot'
import SpiceMeter from './SpiceMeter'
import { categoryMap } from '../data/restaurants'
import { currency } from '../utils/format'

function Macro({ label, value, unit, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="font-semibold text-gray-600">{label}</span><span className="font-bold">{value}{unit}</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
      </div>
    </div>
  )
}

export default function ItemDetailModal({ item, restaurant, onClose, onAdd, onSelect }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (item) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  const cat = item ? categoryMap[item.category] : null
  const pairs = item ? restaurant.menu.filter((m) => m.id !== item.id && m.category !== item.category).slice(0, 3) : []
  const customizable = item && (item.sizes || item.addons)

  return (
    <AnimatePresence>
      {item && (
        <motion.div key="backdrop" className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            key={item.id}
            role="dialog" aria-modal="true" aria-label={item.name}
            initial={{ y: 80, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl"
          >
            <div className={`relative grid h-44 shrink-0 place-items-center bg-gradient-to-br ${cat.grad} sm:h-52`}>
              <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }} className="text-8xl drop-shadow-lg sm:text-9xl">{item.emoji}</motion.span>
              <span className="absolute left-4 top-4 animate-float text-3xl opacity-60">{cat.emoji}</span>
              <span className="absolute bottom-4 right-6 animate-float-slow text-3xl opacity-60">✨</span>
              <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 font-bold shadow hover:scale-110" aria-label="Close">✕</button>
              <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
                {item.tags.map((t) => <span key={t} className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-ink">{t}</span>)}
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><VegDot veg={item.veg} /><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{cat.label} · {restaurant.name}</span></div>
                  <h3 className="mt-1 text-2xl font-extrabold">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-brand-600">{currency(item.price)}</p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">★ {item.rating.toFixed(1)}</p>
                  <p className="text-[11px] text-gray-400">{item.ratingCount} ratings</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['🔥', 'Calories', `${item.calories} kcal`, 'bg-orange-50'],
                  ['⏱️', 'Prep time', `${item.prepTime} min`, 'bg-sky-50'],
                  ['👥', 'Serves', item.serves, 'bg-violet-50'],
                  ['🌶️', 'Spice', ['None', 'Mild', 'Medium', 'Hot'][item.spice], 'bg-rose-50'],
                ].map(([e, l, v, bg]) => (
                  <motion.div key={l} whileHover={{ y: -3 }} className={`rounded-2xl ${bg} p-3 text-center`}>
                    <div className="text-xl">{e}</div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{l}</p>
                    <p className="text-sm font-bold">{v}</p>
                  </motion.div>
                ))}
              </div>

              <section>
                <h4 className="mb-3 text-sm font-bold">Nutrition per serving <span className="font-normal text-gray-400">(approx.)</span></h4>
                <div className="space-y-3">
                  <Macro label="Protein" value={item.protein} unit="g" pct={item.protein * 2} color="bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <Macro label="Carbohydrates" value={item.carbs} unit="g" pct={item.carbs / 1.2} color="bg-gradient-to-r from-amber-400 to-orange-500" />
                  <Macro label="Fat" value={item.fat} unit="g" pct={item.fat * 2.2} color="bg-gradient-to-r from-pink-400 to-rose-500" />
                </div>
              </section>

              <section>
                <h4 className="mb-2 text-sm font-bold">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((g, i) => (
                    <motion.span key={g} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{g}</motion.span>
                  ))}
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <section>
                  <h4 className="mb-1 text-sm font-bold">Spice level</h4>
                  <SpiceMeter level={item.spice} />
                </section>
                <section>
                  <h4 className="mb-1 text-sm font-bold">Allergen info</h4>
                  {item.allergens.length ? (
                    <div className="flex flex-wrap gap-1.5">{item.allergens.map((a) => <span key={a} className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">⚠ {a}</span>)}</div>
                  ) : <span className="text-sm text-gray-500">No major allergens</span>}
                </section>
              </div>

              {(item.sizes || item.addons) && (
                <section className="rounded-2xl bg-amber-50 p-4 text-sm">
                  <h4 className="mb-1 font-bold">Customisable</h4>
                  <p className="text-gray-600">
                    {item.sizes && <>Sizes: {item.sizes.map((s) => s.name).join(', ')}. </>}
                    {item.addons && <>Add-ons: {item.addons.map((a) => a.name).join(', ')}.</>}
                  </p>
                </section>
              )}

              {pairs.length > 0 && (
                <section>
                  <h4 className="mb-2 text-sm font-bold">Pairs well with</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {pairs.map((p) => (
                      <button key={p.id} onClick={() => onSelect(p)} className="flex items-center gap-2 rounded-xl border border-gray-200 p-2 text-left transition hover:border-brand-400 hover:shadow-card">
                        <span className="text-2xl">{p.emoji}</span>
                        <span className="min-w-0"><span className="block truncate text-xs font-semibold">{p.name}</span><span className="text-xs text-gray-500">{currency(p.price)}</span></span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="border-t border-gray-100 p-4">
              <button className="btn-primary btn-shine w-full !py-3" onClick={() => { onAdd(item); onClose() }}>
                {customizable ? 'Customise & add' : 'Add to cart'} · {currency(item.price)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
