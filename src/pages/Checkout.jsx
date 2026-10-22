import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import BillSummary from '../components/BillSummary'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrderContext'
import { useToast } from '../context/ToastContext'
import useLocalStorage from '../hooks/useLocalStorage'
import { validateCheckout } from '../utils/validators'
import { currency } from '../utils/format'

const blank = { name: '', phone: '', email: '', address: '', city: '', pincode: '', payment: 'cod', cardNumber: '', expiry: '', cvv: '', upi: '', instructions: '' }

function Field({ label, name, form, errors, touched, onChange, onBlur, className = '', ...rest }) {
  const err = touched[name] && errors[name]
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} value={form[name]} onChange={onChange} onBlur={onBlur} className={`input ${err ? 'input-error' : ''}`} aria-invalid={!!err} {...rest} />
      {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs text-red-500">{err}</motion.p>}
    </div>
  )
}

export default function Checkout() {
  const { items, restaurant, totals, coupon, clear } = useCart()
  const { placeOrder } = useOrders()
  const toast = useToast()
  const navigate = useNavigate()
  const placedRef = useRef(false)

  const [saved, setSaved] = useLocalStorage('foodigo_profile_v1', {})
  const [form, setForm] = useState({ ...blank, ...saved })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!items.length && !placedRef.current) navigate('/cart', { replace: true })
  }, [items.length, navigate])

  const errors = validateCheckout(form)

  const onChange = (e) => {
    let { name, value } = e.target
    if (name === 'phone' || name === 'pincode' || name === 'cvv') value = value.replace(/\D/g, '')
    if (name === 'phone') value = value.slice(0, 10)
    if (name === 'pincode') value = value.slice(0, 6)
    if (name === 'cvv') value = value.slice(0, 3)
    if (name === 'cardNumber') value = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
    if (name === 'expiry') {
      value = value.replace(/[^\d/]/g, '')
      if (/^\d{2}$/.test(value) && form.expiry.length < value.length) value += '/'
      value = value.slice(0, 5)
    }
    setForm((f) => ({ ...f, [name]: value }))
  }
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }))
  const fieldProps = { form, errors, touched, onChange, onBlur }

  const submit = (e) => {
    e.preventDefault()
    const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {})
    setTouched(allTouched)
    if (Object.keys(errors).length) {
      toast('Please fix the highlighted fields', 'error')
      const first = document.getElementById(Object.keys(errors)[0])
      first?.focus()
      return
    }
    setSubmitting(true)
    setSaved({ name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, pincode: form.pincode })
    setTimeout(() => {
      placedRef.current = true
      const id = placeOrder({
        restaurant: { id: restaurant.id, name: restaurant.name, image: restaurant.image },
        items,
        totals,
        coupon: totals.discount > 0 ? coupon : null,
        customer: { name: form.name, phone: form.phone, email: form.email },
        address: `${form.address}, ${form.city} - ${form.pincode}`,
        payment: form.payment,
        instructions: form.instructions,
        eta: restaurant.deliveryTime,
      })
      clear()
      navigate(`/order-confirmation/${id}`, { replace: true })
    }, 900)
  }

  if (!items.length) return null

  return (
    <PageTransition>
      <form onSubmit={submit} noValidate className="container-page py-8">
        <h1 className="mb-6 text-3xl font-extrabold">Checkout</h1>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
              <h2 className="mb-4 font-bold">📍 Delivery details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="name" placeholder="John Doe" autoComplete="name" {...fieldProps} />
                <Field label="Phone" name="phone" placeholder="10-digit mobile" inputMode="numeric" autoComplete="tel" {...fieldProps} />
                <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" className="sm:col-span-2" {...fieldProps} />
                <Field label="Address" name="address" placeholder="House no, street, landmark" autoComplete="street-address" className="sm:col-span-2" {...fieldProps} />
                <Field label="City" name="city" placeholder="Hyderabad" {...fieldProps} />
                <Field label="Pincode" name="pincode" placeholder="500081" inputMode="numeric" {...fieldProps} />
                <div className="sm:col-span-2">
                  <label htmlFor="instructions" className="label">Delivery instructions (optional)</label>
                  <textarea id="instructions" name="instructions" rows={2} value={form.instructions} onChange={onChange} placeholder="e.g. Ring the bell twice" className="input resize-none" />
                </div>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="mb-4 font-bold">💳 Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[['cod', '💵', 'Cash on Delivery'], ['upi', '📱', 'UPI'], ['card', '💳', 'Credit / Debit Card']].map(([v, e, l]) => (
                  <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${form.payment === v ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value={v} checked={form.payment === v} onChange={onChange} className="accent-brand-500" /> {e} {l}
                  </label>
                ))}
              </div>

              {form.payment === 'upi' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <Field label="UPI ID" name="upi" placeholder="name@bank" {...fieldProps} />
                </motion.div>
              )}
              {form.payment === 'card' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Card number" name="cardNumber" placeholder="1234 5678 9012 3456" inputMode="numeric" className="sm:col-span-2" {...fieldProps} />
                  <Field label="Expiry (MM/YY)" name="expiry" placeholder="08/29" inputMode="numeric" {...fieldProps} />
                  <Field label="CVV" name="cvv" placeholder="123" inputMode="numeric" type="password" {...fieldProps} />
                  <p className="text-xs text-gray-400 sm:col-span-2">Demo only — no real payment is processed and card details are never stored.</p>
                </motion.div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="font-bold">Order summary</h2>
              <p className="mb-3 text-xs text-gray-500">{restaurant.name}</p>
              <ul className="mb-4 max-h-56 space-y-2 overflow-y-auto text-sm">
                {items.map((i) => (
                  <li key={i.key} className="flex justify-between gap-2"><span className="text-gray-600">{i.qty} × {i.name}</span><span>{currency(i.price * i.qty)}</span></li>
                ))}
              </ul>
              <BillSummary totals={totals} />
              <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full !py-3">
                {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Placing order…</> : `Place Order · ${currency(totals.total)}`}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </PageTransition>
  )
}
