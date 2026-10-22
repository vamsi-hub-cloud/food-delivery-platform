import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeImage from './SafeImage'
import Rating from './Stars'

export default function RestaurantCard({ restaurant: r, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.07 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/restaurant/${r.id}`} className="card group block overflow-hidden transition-shadow hover:shadow-lift">
        <div className={`h-1.5 bg-gradient-to-r ${r.accent}`} />
        <div className="relative h-44 overflow-hidden">
          <SafeImage src={r.image} alt={r.name} className="h-full w-full transition duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {r.promoted && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-brand-600">⭐ Promoted</span>}
          <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${r.veg ? 'bg-emerald-600' : 'bg-ink/70'}`}>{r.veg ? '🌿 Pure Veg' : 'Veg & Non-veg'}</span>
          <span className={`absolute bottom-3 left-3 rounded-md bg-gradient-to-r ${r.accent} px-2 py-1 text-xs font-semibold text-white shadow`}>{r.offer}</span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-bold">{r.name}</h3>
            <Rating value={r.rating} />
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-gray-500">{r.cuisines.join(' • ')} · {r.area}</p>
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-xs text-gray-500">
            <span>⏱ {r.deliveryTime} min</span>
            <span>₹{r.priceForTwo} for two</span>
            <span>{r.deliveryFee === 0 ? 'Free delivery' : `₹${r.deliveryFee} delivery`}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
