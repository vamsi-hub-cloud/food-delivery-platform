import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import CartItem from '../components/CartItem'
import CouponBox from '../components/CouponBox'
import BillSummary from '../components/BillSummary'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { currency } from '../utils/format'

export default function Cart() {
  const { items, restaurant, totals, clear } = useCart()
  const navigate = useNavigate()
  const toast = useToast()

  if (!items.length) {
    return (
      <PageTransition>
        <div className="container-page py-20"><EmptyState emoji="🛒" title="Your cart is empty" message="Add some delicious items from a restaurant to get started." actionLabel="Browse restaurants" to="/" /></div>
      </PageTransition>
    )
  }

  const belowMin = totals.subtotal < (restaurant?.minOrder ?? 0)

  const checkout = () => {
    if (belowMin) return toast(`Minimum order is ${currency(restaurant.minOrder)}`, 'error')
    navigate('/checkout')
  }

  return (
    <PageTransition>
      <div className="container-page py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Your Cart</h1>
          <button className="text-sm font-medium text-red-500 hover:underline" onClick={() => { clear(); toast('Cart cleared') }}>Clear cart</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="card p-5">
            <p className="mb-2 text-sm text-gray-500">Ordering from <Link to={`/restaurant/${restaurant.id}`} className="font-semibold text-brand-600 hover:underline">{restaurant.name}</Link></p>
            <AnimatePresence initial={false}>
              {items.map((i) => <CartItem key={i.key} item={i} />)}
            </AnimatePresence>
            <Link to={`/restaurant/${restaurant.id}`} className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">+ Add more items</Link>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5"><h2 className="mb-3 font-bold">Apply coupon</h2><CouponBox /></div>
            <div className="card p-5">
              <h2 className="mb-3 font-bold">Bill details</h2>
              <BillSummary totals={totals} />
              {belowMin && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">Add {currency(restaurant.minOrder - totals.subtotal)} more to reach the minimum order of {currency(restaurant.minOrder)}.</p>}
              <button onClick={checkout} className="btn-primary mt-4 w-full !py-3">Proceed to Checkout · {currency(totals.total)}</button>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}
