import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import OrderTimeline from '../components/OrderTimeline'
import BillSummary from '../components/BillSummary'
import EmptyState from '../components/EmptyState'
import { useOrders } from '../context/OrderContext'
import { ORDER_STAGES, STAGE_MS, getStageIndex } from '../utils/orderStatus'
import { formatDate } from '../utils/format'

export default function OrderTracking() {
  const { id } = useParams()
  const { getOrder } = useOrders()
  const order = getOrder(id)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!order) {
    return <PageTransition><div className="container-page py-20"><EmptyState emoji="📭" title="Order not found" message="We couldn't find that order." actionLabel="View order history" to="/orders" /></div></PageTransition>
  }

  const stage = getStageIndex(order.placedAt, now)
  const delivered = stage === ORDER_STAGES.length - 1
  const remainingSec = Math.max(0, Math.ceil(((stage + 1) * STAGE_MS - (now - order.placedAt)) / 1000))
  const progress = ((stage + (delivered ? 0 : ((now - order.placedAt) % STAGE_MS) / STAGE_MS)) / (ORDER_STAGES.length - 1)) * 100

  return (
    <PageTransition>
      <div className="container-page max-w-5xl py-8">
        <Link to="/orders" className="text-sm text-gray-500 hover:text-brand-600">← All orders</Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-3xl font-extrabold">Track Order <span className="text-brand-500">#{order.id}</span></h1>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${delivered ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700'}`}>{ORDER_STAGES[stage].label}</span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="card overflow-hidden p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{delivered ? 'Delivered 🎉' : `Next update in ${remainingSec}s`}</span>
                <span className="text-gray-500">ETA ~{order.eta} min</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400" animate={{ width: `${Math.min(100, progress)}%` }} transition={{ duration: 0.8 }} />
              </div>
              <div className="relative mt-4 h-10">
                <motion.span className="absolute text-3xl" animate={{ left: `calc(${Math.min(100, progress)}% - 16px)` }} transition={{ duration: 0.8 }}>{delivered ? '🏠' : '🛵'}</motion.span>
              </div>
            </div>
            <div className="card p-6"><h2 className="mb-5 font-bold">Order status</h2><OrderTimeline current={stage} /></div>
            <p className="text-xs text-gray-400">Demo mode: status advances automatically every {STAGE_MS / 1000} seconds.</p>
          </div>

          <div className="card h-fit p-6">
            <h2 className="font-bold">{order.restaurant.name}</h2>
            <p className="mb-3 text-xs text-gray-500">Placed {formatDate(order.placedAt)}</p>
            <ul className="mb-4 space-y-1.5 border-b border-dashed border-gray-200 pb-4 text-sm text-gray-600">
              {order.items.map((i) => <li key={i.key}>{i.qty} × {i.name}{i.size ? ` (${i.size})` : ''}</li>)}
            </ul>
            <BillSummary totals={order.totals} />
            <p className="mt-4 text-xs text-gray-500">📍 {order.address}</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
