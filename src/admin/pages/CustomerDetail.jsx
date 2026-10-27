import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Avatar, Card, Empty, Field, InfoRow, Modal, PageHeader, StatCard, Stars, StatusBadge, Tabs } from '../components/ui'
import { customerStats, fmtDate, fmtDateTime, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'
import { ReasonModal, useTab } from './shared'

export default function CustomerDetail() {
  const { id } = useParams()
  const { customers, orders, refunds, reviews, tickets, update, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('profile')
  const [edit, setEdit] = useState(null)
  const [errs, setErrs] = useState({})
  const [statusFor, setStatusFor] = useState(null)
  const [addr, setAddr] = useState({ label: '', line: '' })
  const c = customers.find((x) => x.id === id)
  const canEdit = can('customers', 'edit')
  const st = useMemo(() => (c ? customerStats(c, orders) : null), [c, orders])

  if (!c) return <Card><Empty emoji="🤷" text="Customer not found" /><div className="text-center"><Link to="/admin/customers" className="btn-primary btn-sm">Back</Link></div></Card>

  const patch = (fn, a) => update('customers', (l) => l.map((x) => (x.id === c.id ? { ...x, ...fn(x) } : x)), a && { module: 'Customers', target: c.name, ...a })
  const myRefunds = refunds.filter((r) => r.customerId === c.id || (!r.customerId && r.customerName === c.name))
  const myReviews = reviews.filter((r) => r.customerId === c.id)
  const myTickets = tickets.filter((t) => t.customerId === c.id)

  const saveContact = () => {
    const e = {}
    if (edit.name.trim().length < 3) e.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(edit.email.trim())) e.email = 'Enter a valid email'
    if (!/^[6-9]\d{9}$/.test(edit.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
    setErrs(e)
    if (Object.keys(e).length) return
    patch(() => ({ name: edit.name.trim(), email: edit.email.trim(), phone: edit.phone.trim() }), { action: 'Updated customer contact info' }); toast('Contact details updated'); setEdit(null)
  }
  const addAddress = (e) => {
    e.preventDefault()
    if (!addr.label.trim() || addr.line.trim().length < 6) return toast('Enter a label and full address', 'error')
    patch((x) => ({ addresses: [...x.addresses, { id: `a${Date.now()}`, label: addr.label.trim(), line: addr.line.trim() }] }), { action: 'Added address' }); setAddr({ label: '', line: '' }); toast('Address added')
  }
  const changeStatus = (status, reason = '') => { patch(() => ({ status, statusReason: reason }), { action: `Account ${status}`, details: reason }); toast(`Account ${status}`) }

  const orderCols = [
    { key: 'id', header: 'Order', render: (o) => <Link to={`/admin/orders/${o.id}`} className="font-bold text-brand-600 hover:underline">#{o.id}</Link> }, { key: 'restaurantName', header: 'Restaurant' },
    { key: 'total', header: 'Total', sortValue: (o) => o.total, render: (o) => currency(o.total) }, { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> }, { key: 'placedAt', header: 'Date', sortValue: (o) => o.placedAt, render: (o) => fmtDateTime(o.placedAt) },
  ]
  const refundCols = [{ key: 'id', header: 'Refund' }, { key: 'orderId', header: 'Order', render: (r) => `#${r.orderId}` }, { key: 'amount', header: 'Amount', render: (r) => currency(r.amount) }, { key: 'reason', header: 'Reason', nowrap: false }, { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> }]

  return (
    <div>
      <Link to="/admin/customers" className="text-sm text-gray-500 hover:text-brand-600">← All customers</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center gap-4">
        <Avatar name={c.name} size="h-16 w-16" color="from-violet-500 to-indigo-400" />
        <div className="flex-1"><h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">{c.name} <StatusBadge status={c.status} /></h1><p className="text-sm text-gray-500">{c.email} · {c.phone} · Joined {fmtDate(c.joinedAt)}</p></div>
        {canEdit && <div className="flex flex-wrap gap-2">
          {c.status === 'active' && <><button className="btn-outline btn-sm" onClick={() => setStatusFor('suspended')}>Suspend</button><button className="btn-danger btn-sm" onClick={() => setStatusFor('blocked')}>Block</button></>}
          {c.status !== 'active' && <button className="btn-success btn-sm" onClick={() => changeStatus('active')}>Reactivate</button>}
        </div>}
      </div>
      {c.statusReason && c.status !== 'active' && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Account {c.status}: {c.statusReason}</p>}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders" value={st.count} icon="🧾" color="orange" /><StatCard label="Total spent" value={currency(st.spent)} icon="💰" color="emerald" /><StatCard label="Avg. order value" value={currency(st.aov)} icon="🧺" color="violet" /><StatCard label="Last order" value={st.lastOrder ? timeAgo(st.lastOrder) : '—'} icon="🕒" color="sky" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Profile' }, { id: 'orders', label: 'Order history', count: st.count }, { id: 'addresses', label: 'Addresses', count: c.addresses.length }, { id: 'refunds', label: 'Refunds', count: myRefunds.length }, { id: 'reviews', label: 'Reviews', count: myReviews.length }, { id: 'complaints', label: 'Complaints', count: myTickets.length }]} />

      {tab === 'profile' && <Card title="Contact information" action={canEdit && <button className="btn-outline btn-sm" onClick={() => { setEdit({ name: c.name, email: c.email, phone: c.phone }); setErrs({}) }}>Edit</button>}><InfoRow k="Full name" v={c.name} /><InfoRow k="Email" v={c.email} /><InfoRow k="Phone" v={c.phone} /><InfoRow k="City" v={c.city} /><InfoRow k="Account status" v={<StatusBadge status={c.status} />} /><InfoRow k="Member since" v={fmtDate(c.joinedAt)} /></Card>}
      {tab === 'orders' && <Card><DataTable columns={orderCols} rows={st.orders} searchKeys={['id', 'restaurantName']} empty="No orders yet" /></Card>}
      {tab === 'addresses' && <Card title="Saved addresses">
        <ul className="space-y-2">{c.addresses.map((a) => <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 text-sm"><span><b>{a.label}</b> — {a.line}</span>{canEdit && <button className="text-xs font-semibold text-red-500 hover:underline" onClick={() => patch((x) => ({ addresses: x.addresses.filter((y) => y.id !== a.id) }), { action: 'Removed address' })}>Remove</button>}</li>)}</ul>
        {canEdit && <form onSubmit={addAddress} className="mt-4 flex flex-wrap gap-2"><input className="input !w-32" placeholder="Label" aria-label="Address label" value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} /><input className="input min-w-[12rem] flex-1" placeholder="Full address" aria-label="Address line" value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} /><button className="btn-primary btn-sm">Add address</button></form>}
      </Card>}
      {tab === 'refunds' && <Card><DataTable columns={refundCols} rows={myRefunds} empty="No refunds" /></Card>}
      {tab === 'reviews' && <Card>{myReviews.length ? <ul className="space-y-3">{myReviews.map((r) => <li key={r.id} className={`rounded-xl border border-gray-100 p-3 text-sm ${r.hidden ? 'opacity-50' : ''}`}><div className="flex justify-between"><b>{r.restaurantName}</b><Stars value={r.rating} /></div><p className="mt-1 text-gray-600">{r.text}</p><div className="mt-2 flex justify-between text-xs text-gray-400"><span>{fmtDate(r.at)}</span>{canEdit && <button className="font-semibold text-brand-600 hover:underline" onClick={() => update('reviews', (l) => l.map((x) => (x.id === r.id ? { ...x, hidden: !x.hidden } : x)), { action: r.hidden ? 'Restored review' : 'Hid review', module: 'Customers', target: c.name })}>{r.hidden ? 'Restore' : 'Hide'}</button>}</div></li>)}</ul> : <Empty emoji="⭐" text="No reviews" />}</Card>}
      {tab === 'complaints' && <Card>{myTickets.length ? <ul className="space-y-3">{myTickets.map((t) => <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 p-3 text-sm"><div><b>{t.id}</b> · {t.subject}<p className="text-xs text-gray-500">{t.category} · {timeAgo(t.createdAt)}</p></div><span className="flex gap-2"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></span></li>)}</ul> : <Empty emoji="🎉" text="No complaints" />}<div className="mt-3 text-right"><Link to="/admin/support" className="text-sm font-semibold text-brand-600 hover:underline">Open support desk →</Link></div></Card>}

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit contact info" size="sm" footer={<><button className="btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" onClick={saveContact}>Save</button></>}>
        {edit && <div className="space-y-3"><Field label="Name" error={errs.name}><input className={`input ${errs.name ? 'input-error' : ''}`} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field><Field label="Email" error={errs.email}><input className={`input ${errs.email ? 'input-error' : ''}`} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field><Field label="Phone" error={errs.phone}><input className={`input ${errs.phone ? 'input-error' : ''}`} maxLength={10} value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field></div>}
      </Modal>
      <ReasonModal open={!!statusFor} danger title={statusFor === 'blocked' ? 'Block customer' : 'Suspend customer'} confirmLabel={statusFor === 'blocked' ? 'Block' : 'Suspend'} onClose={() => setStatusFor(null)} onConfirm={(r) => { changeStatus(statusFor, r); setStatusFor(null) }} />
    </div>
  )
}
