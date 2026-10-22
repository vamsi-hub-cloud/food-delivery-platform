import { findCoupon } from '../data/coupons'

const TAX_RATE = 0.05

export function validateCoupon(code, subtotal, deliveryFee) {
  const c = findCoupon(code || '')
  if (!c) return { ok: false, message: 'Invalid coupon code' }
  if (subtotal < c.min) return { ok: false, message: `Add items worth ₹${Math.ceil(c.min - subtotal)} more to use ${c.code}` }
  let discount = 0
  if (c.type === 'percent') discount = Math.min((subtotal * c.value) / 100, c.max)
  if (c.type === 'flat') discount = c.value
  if (c.type === 'freedelivery') discount = deliveryFee
  return { ok: true, coupon: c, discount: Math.round(discount) }
}

export function calcTotals(items, deliveryFee, couponCode) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const fee = items.length ? deliveryFee : 0
  let discount = 0
  let couponError = null
  if (couponCode && items.length) {
    const r = validateCoupon(couponCode, subtotal, fee)
    if (r.ok) discount = r.discount
    else couponError = r.message
  }
  const taxable = Math.max(0, subtotal - discount)
  const taxes = Math.round(taxable * TAX_RATE)
  const total = Math.max(0, subtotal + fee + taxes - discount)
  return { subtotal, deliveryFee: fee, discount, taxes, total, couponError }
}
