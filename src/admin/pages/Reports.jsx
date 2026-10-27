import { useMemo, useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Card, Field, PageHeader, StatCard } from '../components/ui'
import { compact, customerStats, downloadCSV, fmtDate, isRevenue, partnerStats, sum, within } from '../utils/analytics'
import { currency } from '../../utils/format'

const TYPES = [['sales', 'Sales report'], ['orders', 'Order report'], ['customers', 'Customer report'], ['partners', 'Delivery partner report'], ['restaurants', 'Restaurant report'], ['refunds', 'Refund report']]

export default function Reports() {
  const { orders, customers, partners, restaurants, refunds } = useAdmin()
  const toast = useToast()
  const [type, setType] = useState('sales')
  const [range, setRange] = useState('30')
  const [group, setGroup] = useState('day')

  const data = useMemo(() => {
    const os = within(orders, Number(range))
    const rev = os.filter(isRevenue)
    if (type === 'sales') {
      const keyFn = { day: (o) => new Date(o.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), restaurant: (o) => o.restaurantName, category: null, payment: (o) => o.payment.method.toUpperCase() }[group]
      const m = new Map()
      const add = (k, o, rev2, qty) => { const c = m.get(k) || { Group: k, Orders: 0, Sales: 0, Commission: 0, Discounts: 0 }; c.Orders += qty; c.Sales += rev2; c.Commission += o ? o.commission : 0; c.Discounts += o ? o.discount : 0; m.set(k, c) }
      if (group === 'category') rev.forEach((o) => o.items.forEach((i) => add(i.category, null, i.qty * i.price, i.qty)))
      else rev.forEach((o) => add(keyFn(o), o, o.total, 1))
      const rows = [...m.values()].map((r, i) => ({ id: i, ...r }))
      return { rows, cards: [['Gross sales', currency(sum(rev, (o) => o.total)), '💰', 'emerald'], ['Orders', rev.length, '🧾', 'orange'], ['Commission', currency(sum(rev, (o) => o.commission)), '🏦', 'violet'], ['Discounts given', currency(sum(rev, (o) => o.discount)), '🎟️', 'pink']] }
    }
    if (type === 'orders') return { rows: os.map((o) => ({ id: o.id, Order: o.id, Customer: o.customerName, Restaurant: o.restaurantName, Total: o.total, Payment: o.payment.method, Status: o.status, Date: fmtDate(o.placedAt) })), cards: [['Orders', os.length, '🧾', 'orange'], ['Delivered', os.filter((o) => o.status === 'delivered').length, '✅', 'emerald'], ['Cancelled', os.filter((o) => o.status === 'cancelled').length, '🚫', 'red'], ['Avg. value', currency(rev.length ? sum(rev, (o) => o.total) / rev.length : 0), '🧺', 'violet']] }
    if (type === 'customers') { const rows = customers.map((c) => { const s = customerStats(c, orders); return { id: c.id, Name: c.name, Email: c.email, Phone: c.phone, Status: c.status, Orders: s.count, Spent: s.spent } }); return { rows, cards: [['Customers', rows.length, '👥', 'violet'], ['Active', rows.filter((r) => r.Status === 'active').length, '✅', 'emerald'], ['Total spent', currency(sum(rows, (r) => r.Spent)), '💰', 'orange'], ['Avg. spend', currency(sum(rows, (r) => r.Spent) / Math.max(1, rows.length)), '🧺', 'sky']] } }
    if (type === 'partners') { const rows = partners.filter((p) => p.status === 'approved').map((p) => { const s = partnerStats(p, orders); return { id: p.id, Partner: p.name, Zone: p.zone, Deliveries: s.delivered, Earnings: s.earnings, Rating: p.rating, OnTime: `${p.onTime}%` } }); return { rows, cards: [['Active partners', rows.length, '🛵', 'orange'], ['Deliveries', sum(rows, (r) => r.Deliveries), '📦', 'emerald'], ['Earnings paid', currency(sum(rows, (r) => r.Earnings)), '💰', 'violet'], ['Avg. rating', (sum(rows, (r) => r.Rating) / Math.max(1, rows.length)).toFixed(1), '⭐', 'amber']] } }
    if (type === 'restaurants') { const rows = restaurants.filter((r) => r.status === 'approved').map((r) => { const mine = orders.filter((o) => o.restaurantId === r.id && isRevenue(o)); return { id: r.id, Restaurant: r.name, Area: r.area, Orders: mine.length, Sales: sum(mine, (o) => o.total), Commission: sum(mine, (o) => o.commission), Rating: r.rating } }); return { rows, cards: [['Restaurants', rows.length, '🏪', 'orange'], ['Sales', currency(sum(rows, (r) => r.Sales)), '💰', 'emerald'], ['Commission', currency(sum(rows, (r) => r.Commission)), '🏦', 'violet'], ['Orders', sum(rows, (r) => r.Orders), '🧾', 'sky']] } }
    const rows = refunds.map((r) => ({ id: r.id, Refund: r.id, Order: r.orderId, Customer: r.customerName, Amount: r.amount, Reason: r.reason, Status: r.status })); return { rows, cards: [['Refunds', rows.length, '💸', 'violet'], ['Approved', currency(sum(rows.filter((r) => r.Status === 'approved'), (r) => r.Amount)), '✅', 'emerald'], ['Pending', rows.filter((r) => r.Status === 'pending').length, '⏳', 'amber'], ['Rejected', rows.filter((r) => r.Status === 'rejected').length, '🚫', 'red']] }
  }, [type, range, group, orders, customers, partners, restaurants, refunds])

  const cols = data.rows.length ? Object.keys(data.rows[0]).filter((k) => k !== 'id').map((k) => ({ key: k, header: k, render: (r) => (typeof r[k] === 'number' && ['Sales', 'Commission', 'Discounts', 'Total', 'Spent', 'Earnings', 'Amount'].includes(k) ? currency(r[k]) : r[k]) })) : []
  const exportCsv = () => { downloadCSV(`${type}-report.csv`, data.rows.map(({ id, ...rest }) => rest)); toast('Report downloaded') }

  return (
    <div>
      <PageHeader emoji="📑" title="Reports" subtitle="Generate sales and operational reports and export them as CSV."
        actions={<><button className="btn-outline btn-sm" onClick={() => window.print()}>🖨 Print</button><button className="btn-primary btn-sm" onClick={exportCsv}>⬇ Export CSV</button></>} />
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Report type"><select className="input" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          {['sales', 'orders'].includes(type) && <Field label="Date range"><select className="input" value={range} onChange={(e) => setRange(e.target.value)}><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select></Field>}
          {type === 'sales' && <Field label="Group by"><select className="input" value={group} onChange={(e) => setGroup(e.target.value)}><option value="day">Day</option><option value="restaurant">Restaurant</option><option value="category">Food category</option><option value="payment">Payment method</option></select></Field>}
        </div>
      </Card>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{data.cards.map(([l, v, i, c]) => <StatCard key={l} label={l} value={v} icon={i} color={c} />)}</div>
      <Card title={`${TYPES.find((t) => t[0] === type)[1]} — ${data.rows.length} rows`}><DataTable key={`${type}${group}${range}`} columns={cols} rows={data.rows} pageSize={10} searchKeys={cols.map((c) => c.key)} /></Card>
    </div>
  )
}
