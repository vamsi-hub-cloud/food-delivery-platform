import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getRestaurant, categories } from '../data/restaurants'
import PageTransition from '../components/PageTransition'
import SafeImage from '../components/SafeImage'
import Rating from '../components/Stars'
import FoodCard from '../components/FoodCard'
import CustomizeModal from '../components/CustomizeModal'
import ItemDetailModal from '../components/ItemDetailModal'
import ReviewsSection from '../components/ReviewsSection'
import SimilarRestaurants from '../components/SimilarRestaurants'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { makeItemKey } from '../utils/format'

export default function RestaurantDetail() {
  const { id } = useParams()
  const restaurant = getRestaurant(id)
  const { addItem } = useCart()
  const toast = useToast()

  const [activeCat, setActiveCat] = useState('all')
  const [query, setQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [customizing, setCustomizing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [params, setParams] = useSearchParams()

  // deep link: /restaurant/r1?item=m3 opens that dish's details
  useEffect(() => {
    const itemId = params.get('item')
    if (itemId && restaurant) {
      const found = restaurant.menu.find((m) => m.id === itemId)
      if (found) setDetail(found)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const closeDetail = () => {
    setDetail(null)
    if (params.get('item')) { params.delete('item'); setParams(params, { replace: true }) }
  }

  const items = useMemo(() => {
    if (!restaurant) return []
    const q = query.trim().toLowerCase()
    return restaurant.menu.filter(
      (m) =>
        (activeCat === 'all' || m.category === activeCat) &&
        (!vegOnly || m.veg) &&
        (!q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
    )
  }, [restaurant, activeCat, query, vegOnly])

  if (!restaurant) {
    return (
      <PageTransition>
        <div className="container-page py-20"><EmptyState emoji="🤷" title="Restaurant not found" message="This restaurant doesn't exist or was removed." actionLabel="Browse restaurants" to="/restaurants" /></div>
      </PageTransition>
    )
  }

  const tabs = [{ id: 'all', label: 'All' }, ...categories.filter((c) => restaurant.categories.includes(c.id))]

  const buildAndAdd = ({ item, size, addons, notes, qty, unit }) => {
    const ok = addItem({
      key: makeItemKey(item.id, size, addons, notes),
      id: item.id,
      restaurantId: restaurant.id,
      name: item.name,
      emoji: item.emoji,
      veg: item.veg,
      price: unit,
      size,
      addons,
      notes: notes.trim(),
      qty,
    })
    if (ok) toast(`${item.name} added to cart`)
  }

  const handleAdd = (item) => {
    if (item.sizes || item.addons) setCustomizing(item)
    else buildAndAdd({ item, size: null, addons: [], notes: '', qty: 1, unit: item.price })
  }

  return (
    <PageTransition>
      <section className="relative h-56 sm:h-72">
        <div className={`absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r ${restaurant.accent}`} />
        <SafeImage src={restaurant.image} alt={restaurant.name} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-5 text-white">
          <Link to="/" className="text-xs text-white/80 hover:underline">← Back to home</Link>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-2xl font-extrabold sm:text-4xl">{restaurant.name}</motion.h1>
          <p className="text-sm text-white/80">{restaurant.cuisines.join(' • ')} · {restaurant.area}</p>
        </div>
      </section>

      <div className="container-page py-6">
        <div className="card -mt-12 relative z-10 flex flex-wrap items-center gap-x-8 gap-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-2"><Rating value={restaurant.rating} /><span className="text-xs text-gray-500">{restaurant.reviews.toLocaleString('en-IN')}+ ratings</span></div>
          <div className="text-sm"><b>{restaurant.deliveryTime} min</b> <span className="text-gray-500">delivery</span></div>
          <div className="text-sm"><b>₹{restaurant.priceForTwo}</b> <span className="text-gray-500">for two</span></div>
          <div className="text-sm"><b>{restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}</b> <span className="text-gray-500">delivery fee</span></div>
          <span className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">🏷️ {restaurant.offer}</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['📍', 'Address', restaurant.address, 'bg-sky-50 ring-sky-200'],
            ['🕒', 'Open hours', restaurant.hours, 'bg-emerald-50 ring-emerald-200'],
            ['📞', 'Contact', `${restaurant.phone} · Since ${restaurant.since}`, 'bg-pink-50 ring-pink-200'],
          ].map(([e, l, v, c]) => (
            <motion.div key={l} whileHover={{ y: -3 }} className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${c}`}>
              <span className="text-2xl">{e}</span>
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{l}</p><p className="text-sm font-semibold">{v}</p></div>
            </motion.div>
          ))}
        </div>

        <div className="sticky top-16 z-20 -mx-4 mt-6 space-y-3 bg-orange-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar value={query} onChange={setQuery} placeholder={`Search in ${restaurant.name}`} className="flex-1" />
            <label className="chip cursor-pointer select-none self-start sm:self-center">
              <input type="checkbox" className="accent-emerald-600" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only
            </label>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveCat(t.id)} className={`chip ${activeCat === t.id ? 'chip-active' : ''}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {items.map((m, i) => <FoodCard key={m.id} item={m} index={i} onAdd={handleAdd} onOpen={setDetail} />)}
          </AnimatePresence>
        </motion.div>
        {items.length === 0 && <EmptyState emoji="🍽️" title="No dishes found" message="Try another category or clear your search." />}

        <ReviewsSection restaurant={restaurant} />
        <SimilarRestaurants restaurant={restaurant} />
      </div>

      <ItemDetailModal item={detail} restaurant={restaurant} onClose={closeDetail} onAdd={handleAdd} onSelect={setDetail} />

      <CustomizeModal item={customizing} onClose={() => setCustomizing(null)} onConfirm={(p) => { buildAndAdd(p); setCustomizing(null) }} />
    </PageTransition>
  )
}
