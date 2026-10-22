import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cities } from '../data/content'
import { useToast } from '../context/ToastContext'

export default function Footer() {
  const [city, setCity] = useState(cities[0].name)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()
  const active = cities.find((c) => c.name === city)

  const subscribe = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Enter a valid email address')
    setError('')
    setEmail('')
    toast('Subscribed! Watch your inbox for offers 🎉')
  }

  return (
    <footer className="mt-20">
      {/* newsletter band */}
      <div className="container-page">
        <div className="relative -mb-16 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 via-pink-500 to-violet-600 bg-animated animate-gradient p-6 text-white shadow-lift sm:p-10">
          <span className="absolute -right-4 -top-6 animate-float text-8xl opacity-20">🍕</span>
          <div className="relative grid items-center gap-5 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-extrabold sm:text-3xl">Get tasty deals in your inbox</h3>
              <p className="mt-1 text-sm text-white/85">Subscribe for coupons, new restaurants and weekend specials.</p>
            </div>
            <form onSubmit={subscribe} noValidate>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} type="email" placeholder="you@example.com" aria-label="Email for newsletter" className="input !border-transparent text-ink" />
                <button className="btn bg-ink text-white hover:bg-black active:scale-95">Subscribe</button>
              </div>
              {error && <p className="mt-1 text-xs font-medium text-yellow-200">{error}</p>}
            </form>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-ink to-[#12151c] pt-24 text-gray-300">
        <div className="container-page grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <p className="text-2xl font-extrabold text-white">Foodi<span className="text-brand-400">Go</span> 🍔</p>
            <p className="mt-3 text-sm text-gray-400">Hot, fresh food from your favourite restaurants delivered to your door in minutes.</p>
            <div className="mt-4 flex gap-2">
              {[['📘', 'Facebook', 'hover:bg-blue-500'], ['📸', 'Instagram', 'hover:bg-pink-500'], ['🐦', 'Twitter', 'hover:bg-sky-500'], ['▶️', 'YouTube', 'hover:bg-red-500']].map(([e, l, c]) => (
                <motion.button key={l} whileHover={{ y: -4, scale: 1.1 }} aria-label={l} className={`grid h-10 w-10 place-items-center rounded-full bg-white/10 transition ${c}`}>{e}</motion.button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-white">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-brand-400">Home</Link></li>
              <li><Link to="/restaurants" className="hover:text-brand-400">Restaurants</Link></li>
              <li><Link to="/cart" className="hover:text-brand-400">My Cart</Link></li>
              <li><Link to="/orders" className="hover:text-brand-400">Order History</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-white">Company</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>About us</li><li>Careers</li><li>Partner with us</li><li>Terms & Privacy</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-white">Contact</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 1800-123-4567 (toll free)</li>
              <li>✉️ support@foodigo.demo</li>
              <li>🕒 Support 24×7</li>
            </ul>
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-white">Coupons</p>
            <div className="flex flex-wrap gap-1.5">
              {['WELCOME50', 'FREEDEL', 'FLAT100', 'WEEKEND20'].map((c) => <span key={c} className="rounded-md border border-dashed border-brand-400/60 px-2 py-0.5 text-[11px] font-bold tracking-wider text-brand-300">{c}</span>)}
            </div>
          </div>
        </div>

        {/* city branches */}
        <div className="border-t border-white/10">
          <div className="container-page py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-lg font-extrabold text-white">📍 Our branches across India</p>
                <p className="text-sm text-gray-400">Select a city to see our nearest branches.</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">{cities.length} cities · {cities.reduce((n, c) => n + c.branches.length, 0)} branches</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {cities.map((c) => {
                const on = c.name === city
                return (
                  <motion.button key={c.name} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => setCity(c.name)} aria-pressed={on}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${on ? `bg-gradient-to-r ${c.color} text-white shadow-lg` : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    <span>{c.emoji}</span>{c.name}
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={active.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.branches.map((b, i) => (
                  <motion.div key={b.area} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${active.color}`} />
                    <p className="pl-2 font-bold text-white">{active.emoji} {active.name} — {b.area}</p>
                    <p className="mt-1 pl-2 text-sm text-gray-400">{b.address}</p>
                    <p className="mt-1 pl-2 text-sm text-gray-300">📞 {b.phone}</p>
                    <p className="mt-1 pl-2 text-xs text-emerald-400">● Open · 10:00 AM – 11:30 PM</p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FoodiGo. Made with ❤️ — demo project, no real orders are processed.
        </div>
      </div>
    </footer>
  )
}
