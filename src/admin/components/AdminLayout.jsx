import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdmin } from '../context/AdminContext'
import { Avatar } from './ui'

const NAV = [
  { group: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: '📊', module: 'dashboard', end: true },
    { to: '/admin/analytics', label: 'Sales Analytics', icon: '📈', module: 'dashboard' },
  ] },
  { group: 'Operations', items: [
    { to: '/admin/orders', label: 'Orders', icon: '🧾', module: 'orders', badge: 'pendingOrders' },
    { to: '/admin/restaurants', label: 'Restaurants & Menu', icon: '🏪', module: 'restaurants', badge: 'pendingRestaurants' },
    { to: '/admin/partners', label: 'Delivery Partners', icon: '🛵', module: 'partners', badge: 'pendingPartners' },
    { to: '/admin/customers', label: 'Customers', icon: '👥', module: 'customers' },
  ] },
  { group: 'Finance & Growth', items: [
    { to: '/admin/payments', label: 'Payments & Finance', icon: '💰', module: 'payments', badge: 'failedPayments' },
    { to: '/admin/offers', label: 'Offers & Promotions', icon: '🎟️', module: 'offers' },
  ] },
  { group: 'Support & Settings', items: [
    { to: '/admin/support', label: 'Support & Disputes', icon: '🎧', module: 'support', badge: 'openTickets' },
    { to: '/admin/notifications', label: 'Notifications', icon: '🔔', module: 'support' },
    { to: '/admin/reports', label: 'Reports', icon: '📑', module: 'reports' },
    { to: '/admin/zones', label: 'Delivery Zones', icon: '🗺️', module: 'settings' },
    { to: '/admin/pricing', label: 'Pricing Settings', icon: '💲', module: 'settings' },
    { to: '/admin/roles', label: 'Roles & Permissions', icon: '🔐', module: 'settings' },
    { to: '/admin/settings', label: 'Platform Settings', icon: '⚙️', module: 'settings' },
    { to: '/admin/audit', label: 'Audit Logs', icon: '📜', module: 'settings' },
  ] },
]

export default function AdminLayout() {
  const { user, role, can, counts, logout, orders } = useAdmin()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [bell, setBell] = useState(false)
  const [q, setQ] = useState('')
  const loc = useLocation()
  const nav = useNavigate()
  const popRef = useRef(null)

  useEffect(() => { setOpen(false); setMenu(false); setBell(false) }, [loc.pathname])
  useEffect(() => {
    const h = (e) => { if (popRef.current && !popRef.current.contains(e.target)) { setMenu(false); setBell(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const alerts = [
    counts.pendingOrders && { t: `${counts.pendingOrders} new order(s) awaiting confirmation`, to: '/admin/orders?tab=pending', e: '🧾' },
    counts.pendingRefunds && { t: `${counts.pendingRefunds} refund request(s) pending`, to: '/admin/orders?tab=refunds', e: '💸' },
    counts.pendingRestaurants && { t: `${counts.pendingRestaurants} restaurant(s) awaiting approval`, to: '/admin/restaurants?tab=registrations', e: '🏪' },
    counts.pendingPartners && { t: `${counts.pendingPartners} partner(s) awaiting verification`, to: '/admin/partners?tab=verification', e: '🛵' },
    counts.failedPayments && { t: `${counts.failedPayments} failed payment(s) to review`, to: '/admin/payments?tab=failed', e: '⚠️' },
    counts.openTickets && { t: `${counts.openTickets} open support ticket(s)`, to: '/admin/support', e: '🎧' },
  ].filter(Boolean)

  const search = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    nav(`/admin/orders?q=${encodeURIComponent(term)}`)
    setQ('')
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#1b1f2b] to-[#12151d] text-gray-300">
      <Link to="/admin" className="flex items-center gap-2 px-5 py-5 text-xl font-extrabold text-white">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 text-lg">🍔</span>
        Foodi<span className="text-brand-400">Go</span>
        <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">Admin</span>
      </Link>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV.map((g) => {
          const items = g.items.filter((i) => can(i.module))
          if (!items.length) return null
          return (
            <div key={g.group}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{g.group}</p>
              {items.map((i) => (
                <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-brand-500 to-pink-500 text-white shadow-lg' : 'hover:bg-white/10 hover:text-white'}`}>
                  <span className="text-base">{i.icon}</span><span className="flex-1">{i.label}</span>
                  {i.badge && counts[i.badge] > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-600">{counts[i.badge]}</span>}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-gray-400">
        <Link to="/" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10 hover:text-white">🌐 View customer site</Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[55] bg-black/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-[60] w-72 lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>{sidebar}</motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="btn-ghost !px-3 lg:hidden" aria-label="Open menu">☰</button>
          <form onSubmit={search} className="relative hidden max-w-sm flex-1 sm:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID or customer…" className="input !py-2 pl-9" aria-label="Global search" />
          </form>
          <div className="ml-auto flex items-center gap-2" ref={popRef}>
            <div className="relative">
              <button onClick={() => { setBell((b) => !b); setMenu(false) }} className="btn-ghost relative !px-3" aria-label="Notifications">
                🔔{alerts.length > 0 && <span className="absolute right-1 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">{alerts.length}</span>}
              </button>
              <AnimatePresence>
                {bell && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    <p className="border-b border-gray-100 px-4 py-3 text-sm font-bold">Needs your attention</p>
                    {alerts.length ? alerts.map((a) => <Link key={a.t} to={a.to} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-50"><span>{a.e}</span>{a.t}</Link>) : <p className="p-4 text-sm text-gray-400">All caught up 🎉</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button onClick={() => { setMenu((m) => !m); setBell(false) }} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-100" aria-label="Account menu">
                <Avatar name={user.name} />
                <span className="hidden text-left leading-tight sm:block"><span className="block text-sm font-semibold">{user.name}</span><span className="block text-[11px] text-gray-500">{role?.name}</span></span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3 text-sm"><p className="font-bold">{user.name}</p><p className="truncate text-xs text-gray-500">{user.email}</p></div>
                    <Link to="/" className="block px-4 py-2.5 text-sm hover:bg-orange-50">🌐 Customer site</Link>
                    <button onClick={() => { logout(); nav('/admin/login') }} className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">↩ Log out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <motion.main key={loc.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ orders }} />
        </motion.main>
      </div>
    </div>
  )
}
