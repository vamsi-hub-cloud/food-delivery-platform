import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { currency } from '../utils/format'

export default function FloatingCartBar() {
  const { count, totals } = useCart()
  const { pathname } = useLocation()
  const show = count > 0 && pathname.startsWith('/restaurant/')
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', damping: 24 }} className="fixed inset-x-0 bottom-4 z-30 px-4">
          <Link to="/cart" className="mx-auto flex max-w-xl items-center justify-between rounded-2xl bg-brand-500 px-5 py-3.5 text-white shadow-lift">
            <span className="text-sm font-semibold">{count} item{count > 1 ? 's' : ''} · {currency(totals.subtotal)}</span>
            <span className="text-sm font-bold">View Cart →</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
