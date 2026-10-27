import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Badge, Card, Empty, Field, Modal, PageHeader, StatCard, StatusBadge, Tabs, Toggle, Avatar } from '../components/ui'
import { downloadCSV, fmtDate, partnerStats, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'
import { ReasonModal, useTab } from './shared'

const blank = { name: '', phone: '', email: '', vehicle: 'Bike', plate: '', zone: 'Madhapur' }
const ZONES = ['Jubilee Hills', 'Madhapur', 'Banjara Hills', 'Kukatpally', 'Gachibowli', 'Secunderabad']
const DOC_LABEL = { license: 'Driving licence', aadhaar: 'Aadhaar', rc: 'Vehicle RC', insurance: 'Insurance' }

function TrackCard({ order, partner }) {
  const out = order.history.filter((h) => h.status === 'out_for_delivery').slice(-1)[0]?.at || order.placedAt
  const progress = Math.min(0.95, Math.max(0.05, (Date.now() - out) / (22 * 60000)))
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between text-sm"><Link to={`/admin/orders/${order.id}`} className="font-bold text-brand-600 hover:underline">#{order.id}</Link><Badge tone="orange">ETA ~{Math.max(2, Math.round((1 - progress) * 22))} min</Badge></div>
      <svg viewBox="0 0 300 90" className="mt-2 w-full" role="img" aria-label="Delivery route">
        <rect width="300" height="90" rx="12" fill="#f8fafc" />
        <path d="M30 60 C90 10, 200 90, 270 30" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 6" />
        <motion.path d="M30 60 C90 10, 200 90, 270 30" fill="none" stroke="#f95a16" strokeWidth="3.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1 }} />
        <text x="30" y="68" textAnchor="middle" fontSize="20">🏪</text><text x="270" y="38" textAnchor="middle" fontSize="20">🏠</text>
        <motion.text fontSize="20" textAnchor="middle" initial={{ x: 30, y: 52 }} animate={{ x: 30 + progress * 240, y: 52 - Math.sin(progress * Math.PI) * 14 + progress * -12 }} transition={{ duration: 1 }}>🛵</motion.text>
      </svg>
      <p className="mt-1 text-xs text-gray-500">{order.restaurantName} → {order.address}</p>
      <p className="mt-1 text-xs"><b>{partner ? partner.name : 'Unassigned'}</b>{partner && <span className="text-gray-400"> · {partner.phone}</span>}</p>
    </div>
  )
}

