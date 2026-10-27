import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import { Badge, Card, Empty, InfoRow, Modal, PageHeader, StatusBadge, Field } from '../components/ui'
import { fmtDateTime, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'
import { ReasonModal } from './shared'

const FLOW = [
  { key: 'pending', label: 'Order placed', emoji: '📝' },
  { key: 'confirmed', label: 'Confirmed by restaurant', emoji: '✅' },
  { key: 'preparing', label: 'Preparing food', emoji: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for delivery', emoji: '🛵' },
  { key: 'delivered', label: 'Delivered', emoji: '🎉' },
]

export default function OrderDetail() {
  const { id } = useParams()
  const { orders, partners, restaurants, refunds, setOrderStatus, assignPartner, cancelOrder, createRefund, can } = useAdmin()
  const toast = useToast()
  const order = orders.find((o) => o.id === id)
  const [cancel, setCancel] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundAmt, setRefundAmt] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundErr, setRefundErr] = useState('')
  const [autoRefund, setAutoRefund] = useState(true)
  const edit = can('orders', 'edit')

  if (!order) return <Card><Empty emoji="🤷" text="Order not found" /><div className="text-center"><Link to="/admin/orders" className="btn-primary btn-sm">Back to orders</Link></div></Card>

  const partner = partners.find((p) => p.id === order.partnerId)
  const restaurant = restaurants.find((r) => r.id === order.restaurantId)
  const cancelled = order.status === 'cancelled'
  const idx = FLOW.findIndex((f) => f.key === order.status)
  const next = !cancelled && idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null
  const histAt = (k) => order.history.filter((h) => h.status === k).slice(-1)[0]?.at
  const myRefunds = refunds.filter((r) => r.orderId === order.id)
  const eligible = partners.filter((p) => p.status === 'approved' && p.online)

  const advance = () => {
    if (next.key === 'out_for_delivery' && !order.partnerId) return toast('Assign a delivery partner first', 'error')
    setOrderStatus(order.id, next.key); toast(`Order moved to "${next.label}"`)
  }
  const submitRefund = () => {
    const amt = Number(refundAmt)
    if (!amt || amt <= 0 || amt > order.total) return setRefundErr(`Enter an amount between ₹1 and ${currency(order.total)}`)
    if (refundReason.trim().length < 3) return setRefundErr('Please enter a reason')
    createRefund(order, amt, refundReason.trim()); toast('Refund request created'); setRefundOpen(false); setRefundAmt(''); setRefundReason(''); setRefundErr('')
  }

  return (
    <div>
      <Link to="/admin/orders" className="text-sm text-gray-500 hover:text-brand-600">← All orders</Link>
      <PageHeader title={`Order #${order.id}`} subtitle={`Placed ${fmtDateTime(order.placedAt)} · ${timeAgo(order.placedAt)}`}
        actions={<>
          <StatusBadge status={order.status} />
          {edit && next && <button className="btn-primary btn-sm" onClick={advance}>Mark as: {next.label} →</button>}
          {edit && !cancelled && order.status !== 'delivered' && <button className="btn-danger btn-sm" onClick={() => setCancel(true)}>Cancel order</button>}
          {edit && ['delivered', 'cancelled'].includes(order.status) && order.payment.status === 'paid' && <button className="btn-outline btn-sm" onClick={() => { setRefundAmt(String(order.total)); setRefundOpen(true) }}>💸 Create refund</button>}
        </>} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Order status tracking">
            {cancelled ? (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"><b>Order cancelled.</b> Reason: {order.cancelReason || '—'}<p className="mt-1 text-xs opacity-75">{fmtDateTime(histAt('cancelled') || order.placedAt)}</p></div>
            ) : (
              <ol>
                {FLOW.map((f, i) => {
                  const done = i <= idx; const at = histAt(f.key)
                  return (
                    <li key={f.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < FLOW.length - 1 && <span className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 ${i < idx ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
                      <motion.span animate={i === idx && idx < 4 ? { scale: [1, 1.12, 1] } : {}} transition={{ repeat: Infinity, duration: 1.6 }} className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${done ? (i === idx && idx < 4 ? 'bg-brand-500 text-white shadow-lift' : 'bg-emerald-500 text-white') : 'bg-gray-100 text-gray-400'}`}>{done && i < idx ? '✓' : f.emoji}</motion.span>
                      <div className="pt-1"><p className={`font-semibold ${done ? '' : 'text-gray-400'}`}>{f.label}</p><p className="text-xs text-gray-400">{at ? fmtDateTime(at) : 'Waiting'}</p></div>
                    </li>
                  )
                })}
              </ol>
            )}
          </Card>

          <Card title={`Items from ${order.restaurantName}`} pad={false}>
            <table className="w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-2.5 text-left">Item</th><th className="px-3 text-center">Qty</th><th className="px-3 text-right">Price</th><th className="px-5 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{order.items.map((i) => <tr key={i.name}><td className="px-5 py-3 font-medium">{i.name}</td><td className="px-3 text-center">{i.qty}</td><td className="px-3 text-right">{currency(i.price)}</td><td className="px-5 text-right font-semibold">{currency(i.price * i.qty)}</td></tr>)}</tbody></table>
            <div className="space-y-1.5 border-t border-gray-100 p-5 text-sm">
              <InfoRow k="Subtotal" v={currency(order.subtotal)} />
              <InfoRow k="Delivery fee" v={order.deliveryFee ? currency(order.deliveryFee) : 'FREE'} />
              {order.discount > 0 && <InfoRow k={`Discount ${order.coupon ? `(${order.coupon})` : ''}`} v={<span className="text-emerald-600">− {currency(order.discount)}</span>} />}
              <InfoRow k="Taxes" v={currency(order.taxes)} />
              <div className="flex justify-between pt-2 text-base font-extrabold"><span>Total</span><span>{currency(order.total)}</span></div>
              <InfoRow k="Platform commission" v={<span className="text-violet-600">{currency(order.commission)}</span>} />
            </div>
          </Card>

          <Card title="Activity log">
            <ul className="space-y-2 text-sm">{[...order.history].reverse().map((h, i) => <li key={i} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><StatusBadge status={h.status} />{h.note && <span className="text-gray-500">{h.note}</span>}</span><span className="text-xs text-gray-400">{fmtDateTime(h.at)}</span></li>)}</ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <InfoRow k="Name" v={order.customerId ? <Link className="text-brand-600 hover:underline" to={`/admin/customers/${order.customerId}`}>{order.customerName}</Link> : order.customerName} />
            <InfoRow k="Phone" v={order.phone || '—'} />
            <InfoRow k="Address" v={order.address} />
            <InfoRow k="Distance" v={`${order.distanceKm} km`} />
          </Card>
          <Card title="Restaurant">
            <InfoRow k="Name" v={<Link className="text-brand-600 hover:underline" to={`/admin/restaurants/${order.restaurantId}`}>{order.restaurantName}</Link>} />
            <InfoRow k="Contact" v={restaurant?.phone || '—'} />
            <InfoRow k="Commission rate" v={restaurant ? `${restaurant.commission}%` : '—'} />
          </Card>
          <Card title="Delivery partner">
            {partner ? <div className="mb-3 rounded-xl bg-orange-50 p-3 text-sm"><Link to={`/admin/partners/${partner.id}`} className="font-bold text-brand-600 hover:underline">{partner.name}</Link><p className="text-xs text-gray-500">{partner.vehicle} · {partner.plate} · {partner.phone}</p></div> : <p className="mb-3 text-sm text-amber-600">⚠ No partner assigned yet</p>}
            {edit && !cancelled && order.status !== 'delivered' && (
              <Field label="Assign / reassign">
                <select className="input" value={order.partnerId || ''} onChange={(e) => { assignPartner(order.id, e.target.value); toast(e.target.value ? 'Partner assigned' : 'Partner removed') }}>
                  <option value="">— Unassigned —</option>
                  {eligible.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.zone})</option>)}
                </select>
              </Field>
            )}
            <InfoRow k="Partner earning" v={currency(order.partnerEarning)} />
          </Card>
          <Card title="Payment">
            <InfoRow k="Method" v={<StatusBadge status={order.payment.method} />} />
            <InfoRow k="Status" v={<StatusBadge status={order.payment.status} />} />
            <InfoRow k="Amount" v={currency(order.total)} />
            {myRefunds.length > 0 && <div className="mt-3 space-y-2">{myRefunds.map((r) => <div key={r.id} className="rounded-xl bg-violet-50 p-3 text-xs"><div className="flex items-center justify-between"><b>{r.id} · {currency(r.amount)}</b><StatusBadge status={r.status} /></div><p className="mt-1 text-gray-600">{r.reason}</p></div>)}</div>}
          </Card>
        </div>
      </div>

      <ReasonModal open={cancel} danger title="Cancel this order?" text={`Order #${order.id} will be cancelled.`} confirmLabel="Cancel order" onClose={() => setCancel(false)}
        extra={order.payment.status === 'paid' && <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-500" checked={autoRefund} onChange={(e) => setAutoRefund(e.target.checked)} /> Refund {currency(order.total)} to customer</label>}
        onConfirm={(reason) => { cancelOrder(order, reason, autoRefund); toast('Order cancelled'); setCancel(false) }} />
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Create refund request" size="sm" footer={<><button className="btn-outline" onClick={() => setRefundOpen(false)}>Cancel</button><button className="btn-primary" onClick={submitRefund}>Create</button></>}>
        <div className="space-y-3">
          <Field label="Amount (₹)"><input type="number" className="input" value={refundAmt} onChange={(e) => { setRefundAmt(e.target.value); setRefundErr('') }} /></Field>
          <Field label="Reason"><input className="input" value={refundReason} onChange={(e) => { setRefundReason(e.target.value); setRefundErr('') }} placeholder="e.g. Food quality issue" /></Field>
          {refundErr && <p className="text-xs text-red-500">{refundErr}</p>}
        </div>
      </Modal>
    </div>
  )
}
