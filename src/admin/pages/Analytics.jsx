import { useMemo, useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { Card, PageHeader, StatCard, Tabs } from '../components/ui'
import { AreaChart, BarChart, Donut, Heatmap, RankList } from '../components/Charts'
import { compact, dailySeries, downloadCSV, groupSum, growth, heatmap, isRevenue, itemSales, previous, sum, within } from '../utils/analytics'
import { currency } from '../../utils/format'

export default function Analytics() {
  const { orders, customers } = useAdmin()
  const [range, setRange] = useState('30')
  const n = Number(range)

  const d = useMemo(() => {
    const cur = within(orders, n), prev = previous(orders, n)
    const rev = cur.filter(isRevenue), prevRev = prev.filter(isRevenue)
    const gmv = sum(rev, (o) => o.total), pgmv = sum(prevRev, (o) => o.total)
    const aov = rev.length ? Math.round(gmv / rev.length) : 0
    const paov = prevRev.length ? Math.round(pgmv / prevRev.length) : 0
    const cancelRate = cur.length ? Math.round((cur.filter((o) => o.status === 'cancelled').length / cur.length) * 100) : 0
    const byCust = new Map(); cur.forEach((o) => byCust.set(o.customerId || o.customerName, (byCust.get(o.customerId || o.customerName) || 0) + 1))
    const repeat = byCust.size ? Math.round(([...byCust.values()].filter((v) => v > 1).length / byCust.size) * 100) : 0
    return {
      cur, gmv, gmvDelta: growth(gmv, pgmv), aov, aovDelta: growth(aov, paov), cancelRate, repeat,
      series: dailySeries(orders, n),
      category: groupSum(rev.flatMap((o) => o.items.map((i) => ({ c: i.category, v: i.qty * i.price }))), (x) => x.c, (x) => x.v).slice(0, 6),
      payment: groupSum(cur, (o) => o.payment.method.toUpperCase()),
      rests: groupSum(rev, (o) => o.restaurantName, (o) => o.total).slice(0, 6),
      dishes: itemSales(cur).slice(0, 6),
      zones: groupSum(rev, (o) => o.zone, (o) => o.total).slice(0, 6),
      heat: heatmap(cur),
      weekday: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => ({ label: l, value: heatmap(cur)[i].reduce((a, b) => a + b, 0) })),
    }
  }, [orders, n])

  const exportCsv = () => downloadCSV(`sales-last-${n}-days.csv`, d.series.map((s) => ({ Date: s.label, Orders: s.orders, Revenue: s.revenue, Commission: s.commission, Cancelled: s.cancelled })))

  return (
    <div>
      <PageHeader emoji="📈" title="Sales Analytics" subtitle="Performance charts, category insights and demand patterns."
        actions={<><Tabs tabs={[{ id: '7', label: '7D' }, { id: '14', label: '14D' }, { id: '30', label: '30D' }]} value={range} onChange={setRange} /><button onClick={exportCsv} className="btn-outline btn-sm mb-5">⬇ Export CSV</button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross sales" value={`₹${compact(d.gmv)}`} icon="💰" color="emerald" delta={d.gmvDelta} sub="vs previous period" />
        <StatCard label="Avg. order value" value={currency(d.aov)} icon="🧺" color="orange" delta={d.aovDelta} sub="vs previous period" />
        <StatCard label="Cancellation rate" value={`${d.cancelRate}%`} icon="🚫" color="red" sub={`${d.cur.filter((o) => o.status === 'cancelled').length} cancelled`} />
        <StatCard label="Repeat customers" value={`${d.repeat}%`} icon="🔁" color="violet" sub="ordered 2+ times" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card title="Sales & orders over time"><AreaChart data={d.series} series={[{ key: 'revenue', label: 'Revenue', color: '#f95a16' }]} format={(v) => `₹${compact(v)}`} /><div className="mt-4"><AreaChart height={150} data={d.series} series={[{ key: 'orders', label: 'Orders', color: '#8b5cf6' }, { key: 'cancelled', label: 'Cancelled', color: '#ef4444' }]} /></div></Card>
        <div className="space-y-6">
          <Card title="Sales by category"><Donut data={d.category} format={(v) => `₹${compact(v)}`} center={`₹${compact(sum(d.category, (x) => x.value))}`} /></Card>
          <Card title="Payment methods"><Donut data={d.payment} /></Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Orders by day of week"><BarChart data={d.weekday} color="#0ea5e9" /></Card>
        <Card title="Demand heatmap (day × hour)"><Heatmap matrix={d.heat} /></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Top restaurants"><RankList items={d.rests} format={(v) => `₹${compact(v)}`} /></Card>
        <Card title="Best-selling dishes"><RankList items={d.dishes} format={(v) => `${v} sold`} color="from-emerald-500 to-teal-400" sub={(i) => `${i.category} · ${currency(i.revenue)}`} /></Card>
        <Card title="Zone performance"><RankList items={d.zones} format={(v) => `₹${compact(v)}`} color="from-violet-500 to-indigo-400" /></Card>
      </div>
    </div>
  )
}
