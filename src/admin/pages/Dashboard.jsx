import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { Badge, Card, PageHeader, StatCard, Tabs, StatusBadge, Empty } from '../components/ui'
import { AreaChart, BarChart, Donut, RankList } from '../components/Charts'
import { compact, dailySeries, groupSum, growth, hourDistribution, isRevenue, previous, sum, timeAgo, within } from '../utils/analytics'
import { currency } from '../../utils/format'
import { Reveal } from './shared'

const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#0ea5e9', preparing: '#8b5cf6', out_for_delivery: '#f95a16', delivered: '#10b981', cancelled: '#ef4444' }

export default function Dashboard() {
  const { orders, customers, partners, audit, counts, user } = useAdmin()
  const nav = useNavigate()
  const [range, setRange] = useState('14')
  const n = Number(range)

  const k = useMemo(() => {
    const cur = within(orders, 7), prev = previous(orders, 7)
    const rev = (os) => sum(os.filter(isRevenue), (o) => o.total)
    const earn = (os) => sum(os.filter(isRevenue), (o) => o.commission + o.deliveryFee)
    const activeUsers = new Set(within(orders, 30).map((o) => o.customerId || o.customerName)).size
    return {
      totalOrders: orders.length, ordersDelta: growth(cur.length, prev.length),
      revenue: rev(orders), revDelta: growth(rev(cur), rev(prev)),
      earnings: earn(orders), earnDelta: growth(earn(cur), earn(prev)),
      activeUsers, onlinePartners: partners.filter((p) => p.online).length,
    }
  }, [orders, partners])

  const series = useMemo(() => dailySeries(orders, n), [orders, n])
  const status = useMemo(() => groupSum(orders, (o) => o.status).map((d) => ({ ...d, label: d.label.replace(/_/g, ' '), color: STATUS_COLORS[d.label] })), [orders])
  const hours = useMemo(() => hourDistribution(within(orders, 30)), [orders])
  const peak = hours.reduce((a, b) => (b.value > a.value ? b : a), hours[0])
  const topRest = useMemo(() => groupSum(orders.filter(isRevenue), (o) => o.restaurantName, (o) => o.total).slice(0, 5), [orders])

  const activity = useMemo(() => {
    const a = audit.slice(0, 6).map((x) => ({ id: x.id, at: x.at, icon: '🛡️', text: <><b>{x.admin}</b> {x.action.toLowerCase()} <span className="text-gray-500">· {x.target}</span></> }))
    const o = orders.slice(0, 5).map((x) => ({ id: x.id, at: x.placedAt, icon: '🧾', text: <>New order <b>#{x.id}</b> from {x.customerName} <span className="text-gray-500">· {currency(x.total)}</span></> }))
    return [...a, ...o].sort((p, q) => q.at - p.at).slice(0, 8)
  }, [audit, orders])

  const ops = [
    ['⏳', 'Pending orders', counts.pendingOrders, '/admin/orders?tab=pending', 'bg-amber-50 text-amber-700'],
    ['🛵', 'Active deliveries', orders.filter((o) => o.status === 'out_for_delivery').length, '/admin/orders?tab=active', 'bg-orange-50 text-orange-700'],
    ['💸', 'Refund requests', counts.pendingRefunds, '/admin/orders?tab=refunds', 'bg-violet-50 text-violet-700'],
    ['🏪', 'Approvals', counts.pendingRestaurants + counts.pendingPartners, '/admin/restaurants?tab=registrations', 'bg-sky-50 text-sky-700'],
    ['⚠️', 'Failed payments', counts.failedPayments, '/admin/payments?tab=failed', 'bg-red-50 text-red-700'],
    ['🎧', 'Open tickets', counts.openTickets, '/admin/support', 'bg-emerald-50 text-emerald-700'],
  ]

  return (
    <div>
      <PageHeader emoji="📊" title="Dashboard" subtitle={`Welcome back, ${user.name.split(' ')[0]}! Here's what's happening on FoodiGo today.`}
        actions={<Link to="/admin/analytics" className="btn-primary btn-sm">View sales analytics →</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={k.totalOrders.toLocaleString('en-IN')} icon="🧾" color="orange" delta={k.ordersDelta} sub="vs prev. 7 days" onClick={() => nav('/admin/orders')} />
        <StatCard label="Revenue (GMV)" value={`₹${compact(k.revenue)}`} icon="💰" color="emerald" delta={k.revDelta} sub="vs prev. 7 days" onClick={() => nav('/admin/payments')} />
        <StatCard label="Active users" value={k.activeUsers} icon="👥" color="violet" sub={`${k.onlinePartners} partners online`} onClick={() => nav('/admin/customers')} />
        <StatCard label="Platform earnings" value={`₹${compact(k.earnings)}`} icon="🏦" color="pink" delta={k.earnDelta} sub="commission + fees" onClick={() => nav('/admin/payments?tab=commissions')} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {ops.map(([e, l, v, to, c]) => (
          <Link key={l} to={to} className={`flex items-center gap-3 rounded-2xl p-3.5 transition hover:-translate-y-0.5 hover:shadow-card ${c}`}>
            <span className="text-2xl">{e}</span><span className="leading-tight"><span className="block text-xl font-extrabold">{v}</span><span className="text-xs font-semibold opacity-80">{l}</span></span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card title="Revenue trend" action={<Tabs tabs={[{ id: '7', label: '7D' }, { id: '14', label: '14D' }, { id: '30', label: '30D' }]} value={range} onChange={setRange} />}>
          <AreaChart data={series} series={[{ key: 'revenue', label: 'Revenue', color: '#f95a16' }, { key: 'commission', label: 'Commission', color: '#8b5cf6' }]} format={(v) => `₹${compact(v)}`} />
        </Card>
        <Card title="Orders by status"><Donut data={status} center={orders.length} /></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Card title="Peak-hour statistics" action={<Badge tone="orange">Peak: {peak.label} ({peak.value} orders)</Badge>}>
          <BarChart data={hours} format={(v) => v} />
          <p className="mt-2 text-xs text-gray-500">Orders by hour of day over the last 30 days. Plan rider capacity around lunch (12–2 PM) and dinner (7–10 PM).</p>
        </Card>
        <Card title="Top restaurants (revenue)"><RankList items={topRest} format={(v) => `₹${compact(v)}`} /></Card>
        <Card title="Recent activities">
          {activity.length ? (
            <ul className="space-y-3">
              {activity.map((a) => <li key={a.id} className="flex gap-3 text-sm"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50">{a.icon}</span><div className="min-w-0"><p className="leading-snug">{a.text}</p><p className="text-xs text-gray-400">{timeAgo(a.at)}</p></div></li>)}
            </ul>
          ) : <Empty />}
        </Card>
      </div>

      <Card title="Latest orders" className="mt-6" action={<Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all →</Link>}>
        <div className="divide-y divide-gray-100">
          {orders.slice(0, 6).map((o) => (
            <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm hover:bg-orange-50/50">
              <b className="w-28">#{o.id}</b><span className="min-w-[8rem] flex-1 truncate">{o.customerName} · {o.restaurantName}</span><span className="font-semibold">{currency(o.total)}</span><StatusBadge status={o.status} /><span className="w-20 text-right text-xs text-gray-400">{timeAgo(o.placedAt)}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
