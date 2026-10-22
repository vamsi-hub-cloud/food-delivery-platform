import { useState } from 'react'
import { coupons } from '../data/coupons'
import { validateCoupon } from '../utils/pricing'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { currency } from '../utils/format'

export default function CouponBox() {
  const { coupon, applyCoupon, removeCoupon, totals, restaurant } = useCart()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [showList, setShowList] = useState(false)

  const apply = (c) => {
    const value = (c ?? code).trim()
    if (!value) return setError('Enter a coupon code')
    const r = validateCoupon(value, totals.subtotal, restaurant?.deliveryFee ?? 0)
    if (!r.ok) {
      setError(r.message)
      return
    }
    applyCoupon(r.coupon.code)
    setCode('')
    setError('')
    toast(`${r.coupon.code} applied — you saved ${currency(r.discount)}!`)
  }

  if (coupon && !totals.couponError) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-emerald-400 bg-emerald-50 p-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">🎟️ {coupon} applied</p>
          <p className="text-xs text-emerald-600">You saved {currency(totals.discount)}</p>
        </div>
        <button onClick={removeCoupon} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
      </div>
    )
  }

  return (
    <div>
      {totals.couponError && <p className="mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">Coupon {coupon}: {totals.couponError}</p>}
      <div className="flex gap-2">
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }} placeholder="Enter coupon code" className={`input uppercase ${error ? 'input-error' : ''}`} aria-label="Coupon code" />
        <button onClick={() => apply()} className="btn-primary">Apply</button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <button onClick={() => setShowList((s) => !s)} className="mt-2 text-xs font-semibold text-brand-600 hover:underline">{showList ? 'Hide' : 'View'} available coupons</button>
      {showList && (
        <ul className="mt-2 space-y-2">
          {coupons.map((c) => (
            <li key={c.code} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 p-2.5">
              <div>
                <p className="text-xs font-bold tracking-widest text-brand-600">{c.code}</p>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>
              <button onClick={() => apply(c.code)} className="btn-outline !px-3 !py-1 text-xs">Apply</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
