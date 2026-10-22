import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import BillSummary from '../components/BillSummary'
import EmptyState from '../components/EmptyState'
import Confetti from '../components/Confetti'
import { useOrders } from '../context/OrderContext'
import { formatDate } from '../utils/format'

const payLabel = { cod: 'Cash on Delivery', upi: 'UPI', card: 'Card' }

export default function OrderConfirmation() {
  const { id } = useParams()
  const { getOrder } = useOrders()
  const order = getOrder(id)

  if (!order) {
    return <PageTransition><div className="container-page py-20"><EmptyState emoji="📭" title="Order not found" message="We couldn't find that order." actionLabel="Go home" /></div></PageTransition>
  }

  return (
    <PageTransition>
      <Confetti />
      <div className="container-page max-w-3xl py-10">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-5xl text-white shadow-lg">
            <motion.span initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>✓</motion.span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 text-3xl font-extrabold">Order placed successfully!</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-1 text-gray-500">
            Thank you, {order.customer.name.split(' ')[0]}. Your food will arrive in about <b>{order.eta} minutes</b>.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card mt-8 p-6">
          <div className="flex flex-wrap justify-between gap-3 border-b border-dashed border-gray-200 pb-4 text-sm">
            <div><p className="text-gray-500">Order ID</p><p className="font-bold">#{order.id}</p></div>
            <div><p className="text-gray-500">Placed on</p><p className="font-bold">{formatDate(order.placedAt)}</p></div>
            <div><p className="text-gray-500">Payment</p><p className="font-bold">{payLabel[order.payment]}</p></div>
          </div>
          <div className="grid gap-6 py-5 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 font-bold">{order.restaurant.name}</h2>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {order.items.map((i) => <li key={i.key}>{i.qty} × {i.name}{i.size ? ` (${i.size})` : ''}</li>)}
              </ul>
              <h3 className="mb-1 mt-4 text-sm font-bold">Delivering to</h3>
              <p className="text-sm text-gray-600">{order.address}</p>
            </div>
            <div><h2 className="mb-2 font-bold">Bill</h2><BillSummary totals={order.totals} /></div>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={`/orders/${order.id}`} className="btn-primary">📍 Track Order</Link>
          <Link to="/orders" className="btn-outline">View Order History</Link>
          <Link to="/" className="btn-ghost">Continue Browsing</Link>
        </div>
      </div>
    </PageTransition>
  )
}
