import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Badge, Card, Field, Modal, PageHeader, StatCard, StatusBadge, Tabs, Toggle } from '../components/ui'
import { downloadCSV, fmtDate } from '../utils/analytics'
import { ReasonModal, useTab } from './shared'
import SafeImage from '../../components/SafeImage'

const DOCS = { fssai: 'FSSAI licence', gst: 'GST certificate', pan: 'PAN card', bank: 'Bank details' }
const blank = { name: '', owner: '', email: '', phone: '', address: '', area: '', cuisines: '', commission: '18', fssai: '', gst: '', pan: '' }

export function validateRestaurant(f) {
  const e = {}
  if (f.name.trim().length < 3) e.name = 'Restaurant name is required (min. 3 characters)'
  if (f.owner.trim().length < 3) e.owner = 'Owner name is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email'
  if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
  if (f.address.trim().length < 8) e.address = 'Enter the full address'
  if (!f.area.trim()) e.area = 'Area is required'
  if (!f.cuisines.trim()) e.cuisines = 'Add at least one cuisine'
  const c = Number(f.commission)
  if (Number.isNaN(c) || c < 0 || c > 40) e.commission = 'Commission must be between 0 and 40%'
  if (!/^\d{14}$/.test(f.fssai.trim())) e.fssai = 'FSSAI number must be 14 digits'
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(f.gst.trim().toUpperCase())) e.gst = 'Enter a valid 15-character GSTIN'
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(f.pan.trim().toUpperCase())) e.pan = 'Enter a valid PAN (e.g. ABCDE1234F)'
  return e
}

