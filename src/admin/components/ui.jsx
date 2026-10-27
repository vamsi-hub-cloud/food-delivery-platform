import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TONES = {
  green: 'bg-emerald-100 text-emerald-700', red: 'bg-red-100 text-red-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700', gray: 'bg-gray-100 text-gray-600', pink: 'bg-pink-100 text-pink-700', orange: 'bg-orange-100 text-orange-700',
}
const STATUS_TONE = {
  pending: 'amber', confirmed: 'blue', preparing: 'violet', out_for_delivery: 'orange', delivered: 'green', cancelled: 'red', approved: 'green', rejected: 'red', suspended: 'red',
  verified: 'green', paid: 'green', failed: 'red', refunded: 'violet', processing: 'blue', success: 'green', open: 'amber', in_progress: 'blue', resolved: 'green', closed: 'gray',
  active: 'green', blocked: 'red', online: 'green', offline: 'gray', cod: 'gray', paused: 'amber', expired: 'gray', scheduled: 'blue', ended: 'gray', sent: 'green', completed: 'green',
  high: 'red', urgent: 'red', medium: 'amber', low: 'blue', inactive: 'gray', upi: 'violet', card: 'blue',
}
export const label = (s = '') => ({ out_for_delivery: 'Out for delivery', in_progress: 'In progress', cod: 'COD', upi: 'UPI' }[s] || s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()))

export function Badge({ tone = 'gray', children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>{children}</span>
}
export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] || 'gray'}>{label(status)}</Badge>

export function PageHeader({ title, subtitle, actions, emoji }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">{emoji && <span>{emoji}</span>}{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, action, children, className = '', pad = true }) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white shadow-card ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5">
          <h2 className="font-bold">{title}</h2>{action}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

const STAT_COLORS = {
  orange: 'from-orange-500 to-amber-400', pink: 'from-pink-500 to-rose-400', violet: 'from-violet-500 to-indigo-400', emerald: 'from-emerald-500 to-teal-400', sky: 'from-sky-500 to-cyan-400', amber: 'from-amber-500 to-yellow-400', red: 'from-red-500 to-orange-400',
}
export function StatCard({ label: l, value, icon, delta, color = 'orange', sub, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <motion.div whileHover={{ y: -3 }} className="h-full">
      <Tag onClick={onClick} className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-card">
        <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gradient-to-br opacity-15 ${STAT_COLORS[color]}`} />
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{l}</p>
          <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-lg text-white shadow ${STAT_COLORS[color]}`}>{icon}</span>
        </div>
        <p className="mt-2 text-2xl font-extrabold sm:text-3xl">{value}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta !== undefined && <span className={`font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%</span>}
          {sub && <span className="text-gray-400">{sub}</span>}
        </div>
      </Tag>
    </motion.div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-card" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${value === t.id ? 'bg-gradient-to-r from-brand-500 to-pink-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          {t.label}
          {t.count !== undefined && <span className={`rounded-full px-1.5 text-[11px] font-bold ${value === t.id ? 'bg-white/25' : 'bg-gray-100 text-gray-600'}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label: l, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={l} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size]
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ y: 50, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }} onClick={(e) => e.stopPropagation()}
            className={`flex max-h-[92vh] w-full ${w} flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl`}>
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold">{title}</h3>
              <button onClick={onClose} className="btn-ghost !px-2.5 !py-1" aria-label="Close">✕</button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <footer className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Field({ label: l, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{l}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export const Avatar = ({ name, size = 'h-9 w-9', color = 'from-brand-500 to-pink-500' }) => (
  <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white`}>{name?.[0] || '?'}</span>
)

export const Progress = ({ value, color = 'from-brand-500 to-pink-500' }) => (
  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
    <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ duration: 0.7 }} />
  </div>
)

export const Empty = ({ emoji = '📭', text = 'Nothing here yet' }) => (
  <div className="py-10 text-center text-gray-400"><div className="text-4xl">{emoji}</div><p className="mt-2 text-sm">{text}</p></div>
)

export const InfoRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 border-b border-dashed border-gray-100 py-2 text-sm last:border-0"><span className="text-gray-500">{k}</span><span className="text-right font-medium">{v}</span></div>
)

export const Stars = ({ value }) => <span className="text-amber-400">{'★'.repeat(Math.round(value))}<span className="text-gray-200">{'★'.repeat(5 - Math.round(value))}</span></span>
