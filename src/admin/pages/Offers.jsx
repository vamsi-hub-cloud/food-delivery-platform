import { useMemo, useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { BarChart, Donut, RankList, AreaChart } from '../components/Charts'
import { Badge, Card, Field, Modal, PageHeader, Progress, StatCard, StatusBadge, Tabs, Toggle } from '../components/ui'
import { compact, dailySeries, fmtDate } from '../utils/analytics'
import { currency } from '../../utils/format'
import { useTab } from './shared'

const DAY = 86400000
const iso = (ts) => new Date(ts).toISOString().slice(0, 10)
const blankCoupon = () => ({ code: '', type: 'percent', value: '10', maxDiscount: '100', minOrder: '199', usageLimit: '1000', perUser: '1', startsAt: iso(Date.now()), expiresAt: iso(Date.now() + 30 * DAY), scope: 'All restaurants', description: '' })
const blankCamp = () => ({ name: '', type: 'Acquisition', coupon: '', budget: '50000', startDate: iso(Date.now()), endDate: iso(Date.now() + 30 * DAY) })

const discountText = (c) => (c.type === 'percent' ? `${c.value}% off (max ₹${c.maxDiscount})` : c.type === 'flat' ? `₹${c.value} off` : 'Free delivery')
const effStatus = (c) => (c.expiresAt < Date.now() || c.used >= c.usageLimit ? 'expired' : c.status)

export default function Offers() {
  const { coupons, campaigns, referral, referrals, orders, update, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('coupons')
  const [cf, setCf] = useState(null)
  const [ce, setCe] = useState({})
  const [mf, setMf] = useState(null)
  const [me, setMe] = useState({})
  const [ref, setRef] = useState(null)
  const edit = can('offers', 'edit')

  const saveCoupon = () => {
    const e = {}
    const code = cf.code.trim().toUpperCase()
    if (!/^[A-Z0-9]{4,15}$/.test(code)) e.code = 'Code must be 4–15 letters/numbers'
    else if (!cf.isEdit && coupons.some((c) => c.code === code)) e.code = 'This code already exists'
    const v = Number(cf.value)
    if (cf.type === 'percent' && (!v || v < 1 || v > 100)) e.value = 'Percent must be 1–100'
    if (cf.type === 'flat' && (!v || v < 1)) e.value = 'Enter a flat amount'
    if (cf.type === 'percent' && !(Number(cf.maxDiscount) > 0)) e.maxDiscount = 'Set a max discount'
    if (Number(cf.minOrder) < 0 || cf.minOrder === '') e.minOrder = 'Enter minimum order value'
    if (!(Number(cf.usageLimit) >= 1)) e.usageLimit = 'Usage limit must be at least 1'
    if (!(Number(cf.perUser) >= 1)) e.perUser = 'Per-user limit must be at least 1'
    if (!cf.startsAt || !cf.expiresAt) e.expiresAt = 'Choose start and expiry dates'
    else if (cf.expiresAt < cf.startsAt) e.expiresAt = 'Expiry must be after start date'
    setCe(e)
    if (Object.keys(e).length) return
    const item = { code, type: cf.type, value: cf.type === 'freedelivery' ? 0 : v, maxDiscount: cf.type === 'percent' ? Number(cf.maxDiscount) : cf.type === 'flat' ? v : 0, minOrder: Number(cf.minOrder), usageLimit: Number(cf.usageLimit), perUser: Number(cf.perUser), used: cf.used || 0, startsAt: new Date(cf.startsAt).getTime(), expiresAt: new Date(cf.expiresAt).getTime() + DAY - 1, status: cf.status || 'active', scope: cf.scope, description: cf.description }
    update('coupons', (l) => (cf.isEdit ? l.map((c) => (c.code === code ? item : c)) : [item, ...l]), { action: cf.isEdit ? 'Updated coupon' : 'Created coupon', module: 'Offers', target: code })
    toast(cf.isEdit ? 'Coupon updated' : 'Coupon created'); setCf(null)
  }
  const saveCampaign = () => {
    const e = {}
    if (mf.name.trim().length < 3) e.name = 'Campaign name is required'
    if (!(Number(mf.budget) > 0)) e.budget = 'Enter a budget'
    if (mf.endDate < mf.startDate) e.endDate = 'End date must be after start'
    setMe(e)
    if (Object.keys(e).length) return
    const s = new Date(mf.startDate).getTime(), en = new Date(mf.endDate).getTime() + DAY - 1
    const item = { id: `cp${Date.now()}`, name: mf.name.trim(), type: mf.type, coupon: mf.coupon, budget: Number(mf.budget), spent: 0, startDate: s, endDate: en, status: s > Date.now() ? 'scheduled' : 'active', reach: 0, orders: 0, revenue: 0 }
    update('campaigns', (l) => [item, ...l], { action: 'Created campaign', module: 'Offers', target: item.name }); toast('Campaign created'); setMf(null)
  }
  const saveRef = () => {
    const f = ref
    if (!(Number(f.referrerReward) >= 0) || !(Number(f.refereeReward) >= 0) || !(Number(f.minOrder) >= 0) || !(Number(f.maxReferrals) >= 1) || !(Number(f.expiryDays) >= 1)) return toast('Please enter valid numbers', 'error')
    update('referral', (r) => ({ ...r, enabled: f.enabled, referrerReward: Number(f.referrerReward), refereeReward: Number(f.refereeReward), minOrder: Number(f.minOrder), maxReferrals: Number(f.maxReferrals), expiryDays: Number(f.expiryDays) }), { action: 'Updated referral program', module: 'Offers', target: 'Referral' }); toast('Referral program saved'); setRef(null)
  }
  const form = ref || referral

  const analytics = useMemo(() => {
    const redemptions = dailySeries(orders.filter((o) => o.discount > 0), 14).map((d) => ({ label: d.label, redemptions: d.orders }))
    return { redemptions, byCoupon: coupons.map((c) => ({ label: c.code, value: c.used })), byType: ['percent', 'flat', 'freedelivery'].map((t) => ({ label: t === 'freedelivery' ? 'Free delivery' : t === 'percent' ? 'Percentage' : 'Flat', value: coupons.filter((c) => c.type === t).reduce((s, c) => s + c.used, 0) })), roi: campaigns.filter((c) => c.spent > 0).map((c) => ({ label: c.name, value: Math.round((c.revenue / c.spent) * 10) / 10 })) }
  }, [orders, coupons, campaigns])

  const couponCols = [
    { key: 'code', header: 'Code', render: (c) => <span className="rounded-md border border-dashed border-brand-400 px-2 py-0.5 font-bold tracking-widest text-brand-600">{c.code}</span> },
    { key: 'd', header: 'Discount', sortable: false, render: (c) => <div><p className="font-medium">{discountText(c)}</p><p className="text-xs text-gray-400">Min ₹{c.minOrder} · {c.scope}</p></div> },
    { key: 'used', header: 'Usage', sortValue: (c) => c.used, render: (c) => <div className="w-32"><p className="mb-1 text-xs"><b>{c.used.toLocaleString('en-IN')}</b> / {c.usageLimit.toLocaleString('en-IN')} · {c.perUser}/user</p><Progress value={(c.used / c.usageLimit) * 100} /></div> },
    { key: 'expiresAt', header: 'Valid till', sortValue: (c) => c.expiresAt, render: (c) => fmtDate(c.expiresAt) },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={effStatus(c)} /> },
    { key: 'on', header: 'Active', sortable: false, render: (c) => <Toggle label={`Toggle ${c.code}`} checked={c.status === 'active' && effStatus(c) === 'active'} disabled={!edit || effStatus(c) === 'expired'} onChange={(v) => { update('coupons', (l) => l.map((x) => (x.code === c.code ? { ...x, status: v ? 'active' : 'paused' } : x)), { action: v ? 'Activated coupon' : 'Paused coupon', module: 'Offers', target: c.code }); toast(`${c.code} ${v ? 'activated' : 'paused'}`) }} /> },
    { key: 'a', header: '', sortable: false, align: 'right', render: (c) => edit && <span className="flex justify-end gap-1.5"><button className="btn-outline btn-sm" onClick={() => { setCf({ ...c, value: String(c.value), maxDiscount: String(c.maxDiscount), minOrder: String(c.minOrder), usageLimit: String(c.usageLimit), perUser: String(c.perUser), startsAt: iso(c.startsAt), expiresAt: iso(c.expiresAt), isEdit: true }); setCe({}) }}>Edit</button><button className="btn-danger btn-sm" onClick={() => { update('coupons', (l) => l.filter((x) => x.code !== c.code), { action: 'Deleted coupon', module: 'Offers', target: c.code }); toast('Coupon deleted') }}>Delete</button></span> },
  ]
  const refCols = [{ key: 'referrer', header: 'Referrer' }, { key: 'referee', header: 'Referred friend' }, { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'reward', header: 'Reward', render: (r) => currency(r.reward) }, { key: 'at', header: 'Date', render: (r) => fmtDate(r.at) }]
  const cs = (k) => (e) => { setCf((f) => ({ ...f, [k]: e.target.value })); setCe((x) => ({ ...x, [k]: undefined })) }
  const ms = (k) => (e) => { setMf((f) => ({ ...f, [k]: e.target.value })); setMe((x) => ({ ...x, [k]: undefined })) }

  return (
    <div>
      <PageHeader emoji="🎟️" title="Offers & Promotions" subtitle="Coupons, discount campaigns, referral rewards and campaign analytics."
        actions={edit && (tab === 'coupons' ? <button className="btn-primary btn-sm" onClick={() => { setCf(blankCoupon()); setCe({}) }}>+ Create coupon</button> : tab === 'campaigns' ? <button className="btn-primary btn-sm" onClick={() => { setMf(blankCamp()); setMe({}) }}>+ New campaign</button> : null)} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active coupons" value={coupons.filter((c) => effStatus(c) === 'active').length} icon="🎟️" color="orange" />
        <StatCard label="Total redemptions" value={compact(coupons.reduce((s, c) => s + c.used, 0))} icon="✅" color="emerald" />
        <StatCard label="Campaign spend" value={`₹${compact(campaigns.reduce((s, c) => s + c.spent, 0))}`} icon="📣" color="pink" />
        <StatCard label="Referral signups" value={referral.successful.toLocaleString('en-IN')} icon="🤝" color="violet" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'coupons', label: 'Coupon codes', count: coupons.length }, { id: 'campaigns', label: 'Discount campaigns', count: campaigns.length }, { id: 'referral', label: 'Referral program' }, { id: 'analytics', label: 'Campaign analytics' }]} />

      {tab === 'coupons' && <Card><DataTable columns={couponCols} rows={coupons} rowKey="code" searchKeys={['code', 'description', 'scope']} searchPlaceholder="Search coupons…" /></Card>}

      {tab === 'campaigns' && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{campaigns.map((c) => (
        <Card key={c.id}>
          <div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{c.name}</h3><p className="text-xs text-gray-500">{c.type} · {fmtDate(c.startDate)} → {fmtDate(c.endDate)}</p></div><StatusBadge status={c.status} /></div>
          {c.coupon && <Badge tone="orange" className="mt-2">🎟️ {c.coupon}</Badge>}
          <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span>Budget used</span><b>{currency(c.spent)} / {currency(c.budget)}</b></div><Progress value={(c.spent / c.budget) * 100} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-gray-50 p-2"><b className="block text-base">{compact(c.reach)}</b>Reach</div><div className="rounded-xl bg-gray-50 p-2"><b className="block text-base">{compact(c.orders)}</b>Orders</div><div className="rounded-xl bg-gray-50 p-2"><b className="block text-base">₹{compact(c.revenue)}</b>Revenue</div></div>
          {edit && <div className="mt-4 flex justify-end gap-2">
            {c.status === 'active' && <button className="btn-outline btn-sm" onClick={() => update('campaigns', (l) => l.map((x) => (x.id === c.id ? { ...x, status: 'ended' } : x)), { action: 'Ended campaign', module: 'Offers', target: c.name })}>End</button>}
            <button className="btn-danger btn-sm" onClick={() => { update('campaigns', (l) => l.filter((x) => x.id !== c.id), { action: 'Deleted campaign', module: 'Offers', target: c.name }); toast('Campaign deleted') }}>Delete</button></div>}
        </Card>))}</div>}

      {tab === 'referral' && <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card title="Referral program settings" action={<span className="flex items-center gap-2 text-sm font-semibold">Enabled <Toggle label="Referral enabled" checked={form.enabled} disabled={!edit} onChange={(v) => setRef({ ...form, enabled: v })} /></span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[['referrerReward', 'Referrer reward (₹)'], ['refereeReward', 'Friend reward (₹)'], ['minOrder', 'Minimum order value (₹)'], ['maxReferrals', 'Max referrals / user'], ['expiryDays', 'Reward expiry (days)']].map(([k, l]) => <Field key={k} label={l}><input type="number" min="0" className="input" disabled={!edit} value={form[k]} onChange={(e) => setRef({ ...form, [k]: e.target.value })} /></Field>)}
          </div>
          {edit && <div className="mt-4 flex justify-end gap-2">{ref && <button className="btn-outline" onClick={() => setRef(null)}>Reset</button>}<button className="btn-primary" disabled={!ref} onClick={saveRef}>Save changes</button></div>}
        </Card>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4"><StatCard label="Total referrals" value={referral.totalReferrals.toLocaleString('en-IN')} icon="🤝" color="violet" /><StatCard label="Successful" value={referral.successful.toLocaleString('en-IN')} icon="✅" color="emerald" sub={`${Math.round((referral.successful / referral.totalReferrals) * 100)}% conv.`} /><StatCard label="Rewards paid" value={`₹${compact(referral.rewardsPaid)}`} icon="🎁" color="pink" /></div>
          <Card title="Recent referrals"><DataTable columns={refCols} rows={referrals} pageSize={5} /></Card>
        </div>
      </div>}

      {tab === 'analytics' && <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Coupon redemptions (last 14 days)"><AreaChart data={analytics.redemptions} series={[{ key: 'redemptions', label: 'Redemptions', color: '#ec4899' }]} /></Card>
        <Card title="Usage by coupon"><BarChart data={analytics.byCoupon} color="#f95a16" format={(v) => compact(v)} /></Card>
        <Card title="Redemptions by discount type"><Donut data={analytics.byType} format={(v) => compact(v)} center={compact(coupons.reduce((s, c) => s + c.used, 0))} /></Card>
        <Card title="Campaign ROI (revenue per ₹1 spent)"><RankList items={analytics.roi} format={(v) => `${v}×`} color="from-emerald-500 to-teal-400" /></Card>
      </div>}

      <Modal open={!!cf} onClose={() => setCf(null)} title={cf?.isEdit ? `Edit ${cf.code}` : 'Create coupon'} size="lg" footer={<><button className="btn-outline" onClick={() => setCf(null)}>Cancel</button><button className="btn-primary" onClick={saveCoupon}>{cf?.isEdit ? 'Save changes' : 'Create coupon'}</button></>}>
        {cf && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coupon code" error={ce.code}><input disabled={cf.isEdit} className={`input uppercase ${ce.code ? 'input-error' : ''}`} value={cf.code} onChange={cs('code')} placeholder="SAVE20" /></Field>
          <Field label="Discount type"><select className="input" value={cf.type} onChange={cs('type')}><option value="percent">Percentage off</option><option value="flat">Flat amount off</option><option value="freedelivery">Free delivery</option></select></Field>
          {cf.type !== 'freedelivery' && <Field label={cf.type === 'percent' ? 'Discount (%)' : 'Amount (₹)'} error={ce.value}><input type="number" className={`input ${ce.value ? 'input-error' : ''}`} value={cf.value} onChange={cs('value')} /></Field>}
          {cf.type === 'percent' && <Field label="Max discount (₹)" error={ce.maxDiscount}><input type="number" className={`input ${ce.maxDiscount ? 'input-error' : ''}`} value={cf.maxDiscount} onChange={cs('maxDiscount')} /></Field>}
          <Field label="Minimum order value (₹)" error={ce.minOrder}><input type="number" className={`input ${ce.minOrder ? 'input-error' : ''}`} value={cf.minOrder} onChange={cs('minOrder')} /></Field>
          <Field label="Total usage limit" error={ce.usageLimit}><input type="number" className={`input ${ce.usageLimit ? 'input-error' : ''}`} value={cf.usageLimit} onChange={cs('usageLimit')} /></Field>
          <Field label="Uses per customer" error={ce.perUser}><input type="number" className={`input ${ce.perUser ? 'input-error' : ''}`} value={cf.perUser} onChange={cs('perUser')} /></Field>
          <Field label="Start date"><input type="date" className="input" value={cf.startsAt} onChange={cs('startsAt')} /></Field>
          <Field label="Expiry date" error={ce.expiresAt}><input type="date" className={`input ${ce.expiresAt ? 'input-error' : ''}`} value={cf.expiresAt} onChange={cs('expiresAt')} /></Field>
          <Field label="Applicable on"><input className="input" value={cf.scope} onChange={cs('scope')} /></Field>
          <Field label="Description"><input className="input" value={cf.description} onChange={cs('description')} /></Field>
        </div>}
      </Modal>
      <Modal open={!!mf} onClose={() => setMf(null)} title="New discount campaign" footer={<><button className="btn-outline" onClick={() => setMf(null)}>Cancel</button><button className="btn-primary" onClick={saveCampaign}>Create campaign</button></>}>
        {mf && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Campaign name" error={me.name} className="sm:col-span-2"><input className={`input ${me.name ? 'input-error' : ''}`} value={mf.name} onChange={ms('name')} /></Field>
          <Field label="Type"><select className="input" value={mf.type} onChange={ms('type')}>{['Acquisition', 'Retention', 'Festival', 'Seasonal', 'Restaurant'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Linked coupon"><select className="input" value={mf.coupon} onChange={ms('coupon')}><option value="">None</option>{coupons.map((c) => <option key={c.code}>{c.code}</option>)}</select></Field>
          <Field label="Budget (₹)" error={me.budget}><input type="number" className={`input ${me.budget ? 'input-error' : ''}`} value={mf.budget} onChange={ms('budget')} /></Field>
          <div />
          <Field label="Start date"><input type="date" className="input" value={mf.startDate} onChange={ms('startDate')} /></Field>
          <Field label="End date" error={me.endDate}><input type="date" className={`input ${me.endDate ? 'input-error' : ''}`} value={mf.endDate} onChange={ms('endDate')} /></Field>
        </div>}
      </Modal>
    </div>
  )
}