export default function Restaurants() {
  const { restaurants, orders, update, can } = useAdmin()
  const toast = useToast()
  const nav = useNavigate()
  const [tab, setTab] = useTab('listing')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [reject, setReject] = useState(null)
  const edit = can('restaurants', 'edit')

  const orderCount = useMemo(() => { const m = {}; orders.forEach((o) => { m[o.restaurantId] = (m[o.restaurantId] || 0) + 1 }); return m }, [orders])
  const listing = restaurants.filter((r) => r.status === 'approved' || r.status === 'suspended')
  const regs = restaurants.filter((r) => r.status !== 'approved')
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })) }

  const register = () => {
    const er = validateRestaurant(form)
    setErrors(er)
    if (Object.keys(er).length) return
    const id = `r${Date.now().toString().slice(-6)}`
    update('restaurants', (r) => [...r, {
      id, name: form.name.trim(), owner: form.owner.trim(), email: form.email.trim(), phone: `+91 ${form.phone.trim()}`, area: form.area.trim(), city: 'Hyderabad', address: form.address.trim(),
      cuisines: form.cuisines.split(',').map((c) => c.trim()).filter(Boolean), status: 'pending', verification: { fssai: 'pending', gst: 'pending', pan: 'pending', bank: 'pending' },
      commission: Number(form.commission), rating: 0, reviewsCount: 0, isOpen: false, acceptingOrders: false, joinedAt: Date.now(), minOrder: 149, prepTime: 25, deliveryFee: 30, image: null, categories: [], menu: [],
      hours: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, open: '11:00', close: '23:00', closed: false })), docNumbers: { fssai: form.fssai.trim(), gst: form.gst.trim().toUpperCase(), pan: form.pan.trim().toUpperCase() },
    }], { action: 'Registered restaurant', module: 'Restaurants', target: form.name.trim() })
    toast('Restaurant registered — awaiting approval'); setOpen(false); setForm(blank); setTab('registrations')
  }

  const setStatus = (r, status, reason = '') => {
    update('restaurants', (list) => list.map((x) => (x.id === r.id ? { ...x, status, rejectionReason: reason, isOpen: status === 'approved' ? x.isOpen : false } : x)), { action: `${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'} restaurant`, module: 'Restaurants', target: r.name, details: reason })
    toast(`${r.name}: ${status}`)
  }
  const verifiedAll = (r) => Object.values(r.verification).every((v) => v === 'verified')

  const cols = [
    { key: 'name', header: 'Restaurant', render: (r) => <div className="flex items-center gap-3"><SafeImage src={r.image} alt="" className="h-10 w-10 rounded-lg" fallback="🍽️" /><div><p className="font-semibold">{r.name}</p><p className="text-xs text-gray-500">{r.area} · {r.owner}</p></div></div> },
    { key: 'cuisines', header: 'Cuisines', sortable: false, render: (r) => r.cuisines.join(', ') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'rating', header: 'Rating', render: (r) => (r.rating ? <b className="text-emerald-600">★ {r.rating.toFixed(1)}</b> : <span className="text-gray-400">New</span>) },
    { key: 'commission', header: 'Commission', render: (r) => `${r.commission}%` },
    { key: 'orders', header: 'Orders', sortValue: (r) => orderCount[r.id] || 0, render: (r) => orderCount[r.id] || 0 },
    { key: 'isOpen', header: 'Open now', sortable: false, render: (r) => <span onClick={(e) => e.stopPropagation()}><Toggle label={`Toggle ${r.name} open`} checked={r.isOpen} disabled={!edit || r.status !== 'approved'} onChange={(v) => { update('restaurants', (l) => l.map((x) => (x.id === r.id ? { ...x, isOpen: v } : x)), { action: v ? 'Opened restaurant' : 'Closed restaurant', module: 'Restaurants', target: r.name }); toast(`${r.name} is now ${v ? 'open' : 'closed'}`) }} /></span> },
    { key: 'view', header: '', sortable: false, align: 'right', render: (r) => <Link to={`/admin/restaurants/${r.id}`} className="btn-outline btn-sm" onClick={(e) => e.stopPropagation()}>Manage</Link> },
  ]
  const regCols = [
    { key: 'name', header: 'Applicant', render: (r) => <div><p className="font-semibold">{r.name}</p><p className="text-xs text-gray-500">{r.owner} · {r.email}</p></div> },
    { key: 'joinedAt', header: 'Applied', sortValue: (r) => r.joinedAt, render: (r) => fmtDate(r.joinedAt) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'docs', header: 'Verification', sortable: false, render: (r) => <div className="flex gap-1">{Object.entries(r.verification).map(([k, v]) => <Badge key={k} tone={v === 'verified' ? 'green' : v === 'rejected' ? 'red' : 'amber'} className="uppercase">{k}</Badge>)}</div> },
    { key: 'actions', header: '', sortable: false, align: 'right', render: (r) => (
      <span className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        {edit && r.status === 'pending' && <><button className="btn-success btn-sm disabled:opacity-40" disabled={!verifiedAll(r)} title={verifiedAll(r) ? 'Approve' : 'Verify all documents first'} onClick={() => setStatus(r, 'approved')}>Approve</button><button className="btn-danger btn-sm" onClick={() => setReject(r)}>Reject</button></>}
        {edit && r.status === 'suspended' && <button className="btn-success btn-sm" onClick={() => setStatus(r, 'approved')}>Reinstate</button>}
        <Link to={`/admin/restaurants/${r.id}`} className="btn-outline btn-sm">Review</Link>
      </span>) },
  ]

  return (
    <div>
      <PageHeader emoji="🏪" title="Restaurant & Menu Management" subtitle="Onboard, verify and manage partner restaurants."
        actions={<>{can('restaurants', 'create') && <button className="btn-primary btn-sm" onClick={() => setOpen(true)}>+ Register restaurant</button>}<button className="btn-outline btn-sm" onClick={() => downloadCSV('restaurants.csv', restaurants.map((r) => ({ Name: r.name, Owner: r.owner, Area: r.area, Status: r.status, Commission: r.commission, Rating: r.rating })))}>⬇ Export</button></>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Live restaurants" value={restaurants.filter((r) => r.status === 'approved').length} icon="🏪" color="emerald" />
        <StatCard label="Open now" value={restaurants.filter((r) => r.isOpen).length} icon="🟢" color="sky" />
        <StatCard label="Awaiting approval" value={restaurants.filter((r) => r.status === 'pending').length} icon="⏳" color="amber" onClick={() => setTab('registrations')} />
        <StatCard label="Avg. commission" value={`${Math.round(restaurants.filter((r) => r.status === 'approved').reduce((s, r) => s + r.commission, 0) / Math.max(1, restaurants.filter((r) => r.status === 'approved').length))}%`} icon="🏦" color="violet" />
      </div>
      <Tabs tabs={[{ id: 'listing', label: 'Restaurant listing', count: listing.length }, { id: 'registrations', label: 'Registrations & approval', count: regs.length }]} value={tab} onChange={setTab} />
      <Card>
        {tab === 'listing'
          ? <DataTable key="l" columns={cols} rows={listing} searchKeys={['name', 'area', 'owner', (r) => r.cuisines.join(' ')]} searchPlaceholder="Search restaurants…" onRowClick={(r) => nav(`/admin/restaurants/${r.id}`)} />
          : <DataTable key="r" columns={regCols} rows={regs} searchKeys={['name', 'owner', 'email']} searchPlaceholder="Search applications…" onRowClick={(r) => nav(`/admin/restaurants/${r.id}`)} />}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Register new restaurant" size="lg" footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={register}>Submit for approval</button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Restaurant name" error={errors.name}><input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} /></Field>
          <Field label="Owner name" error={errors.owner}><input className={`input ${errors.owner ? 'input-error' : ''}`} value={form.owner} onChange={set('owner')} /></Field>
          <Field label="Email" error={errors.email}><input className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} /></Field>
          <Field label="Mobile" error={errors.phone}><input inputMode="numeric" maxLength={10} className={`input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Address" error={errors.address} className="sm:col-span-2"><input className={`input ${errors.address ? 'input-error' : ''}`} value={form.address} onChange={set('address')} /></Field>
          <Field label="Area" error={errors.area}><input className={`input ${errors.area ? 'input-error' : ''}`} value={form.area} onChange={set('area')} /></Field>
          <Field label="Cuisines" error={errors.cuisines} hint="Comma separated"><input className={`input ${errors.cuisines ? 'input-error' : ''}`} value={form.cuisines} onChange={set('cuisines')} placeholder="Pizza, Italian" /></Field>
          <Field label="FSSAI number" error={errors.fssai}><input inputMode="numeric" maxLength={14} className={`input ${errors.fssai ? 'input-error' : ''}`} value={form.fssai} onChange={set('fssai')} /></Field>
          <Field label="GSTIN" error={errors.gst}><input maxLength={15} className={`input uppercase ${errors.gst ? 'input-error' : ''}`} value={form.gst} onChange={set('gst')} placeholder="36ABCDE1234F1Z5" /></Field>
          <Field label="PAN" error={errors.pan}><input maxLength={10} className={`input uppercase ${errors.pan ? 'input-error' : ''}`} value={form.pan} onChange={set('pan')} placeholder="ABCDE1234F" /></Field>
          <Field label="Commission (%)" error={errors.commission}><input type="number" className={`input ${errors.commission ? 'input-error' : ''}`} value={form.commission} onChange={set('commission')} /></Field>
        </div>
      </Modal>
      <ReasonModal open={!!reject} danger title={`Reject ${reject?.name}`} confirmLabel="Reject application" onClose={() => setReject(null)} onConfirm={(reason) => { setStatus(reject, 'rejected', reason); setReject(null) }} />
    </div>
  )
}
export { DOCS }
