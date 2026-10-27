import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/orders', label: 'My Orders' },
  { to: '/admin', label: '🔐 Admin' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-brand-50 to-pink-50 text-brand-600' : 'text-gray-600 hover:text-brand-600'}`

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 text-lg shadow-lift animate-wiggle">🍔</span>
          Foodi<span className="text-gradient">Go</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="btn-primary relative !px-4" aria-label="Open cart">
            🛒 <span className="hidden sm:inline">Cart</span>
            <AnimatePresence mode="popLayout">
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button className="btn-ghost !px-3 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-3">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass} onClick={() => setOpen(false)}>{l.label}</NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
