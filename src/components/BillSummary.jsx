import { currency } from '../utils/format'

export default function BillSummary({ totals }) {
  const row = (label, value, cls = '') => (
    <div className={`flex justify-between text-sm ${cls}`}><span>{label}</span><span>{value}</span></div>
  )
  return (
    <div className="space-y-2">
      {row('Item total', currency(totals.subtotal), 'text-gray-600')}
      {row('Delivery fee', totals.deliveryFee === 0 ? 'FREE' : currency(totals.deliveryFee), 'text-gray-600')}
      {totals.discount > 0 && row('Coupon discount', `− ${currency(totals.discount)}`, 'font-medium text-emerald-600')}
      {row('Taxes & charges (5%)', currency(totals.taxes), 'text-gray-600')}
      <div className="flex justify-between border-t border-dashed border-gray-300 pt-3 text-base font-extrabold">
        <span>To pay</span><span>{currency(totals.total)}</span>
      </div>
    </div>
  )
}
