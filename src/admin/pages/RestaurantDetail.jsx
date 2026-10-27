import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Badge, Card, Empty, Field, InfoRow, Modal, PageHeader, StatCard, Stars, StatusBadge, Tabs, Toggle } from '../components/ui'
import { fmtDate } from '../utils/analytics'
import { currency } from '../../utils/format'
import { ReasonModal, useTab } from './shared'
import { DOCS } from './Restaurants'
import SafeImage from '../../components/SafeImage'

export default function RestaurantDetail() {
  const { id } = useParams()
  const { restaurants, reviews, orders, update, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('overview')
  const [reject, setReject] = useState(null)
  const [itemForm, setItemForm] = useState(null)
  const [itemErr, setItemErr] = useState({})
  const [newCat, setNewCat] = useState('')
  const [commission, setCommission] = useState(null)
  const r = restaurants.find((x) => x.id === id)
  const edit = can('restaurants', 'edit')

  if (!r) return <Card><Empty emoji="🤷" text="Restaurant not found" /><div className="text-center"><Link to="/admin/restaurants" className="btn-primary btn-sm">Back</Link></div></Card>

  const patch = (p, a) => update('restaurants', (l) => l.map((x) => (x.id === r.id ? { ...x, ...(typeof p === 'function' ? p(x) : p) } : x)), a && { module: 'Restaurants', target: r.name, ...a })
  const myOrders = orders.filter((o) => o.restaurantId === r.id)
  const revenue = myOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const myReviews = reviews.filter((v) => v.restaurantId === r.id)
  const comm = commission ?? String(r.commission)
  const allVerified = Object.values(r.verification).every((v) => v === 'verified')

  const setDoc = (k, v) => { patch((x) => ({ verification: { ...x.verification, [k]: v } }), { action: `${v === 'verified' ? 'Verified' : 'Rejected'} ${DOCS[k]}` }); toast(`${DOCS[k]} ${v}`) }
  const setStatus = (status, reason = '') => { patch({ status, rejectionReason: reason, isOpen: status === 'approved' ? r.isOpen : false, acceptingOrders: status === 'approved' }, { action: `Restaurant ${status}`, details: reason }); toast(`Restaurant ${status}`) }

  const saveItem = () => {
    const e = {}
    if (itemForm.name.trim().length < 2) e.name = 'Name is required'
    const price = Number(itemForm.price)
    if (!price || price <= 0) e.price = 'Enter a valid price'
    if (!itemForm.category) e.category = 'Choose a category'
    setItemErr(e)
    if (Object.keys(e).length) return
    const it = { ...itemForm, name: itemForm.name.trim(), price, id: itemForm.id || `m${Date.now()}`, emoji: itemForm.emoji || '🍽️' }
    patch((x) => ({ menu: itemForm.id ? x.menu.map((m) => (m.id === it.id ? it : m)) : [...x.menu, it] }), { action: itemForm.id ? 'Updated menu item' : 'Added menu item', details: it.name })
    toast(itemForm.id ? 'Menu item updated' : 'Menu item added'); setItemForm(null)
  }

  const menuCols = [
    { key: 'name', header: 'Item', render: (m) => <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-50 text-xl">{m.emoji}</span><div><p className="font-semibold">{m.name}</p><p className="max-w-[16rem] truncate text-xs text-gray-500">{m.desc}</p></div></div> },
    { key: 'category', header: 'Category' },
    { key: 'veg', header: 'Type', sortable: false, render: (m) => <Badge tone={m.veg ? 'green' : 'red'}>{m.veg ? 'Veg' : 'Non-veg'}</Badge> },
    { key: 'price', header: 'Price', sortValue: (m) => m.price, render: (m) => <b>{currency(m.price)}</b> },
    { key: 'available', header: 'Available', sortable: false, render: (m) => <Toggle label={`Toggle ${m.name}`} checked={m.available} disabled={!edit} onChange={(v) => patch((x) => ({ menu: x.menu.map((i) => (i.id === m.id ? { ...i, available: v } : i)) }), { action: v ? 'Enabled item' : 'Disabled item', details: m.name })} /> },
    { key: 'act', header: '', sortable: false, align: 'right', render: (m) => edit && <span className="flex justify-end gap-1.5"><button className="btn-outline btn-sm" onClick={() => { setItemForm({ ...m }); setItemErr({}) }}>Edit</button><button className="btn-danger btn-sm" onClick={() => { patch((x) => ({ menu: x.menu.filter((i) => i.id !== m.id) }), { action: 'Deleted menu item', details: m.name }); toast('Item deleted') }}>Delete</button></span> },
  ]

  const saveComm = () => {
    const c = Number(comm)
    if (Number.isNaN(c) || c < 0 || c > 40) return toast('Commission must be between 0 and 40%', 'error')
    patch({ commission: c }, { action: `Updated commission to ${c}%` }); toast('Commission updated'); setCommission(null)
  }
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: myReviews.filter((v) => v.rating === s).length }))

  return (
    <div>
      <Link to="/admin/restaurants" className="text-sm text-gray-500 hover:text-brand-600">← All restaurants</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center gap-4">
        <SafeImage src={r.image} alt={r.name} className="h-16 w-16 rounded-2xl" fallback="🍽️" />
        <div className="min-w-0 flex-1"><h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">{r.name} <StatusBadge status={r.status} /></h1><p className="text-sm text-gray-500">{r.cuisines.join(' • ')} · {r.area} · Joined {fmtDate(r.joinedAt)}</p></div>
        {edit && <div className="flex flex-wrap gap-2">
          {r.status === 'pending' && <><button className="btn-success btn-sm disabled:opacity-40" disabled={!allVerified} title={allVerified ? '' : 'Verify all documents first'} onClick={() => setStatus('approved')}>Approve</button><button className="btn-danger btn-sm" onClick={() => setReject('reject')}>Reject</button></>}
          {r.status === 'approved' && <button className="btn-danger btn-sm" onClick={() => setReject('suspend')}>Suspend</button>}
          {(r.status === 'suspended' || r.status === 'rejected') && <button className="btn-success btn-sm" onClick={() => setStatus('approved')}>Reinstate</button>}
        </div>}
      </div>
      {r.rejectionReason && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Reason: {r.rejectionReason}</p>}

      <Tabs tabs={[{ id: 'overview', label: 'Overview & verification' }, { id: 'menu', label: 'Menu', count: r.menu.length }, { id: 'hours', label: 'Operating hours' }, { id: 'commission', label: 'Commission & ratings' }]} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Business details">
            <InfoRow k="Owner" v={r.owner} /><InfoRow k="Email" v={r.email} /><InfoRow k="Phone" v={r.phone} /><InfoRow k="Address" v={r.address} />
            <InfoRow k="Min. order" v={currency(r.minOrder)} /><InfoRow k="Avg. prep time" v={`${r.prepTime} min`} /><InfoRow k="Total orders" v={myOrders.length} /><InfoRow k="Revenue" v={currency(revenue)} />
          </Card>
          <Card title="Document verification">
            <ul className="space-y-3">
              {Object.entries(DOCS).map(([k, l]) => (
                <li key={k} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                  <div><p className="text-sm font-semibold">📄 {l}</p>{r.docNumbers?.[k] && <p className="text-xs text-gray-400">{r.docNumbers[k]}</p>}</div>
                  <div className="flex items-center gap-2"><StatusBadge status={r.verification[k]} />{edit && r.verification[k] !== 'verified' && <button className="btn-success btn-sm" onClick={() => setDoc(k, 'verified')}>Verify</button>}{edit && r.verification[k] === 'pending' && <button className="btn-danger btn-sm" onClick={() => setDoc(k, 'rejected')}>Reject</button>}</div>
                </li>
              ))}
            </ul>
            {allVerified && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">✅ All documents verified.</p>}
          </Card>
        </div>
      )}

      {tab === 'menu' && (
        <div className="space-y-6">
          <Card title="Food categories" action={edit && <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const c = newCat.trim(); if (!c) return; if (r.categories.some((x) => x.toLowerCase() === c.toLowerCase())) return toast('Category already exists', 'error'); patch((x) => ({ categories: [...x.categories, c] }), { action: 'Added category', details: c }); setNewCat('') }}><input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" className="input !py-1.5" aria-label="New category" /><button className="btn-primary btn-sm">Add</button></form>}>
            <div className="flex flex-wrap gap-2">
              {r.categories.map((c) => { const n = r.menu.filter((m) => m.category === c).length; return <span key={c} className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-brand-700">{c} <span className="rounded-full bg-white px-1.5 text-xs">{n}</span>{edit && <button aria-label={`Delete ${c}`} onClick={() => { if (n) return toast('Move or delete the items in this category first', 'error'); patch((x) => ({ categories: x.categories.filter((y) => y !== c) }), { action: 'Deleted category', details: c }) }} className="text-gray-400 hover:text-red-500">✕</button>}</span> })}
              {!r.categories.length && <p className="text-sm text-gray-400">No categories yet.</p>}
            </div>
          </Card>
          <Card title="Menu items & pricing" action={edit && <button className="btn-primary btn-sm" onClick={() => { setItemForm({ name: '', desc: '', price: '', category: r.categories[0] || '', veg: true, available: true, emoji: '🍽️' }); setItemErr({}) }}>+ Add item</button>}>
            <DataTable columns={menuCols} rows={r.menu} searchKeys={['name', 'category']} searchPlaceholder="Search menu…" pageSize={8} empty="No menu items yet" />
          </Card>
        </div>
      )}

      {tab === 'hours' && (
        <Card title="Operating hours & availability">
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm font-semibold">Open now <Toggle label="Open now" checked={r.isOpen} disabled={!edit || r.status !== 'approved'} onChange={(v) => patch({ isOpen: v }, { action: v ? 'Opened restaurant' : 'Closed restaurant' })} /></div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm font-semibold">Accepting orders <Toggle label="Accepting orders" checked={r.acceptingOrders} disabled={!edit} onChange={(v) => patch({ acceptingOrders: v }, { action: v ? 'Enabled order acceptance' : 'Paused order acceptance' })} /></div>
            <Field label="Avg. prep time (min)"><input type="number" min="5" className="input" disabled={!edit} value={r.prepTime} onChange={(e) => patch({ prepTime: Math.max(0, Number(e.target.value)) })} /></Field>
          </div>
          <div className="divide-y divide-gray-100">
            {r.hours.map((h, i) => (
              <div key={h.day} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-12 font-semibold">{h.day}</span>
                <Toggle label={`${h.day} open`} checked={!h.closed} disabled={!edit} onChange={(v) => patch((x) => ({ hours: x.hours.map((d, k) => (k === i ? { ...d, closed: !v } : d)) }), { action: `${v ? 'Opened' : 'Closed'} on ${h.day}` })} />
                {h.closed ? <span className="text-sm text-gray-400">Closed all day</span> : <>
                  <input type="time" aria-label={`${h.day} opens`} className="input !w-auto !py-1.5" disabled={!edit} value={h.open} onChange={(e) => patch((x) => ({ hours: x.hours.map((d, k) => (k === i ? { ...d, open: e.target.value } : d)) }))} />
                  <span className="text-gray-400">to</span>
                  <input type="time" aria-label={`${h.day} closes`} className="input !w-auto !py-1.5" disabled={!edit} value={h.close} onChange={(e) => patch((x) => ({ hours: x.hours.map((d, k) => (k === i ? { ...d, close: e.target.value } : d)) }))} />
                </>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'commission' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <Card title="Commission settings">
              <p className="mb-3 text-sm text-gray-500">Percentage of each order subtotal retained by FoodiGo.</p>
              <div className="flex gap-2"><input type="number" min="0" max="40" className="input" disabled={!edit} value={comm} onChange={(e) => setCommission(e.target.value)} aria-label="Commission percent" /><button className="btn-primary" disabled={!edit} onClick={saveComm}>Save</button></div>
              <p className="mt-3 text-sm">Commission earned: <b className="text-violet-600">{currency(myOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.commission, 0))}</b></p>
            </Card>
            <Card title="Rating summary">
              <div className="flex items-end gap-3"><p className="text-4xl font-extrabold">{r.rating ? r.rating.toFixed(1) : '—'}</p><Stars value={r.rating} /></div>
              <div className="mt-3 space-y-1.5">{dist.map((d) => <div key={d.s} className="flex items-center gap-2 text-xs"><span className="w-6">{d.s}★</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${myReviews.length ? (d.n / myReviews.length) * 100 : 0}%` }} /></div><span className="w-5 text-right text-gray-500">{d.n}</span></div>)}</div>
            </Card>
          </div>
          <Card title={`Customer reviews (${myReviews.length})`}>
            {myReviews.length ? <ul className="space-y-3">{myReviews.slice(0, 8).map((v) => <li key={v.id} className={`rounded-xl border border-gray-100 p-3 text-sm ${v.hidden ? 'opacity-50' : ''}`}><div className="flex items-center justify-between"><b>{v.customerName}</b><Stars value={v.rating} /></div><p className="mt-1 text-gray-600">{v.text}</p><div className="mt-2 flex items-center justify-between text-xs text-gray-400"><span>{fmtDate(v.at)}</span>{edit && <button className="font-semibold text-brand-600 hover:underline" onClick={() => update('reviews', (l) => l.map((x) => (x.id === v.id ? { ...x, hidden: !x.hidden } : x)), { action: v.hidden ? 'Restored review' : 'Hid review', module: 'Restaurants', target: r.name })}>{v.hidden ? 'Restore' : 'Hide'}</button>}</div></li>)}</ul> : <Empty emoji="⭐" text="No reviews yet" />}
          </Card>
        </div>
      )}

      <Modal open={!!itemForm} onClose={() => setItemForm(null)} title={itemForm?.id ? 'Edit menu item' : 'Add menu item'} footer={<><button className="btn-outline" onClick={() => setItemForm(null)}>Cancel</button><button className="btn-primary" onClick={saveItem}>Save item</button></>}>
        {itemForm && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name" error={itemErr.name} className="sm:col-span-2"><input className={`input ${itemErr.name ? 'input-error' : ''}`} value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} /></Field>
          <Field label="Description" className="sm:col-span-2"><input className="input" value={itemForm.desc} onChange={(e) => setItemForm({ ...itemForm, desc: e.target.value })} /></Field>
          <Field label="Price (₹)" error={itemErr.price}><input type="number" className={`input ${itemErr.price ? 'input-error' : ''}`} value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} /></Field>
          <Field label="Category" error={itemErr.category}><select className="input" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}><option value="">Select…</option>{r.categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Emoji"><input className="input" maxLength={2} value={itemForm.emoji} onChange={(e) => setItemForm({ ...itemForm, emoji: e.target.value })} /></Field>
          <div className="flex items-end gap-6 pb-2 text-sm font-medium"><label className="flex items-center gap-2"><input type="checkbox" className="accent-emerald-600" checked={itemForm.veg} onChange={(e) => setItemForm({ ...itemForm, veg: e.target.checked })} /> Vegetarian</label><label className="flex items-center gap-2"><input type="checkbox" className="accent-brand-500" checked={itemForm.available} onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })} /> Available</label></div>
        </div>}
      </Modal>
      <ReasonModal open={!!reject} danger title={reject === 'suspend' ? 'Suspend restaurant' : 'Reject application'} confirmLabel={reject === 'suspend' ? 'Suspend' : 'Reject'} onClose={() => setReject(null)} onConfirm={(reason) => { setStatus(reject === 'suspend' ? 'suspended' : 'rejected', reason); setReject(null) }} />
    </div>
  )
}
