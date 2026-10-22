import { motion } from 'framer-motion'
import Rating from './Stars'
import Reveal from './Reveal'
import { makeReviews } from '../data/content'

const colors = ['from-orange-400 to-pink-400', 'from-violet-400 to-indigo-400', 'from-emerald-400 to-teal-400', 'from-sky-400 to-blue-500', 'from-pink-400 to-rose-500']

export default function ReviewsSection({ restaurant }) {
  const reviews = makeReviews(restaurant)
  const dist = [5, 4, 3, 2, 1].map((s) => {
    const base = s === 5 ? 55 : s === 4 ? 28 : s === 3 ? 10 : s === 2 ? 4 : 3
    return { s, pct: Math.max(2, Math.round(base + (restaurant.rating - 4.3) * (s >= 4 ? 18 : -14))) }
  })
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-2xl font-extrabold">Ratings & reviews</h2>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card p-6">
          <div className="flex items-end gap-3">
            <p className="text-5xl font-extrabold">{restaurant.rating.toFixed(1)}</p>
            <div className="pb-1"><Rating value={restaurant.rating} /><p className="mt-1 text-xs text-gray-500">{restaurant.reviews.toLocaleString('en-IN')} ratings</p></div>
          </div>
          <div className="mt-5 space-y-2">
            {dist.map((d) => (
              <div key={d.s} className="flex items-center gap-2 text-xs">
                <span className="w-6 font-semibold">{d.s}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" initial={{ width: 0 }} whileInView={{ width: `${d.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                </div>
                <span className="w-8 text-right text-gray-500">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={(i % 2) * 0.08}>
              <div className="card h-full p-4">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${colors[i % colors.length]} font-bold text-white`}>{r.name[0]}</span>
                  <div><p className="text-sm font-bold">{r.name}</p><p className="text-xs text-gray-400">{r.daysAgo} day{r.daysAgo > 1 ? 's' : ''} ago · ordered {r.dish}</p></div>
                </div>
                <p className="mt-2 text-amber-400">{'★'.repeat(r.rating)}<span className="text-gray-200">{'★'.repeat(5 - r.rating)}</span></p>
                <p className="mt-1 text-sm text-gray-600">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
