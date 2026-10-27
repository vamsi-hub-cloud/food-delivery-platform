import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { AreaChart } from '../components/Charts'
import { Avatar, Card, Empty, InfoRow, PageHeader, Progress, StatCard, StatusBadge, Tabs, Toggle } from '../components/ui'
import { compact, dailySeries, fmtDate, fmtDateTime, partnerStats } from '../utils/analytics'
import { currency } from '../../utils/format'
import { useTab } from './shared'
import { DOC_LABEL } from './Partners'

export default function PartnerDetail() {
  const { id } = useParams()
  const { partners, orders, payouts, update, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('profile')
  const p = partners.find((x) => x.id === id)
  const edit = can('partners', 'edit')
  const st = useMemo(() => (p ? partnerStats(p, orders) : null), [p, orders])

  if (!p) return <Card><Empty emoji="🤷" text="Partner not found" /><div className="text-center"><Link to="/admin/partners" className="btn-primary btn-sm">Back</Link></div></Card>

  const earningsSeries = dailySeries(st.done.map((o) => ({ ...o, total: o.partnerEarning, commission: 0 })), 14).map((d) => ({ label: d.label, earnings: d.revenue, deliveries: d.orders }))
  const patch = (fn, a) => update('partners', (l) => l.map((x) => (x.id === p.id ? { ...x, ...fn(x) } : x)), a && { module: 'Partners', target: p.name, ...a })
  const setDoc = (k, v) => { patch((x) => ({ docs: { ...x.docs, [k]: v } }), { action: `${v === 'verified' ? 'Verified' : 'Rejected'} ${DOC_LABEL[k]}` }); toast(`${DOC_LABEL[k]} ${v}`) }
  const mine = payouts.filter((x) => x.partnerId === p.id)
  const avgTime = st.done.length ? Math.round(st.done.reduce((s, o) => s + ((o.history.find((h) => h.status === 'delivered')?.at || o.placedAt) - o.placedAt) / 60000, 0) / st.done.length) : 0

  const hist = [
    { key: 'id', header: 'Order', render: (o) => <Link className="font-semibold text-brand-600 hover:underline" to={`/admin/orders/${o.id}`}>#{o.id}</Link> },
    { key: 'restaurantName', header: 'Restaurant' }, { key: 'distanceKm', header: 'Distance', render: (o) => `${o.distanceKm} km` },
    { key: 'earn', header: 'Earned', sortValue: (o) => o.partnerEarning, render: (o) => currency(o.partnerEarning) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'placedAt', header: 'Date', sortValue: (o) => o.placedAt, render: (o) => fmtDateTime(o.placedAt) },
  ]
  const payCols = [{ key: 'id', header: 'Payout' }, { key: 'period', header: 'Period' }, { key: 'deliveries', header: 'Deliveries' }, { key: 'earnings', header: 'Earnings', render: (x) => currency(x.earnings) }, { key: 'incentives', header: 'Incentives', render: (x) => currency(x.incentives) }, { key: 'net', header: 'Net', render: (x) => <b>{currency(x.net)}</b> }, { key: 'status', header: 'Status', render: (x) => <StatusBadge status={x.status} /> }]

  return (
    <div>
      <Link to="/admin/partners" className="text-sm text-gray-500 hover:text-brand-600">← All partners</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center gap-4">
        <Avatar name={p.name} size="h-16 w-16" />
        <div className="flex-1"><h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">{p.name} <StatusBadge status={p.status} /> {p.status === 'approved' && <StatusBadge status={p.online ? 'online' : 'offline'} />}</h1><p className="text-sm text-gray-500">{p.vehicle} · {p.plate} · {p.zone} · Joined {fmtDate(p.joinedAt)}</p></div>
        {p.status === 'approved' && <label className="flex items-center gap-2 text-sm font-semibold">Online <Toggle label="Online" checked={p.online} disabled={!edit} onChange={(v) => { patch(() => ({ online: v }), { action: v ? 'Set partner online' : 'Set partner offline' }); toast(`${p.name} is ${v ? 'online' : 'offline'}`) }} /></label>}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Deliveries" value={st.delivered} icon="📦" color="orange" sub={`${st.active} active`} />
        <StatCard label="Total earnings" value={`₹${compact(st.earnings)}`} icon="💰" color="emerald" />
        <StatCard label="Rating" value={p.rating ? p.rating.toFixed(1) : '—'} icon="⭐" color="amber" />
        <StatCard label="Avg. delivery time" value={avgTime ? `${avgTime} min` : '—'} icon="⏱️" color="sky" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Profile & documents' }, { id: 'performance', label: 'Performance & earnings' }, { id: 'history', label: 'Delivery history', count: st.delivered }, { id: 'payouts', label: 'Payouts', count: mine.length }]} />

      {tab === 'profile' && <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Contact & vehicle"><InfoRow k="Phone" v={p.phone} /><InfoRow k="Email" v={p.email} /><InfoRow k="Vehicle" v={`${p.vehicle} (${p.plate})`} /><InfoRow k="Preferred zone" v={p.zone} /><InfoRow k="Bank account" v={p.bank} />{p.rejectionReason && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">Rejected: {p.rejectionReason}</p>}</Card>
        <Card title="Document verification">
          <ul className="space-y-3">{Object.entries(DOC_LABEL).map(([k, l]) => <li key={k} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"><span className="text-sm font-semibold">📄 {l}</span><span className="flex items-center gap-2"><StatusBadge status={p.docs[k]} />{edit && p.docs[k] !== 'verified' && <button className="btn-success btn-sm" onClick={() => setDoc(k, 'verified')}>Verify</button>}{edit && p.docs[k] === 'pending' && <button className="btn-danger btn-sm" onClick={() => setDoc(k, 'rejected')}>Reject</button>}</span></li>)}</ul>
          {edit && p.status === 'pending' && <button disabled={!Object.values(p.docs).every((d) => d === 'verified')} className="btn-primary mt-4 w-full disabled:opacity-40" onClick={() => { patch(() => ({ status: 'approved' }), { action: 'Approved partner' }); toast('Partner approved') }}>Approve partner</button>}
        </Card>
      </div>}

      {tab === 'performance' && <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Earnings & deliveries — last 14 days"><AreaChart data={earningsSeries} series={[{ key: 'earnings', label: 'Earnings', color: '#10b981' }]} format={(v) => `₹${compact(v)}`} /></Card>
        <Card title="Performance metrics"><div className="space-y-4">{[['On-time delivery', p.onTime, 'from-emerald-500 to-teal-400'], ['Order acceptance', p.acceptance, 'from-sky-500 to-cyan-400'], ['Customer rating', (p.rating / 5) * 100, 'from-amber-500 to-yellow-400']].map(([l, v, c]) => <div key={l}><div className="mb-1 flex justify-between text-sm"><span>{l}</span><b>{l === 'Customer rating' ? p.rating.toFixed(1) : `${v}%`}</b></div><Progress value={v} color={c} /></div>)}<InfoRow k="Total distance" v={`${st.distance} km`} /></div></Card>
      </div>}
      {tab === 'history' && <Card><DataTable columns={hist} rows={st.orders} searchKeys={['id', 'restaurantName']} empty="No deliveries yet" /></Card>}
      {tab === 'payouts' && <Card><DataTable columns={payCols} rows={mine} empty="No payouts yet" /></Card>}
    </div>
  )
}
