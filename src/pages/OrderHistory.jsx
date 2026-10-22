import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'
import SafeImage from '../components/SafeImage'
import { useOrders } from '../context/OrderContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { ORDER_STAGES, getStageIndex } from '../utils/orderStatus'
import { currency, formatDate } from '../utils/format'
import { useNavigate } from 'react-router-dom'

export default function OrderHistory() {
  const { orders, clearHistory } = useOrders()
  const { addItem } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  const reorder = (o) => {
    let ok = true
    for (const i of o.items) {
      ok = addItem({ ...i, restaurantId: o.restaurant.id })
      if (!ok) break
    }
    if (ok) {
      toast('Items added to cart')
      navigate('/cart')
    }
  }

  return (
    <PageTransition>
      <div className="container-page max-w-4xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">My Orders</h1>
          {orders.length > 0 && <button onClick={() => { clearHistory(); toast('Order history cleared') }} className="text-sm text-red-500 hover:underline">Clear history</button>}
        </div>

        {orders.length === 0 ? (
          <EmptyState emoji="🧾" title="No orders yet" message="When you place an order it will show up here." actionLabel="Order now" />
        ) : (
          <div className="space-y-4">
            {orders.map((o, idx) => {
              const stage = getStageIndex(o.placedAt)
              const delivered = stage === ORDER_STAGES.length - 1
              return (
                <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <SafeImage src={o.restaurant.image} alt={o.restaurant.name} className="h-20 w-full rounded-xl sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{o.restaurant.name}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${delivered ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700'}`}>{ORDER_STAGES[stage].label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">#{o.id} · {formatDate(o.placedAt)}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-gray-600">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="text-lg font-extrabold">{currency(o.totals.total)}</p>
                    <div className="flex gap-2">
                      <Link to={`/orders/${o.id}`} className="btn-outline !px-3 !py-1.5 text-xs">{delivered ? 'Details' : 'Track'}</Link>
                      <button onClick={() => reorder(o)} className="btn-primary !px-3 !py-1.5 text-xs">Reorder</button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