export default function Partners() {
  const { partners, orders, update, assignPartner, can } = useAdmin()
  const toast = useToast()
  const nav = useNavigate()
  const [tab, setTab] = useTab('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [reject, setReject] = useState(null)
  const edit = can('partners', 'edit')

  const stats = useMemo(() => Object.fromEntries(partners.map((p) => [p.id, partnerStats(p, orders)])), [partners, orders])
  const approved = partners.filter((p) => p.status === 'approved')
  const eligible = approved.filter((p) => p.online)
  const activeOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status))
  const tracking = orders.filter((o) => o.status === 'out_for_delivery')
  const verification = partners.filter((p) => p.status !== 'approved')
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })) }

  const register = () => {
    const er = {}
    if (form.name.trim().length < 3) er.name = 'Full name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) er.phone = 'Enter a valid 10-digit mobile number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) er.email = 'Enter a valid email'
    if (!/^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/.test(form.plate.replace(/[\s-]/g, '').toUpperCase())) er.plate = 'Enter a valid plate (e.g. TS09AB1234)'
    setErrors(er)
    if (Object.keys(er).length) return
    update('partners', (l) => [...l, { id: `p${Date.now().toString().slice(-6)}`, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), vehicle: form.vehicle, plate: form.plate.replace(/[\s-]/g, '').toUpperCase(), zone: form.zone, status: 'pending', docs: { license: 'pending', aadhaar: 'pending', rc: 'pending', insurance: 'pending' }, online: false, rating: 0, acceptance: 0, onTime: 0, joinedAt: Date.now(), bank: '—' }], { action: 'Registered delivery partner', module: 'Partners', target: form.name.trim() })
    toast('Partner registered — pending verification'); setOpen(false); setForm(blank); setTab('verification')
  }
  const setStatus = (p, status, reason = '') => { update('partners', (l) => l.map((x) => (x.id === p.id ? { ...x, status, online: status === 'approved' ? x.online : false, rejectionReason: reason } : x)), { action: `Partner ${status}`, module: 'Partners', target: p.name, details: reason }); toast(`${p.name}: ${status}`) }
  const toggleOnline = (p, v) => { update('partners', (l) => l.map((x) => (x.id === p.id ? { ...x, online: v } : x)), { action: v ? 'Set partner online' : 'Set partner offline', module: 'Partners', target: p.name }); toast(`${p.name} is ${v ? 'online' : 'offline'}`) }

  const autoAssign = () => {
    const load = Object.fromEntries(eligible.map((p) => [p.id, stats[p.id].active]))
    let n = 0
    activeOrders.filter((o) => !o.partnerId).forEach((o) => {
      const pool = eligible.filter((p) => o.zone?.toLowerCase().includes(p.zone.split(' ')[0].toLowerCase()))
      const list = (pool.length ? pool : eligible).sort((a, b) => load[a.id] - load[b.id])
      if (list[0]) { assignPartner(o.id, list[0].id); load[list[0].id]++; n++ }
    })
    toast(n ? `Auto-assigned ${n} order(s)` : 'No unassigned orders / no partners online', n ? 'success' : 'error')
  }

  const baseCols = [
    { key: 'name', header: 'Partner', render: (p) => <div className="flex items-center gap-3"><Avatar name={p.name} /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-gray-500">{p.phone}</p></div></div> },
    { key: 'vehicle', header: 'Vehicle', render: (p) => <span>{p.vehicle} <span className="text-xs text-gray-400">{p.plate}</span></span> },
    { key: 'zone', header: 'Zone' },
  ]
  const allCols = [...baseCols,
    { key: 'status', header: 'KYC', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'online', header: 'Status', sortValue: (p) => Number(p.online), render: (p) => <StatusBadge status={p.online ? 'online' : 'offline'} /> },
    { key: 'rating', header: 'Rating', render: (p) => (p.rating ? `★ ${p.rating.toFixed(1)}` : '—') },
    { key: 'deliveries', header: 'Deliveries', sortValue: (p) => stats[p.id].delivered, render: (p) => stats[p.id].delivered },
    { key: 'earn', header: 'Earnings', sortValue: (p) => stats[p.id].earnings, render: (p) => currency(stats[p.id].earnings) },
    { key: 'v', header: '', sortable: false, align: 'right', render: (p) => <Link to={`/admin/partners/${p.id}`} className="btn-outline btn-sm" onClick={(e) => e.stopPropagation()}>Profile</Link> },
  ]
  const verCols = [...baseCols,
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'docs', header: 'Documents', sortable: false, render: (p) => <div className="flex gap-1">{Object.entries(p.docs).map(([k, v]) => <Badge key={k} tone={v === 'verified' ? 'green' : v === 'rejected' ? 'red' : 'amber'}>{DOC_LABEL[k].split(' ')[0]}</Badge>)}</div> },
    { key: 'a', header: '', sortable: false, align: 'right', render: (p) => <span className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>{edit && p.status === 'pending' && <><button disabled={!Object.values(p.docs).every((d) => d === 'verified')} title="All documents must be verified" className="btn-success btn-sm disabled:opacity-40" onClick={() => setStatus(p, 'approved')}>Approve</button><button className="btn-danger btn-sm" onClick={() => setReject(p)}>Reject</button></>}<Link to={`/admin/partners/${p.id}`} className="btn-outline btn-sm">Verify docs</Link></span> },
  ]
  const liveCols = [...baseCols,
    { key: 'online', header: 'Online', sortable: false, render: (p) => <Toggle label={`${p.name} online`} checked={p.online} disabled={!edit} onChange={(v) => toggleOnline(p, v)} /> },
    { key: 'active', header: 'Active orders', sortValue: (p) => stats[p.id].active, render: (p) => stats[p.id].active },
    { key: 'acc', header: 'Acceptance', render: (p) => `${p.acceptance}%` },
  ]

  return (
    <div>
      <PageHeader emoji="🛵" title="Delivery Partner Management" subtitle="Onboard riders, verify documents, assign orders and monitor performance."
        actions={<>{can('partners', 'create') && <button className="btn-primary btn-sm" onClick={() => setOpen(true)}>+ Register partner</button>}<button className="btn-outline btn-sm" onClick={() => downloadCSV('partners.csv', partners.map((p) => ({ Name: p.name, Phone: p.phone, Vehicle: p.vehicle, Zone: p.zone, KYC: p.status, Online: p.online, Deliveries: stats[p.id].delivered, Earnings: stats[p.id].earnings })))}>⬇ Export</button></>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total partners" value={approved.length} icon="🛵" color="orange" />
        <StatCard label="Online now" value={eligible.length} icon="🟢" color="emerald" onClick={() => setTab('status')} />
        <StatCard label="Pending verification" value={partners.filter((p) => p.status === 'pending').length} icon="📄" color="amber" onClick={() => setTab('verification')} />
        <StatCard label="Unassigned orders" value={activeOrders.filter((o) => !o.partnerId).length} icon="📦" color="red" onClick={() => setTab('assignment')} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All partners', count: partners.length }, { id: 'verification', label: 'Registration & verification', count: verification.length }, { id: 'status', label: 'Online / offline' }, { id: 'assignment', label: 'Order assignment' }, { id: 'tracking', label: 'Live tracking', count: tracking.length }]} />

      {tab === 'all' && <Card><DataTable key="a" columns={allCols} rows={partners} searchKeys={['name', 'phone', 'zone', 'plate']} searchPlaceholder="Search partners…" onRowClick={(p) => nav(`/admin/partners/${p.id}`)} /></Card>}
      {tab === 'verification' && <Card><DataTable key="v" columns={verCols} rows={verification} searchKeys={['name', 'phone']} onRowClick={(p) => nav(`/admin/partners/${p.id}`)} empty="No pending applications 🎉" /></Card>}
      {tab === 'status' && <Card><DataTable key="s" columns={liveCols} rows={approved} searchKeys={['name', 'zone']} /></Card>}
      {tab === 'assignment' && (
        <Card title="Active orders" action={edit && <button className="btn-primary btn-sm" onClick={autoAssign}>⚡ Auto-assign all</button>}>
          {activeOrders.length ? <div className="divide-y divide-gray-100">{activeOrders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
              <Link to={`/admin/orders/${o.id}`} className="w-28 font-bold text-brand-600 hover:underline">#{o.id}</Link>
              <div className="min-w-[10rem] flex-1"><p className="font-medium">{o.restaurantName}</p><p className="text-xs text-gray-500">{o.zone} → {o.address}</p></div>
              <StatusBadge status={o.status} />
              <select aria-label={`Assign partner for ${o.id}`} disabled={!edit} className="input !w-52 !py-1.5" value={o.partnerId || ''} onChange={(e) => { assignPartner(o.id, e.target.value); toast(e.target.value ? 'Partner assigned' : 'Partner removed') }}>
                <option value="">— Unassigned —</option>{eligible.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.zone} ({stats[p.id].active})</option>)}
                {o.partnerId && !eligible.find((p) => p.id === o.partnerId) && <option value={o.partnerId}>{partners.find((p) => p.id === o.partnerId)?.name}</option>}
              </select>
            </div>))}</div> : <Empty emoji="✅" text="No active orders to assign" />}
        </Card>
      )}
      {tab === 'tracking' && (tracking.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{tracking.map((o) => <TrackCard key={o.id} order={o} partner={partners.find((p) => p.id === o.partnerId)} />)}</div> : <Card><Empty emoji="🛵" text="No deliveries in progress right now" /></Card>)}

      <Modal open={open} onClose={() => setOpen(false)} title="Register delivery partner" footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={register}>Register</button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}><input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} /></Field>
          <Field label="Mobile" error={errors.phone}><input inputMode="numeric" maxLength={10} className={`input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Email" error={errors.email} className="sm:col-span-2"><input className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} /></Field>
          <Field label="Vehicle"><select className="input" value={form.vehicle} onChange={set('vehicle')}>{['Bike', 'Scooter', 'EV Bike'].map((v) => <option key={v}>{v}</option>)}</select></Field>
          <Field label="Number plate" error={errors.plate}><input className={`input uppercase ${errors.plate ? 'input-error' : ''}`} value={form.plate} onChange={set('plate')} placeholder="TS09AB1234" /></Field>
          <Field label="Preferred zone" className="sm:col-span-2"><select className="input" value={form.zone} onChange={set('zone')}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
        </div>
      </Modal>
      <ReasonModal open={!!reject} danger title={`Reject ${reject?.name}`} confirmLabel="Reject" onClose={() => setReject(null)} onConfirm={(r) => { setStatus(reject, 'rejected', r); setReject(null) }} />
    </div>
  )
}
export { DOC_LABEL }
