import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { AreaChart, Donut } from '../components/Charts'
import { Card, PageHeader, StatCard, StatusBadge, Tabs } from '../components/ui'
import { compact, dailySeries, downloadCSV, fmtDateTime, startOfDay, sum, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'
import { ReasonModal, useTab } from './shared'

const DAY = 86400000
const Sel = ({ value, onChange, options, label }) => <select aria-label={label} className="input !w-auto !py-2" value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>

export default function Payments() {
  const { orders, transactions, settlements, payouts, refunds, restaurants, update, decideRefund, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('overview')
  const [mf, setMf] = useState('all')
  const [sf, setSf] = useState('all')
  const [rejectFor, setRejectFor] = useState(null)
  const edit = can('payments', 'edit')

  const live = orders.filter((o) => o.status !== 'cancelled')
  const k = useMemo(() => ({
    collected: sum(transactions.filter((t) => t.status === 'success'), (t) => t.amount),
    commission: sum(live, (o) => o.commission),
    refunded: sum(refunds.filter((r) => r.status === 'approved'), (r) => r.amount),
    failed: transactions.filter((t) => t.status === 'failed' && !t.resolved),
    pendingSettle: sum(settlements.filter((s) => s.status !== 'paid'), (s) => s.net),
    pendingPayout: sum(payouts.filter((s) => s.status !== 'paid'), (s) => s.net),
  }), [transactions, live, refunds, settlements, payouts])

  const series = useMemo(() => dailySeries(orders, 14), [orders])
  const methods = useMemo(() => ['upi', 'card', 'cod'].map((m) => ({ label: m.toUpperCase(), value: sum(transactions.filter((t) => t.method === m && t.status === 'success'), (t) => t.amount) })), [transactions])

  const commissionRows = useMemo(() => restaurants.filter((r) => r.status === 'approved').map((r) => {
    const os = live.filter((o) => o.restaurantId === r.id)
    return { id: r.id, name: r.name, rate: r.commission, orders: os.length, gmv: sum(os, (o) => o.subtotal), commission: sum(os, (o) => o.commission) }
  }), [restaurants, live])

  const taxRows = useMemo(() => [0, 1, 2, 3].map((w) => {
    const end = startOfDay(Date.now()) + DAY - w * 7 * DAY, start = end - 7 * DAY
    const os = live.filter((o) => o.placedAt >= start && o.placedAt < end)
    const food = sum(os, (o) => o.taxes), del = Math.round(sum(os, (o) => o.deliveryFee) * 0.18), com = Math.round(sum(os, (o) => o.commission) * 0.18)
    return { id: `w${w}`, period: `${new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(end - 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, taxable: sum(os, (o) => o.subtotal - o.discount), food, cgst: Math.round(food / 2), sgst: food - Math.round(food / 2), del, com, total: food + del + com }
  }), [live])

  const setSettle = (s, status) => { update('settlements', (l) => l.map((x) => (x.id === s.id ? { ...x, status } : x)), { action: status === 'paid' ? 'Marked settlement paid' : 'Processing settlement', module: 'Payments', target: s.id }); toast(`${s.id} → ${status}`) }
  const setPay = (s, status) => { update('payouts', (l) => l.map((x) => (x.id === s.id ? { ...x, status } : x)), { action: status === 'paid' ? 'Paid partner payout' : 'Processing payout', module: 'Payments', target: s.id }); toast(`${s.id} → ${status}`) }
  const payAll = (list, setter) => { const items = list.filter((x) => x.status !== 'paid'); items.forEach((x) => setter(x, 'paid')) }

  const txnCols = [
    { key: 'id', header: 'Txn ID', render: (t) => <b>{t.id}</b> },
    { key: 'orderId', header: 'Order', render: (t) => (t.orderId ? <Link to={`/admin/orders/${t.orderId}`} className="text-brand-600 hover:underline">#{t.orderId}</Link> : <span className="text-gray-400">—</span>) },
    { key: 'customerName', header: 'Customer' }, { key: 'method', header: 'Method', render: (t) => <StatusBadge status={t.method} /> }, { key: 'gateway', header: 'Gateway' },
    { key: 'amount', header: 'Amount', sortValue: (t) => t.amount, render: (t) => <b>{currency(t.amount)}</b> }, { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'at', header: 'Time', sortValue: (t) => t.at, render: (t) => <span title={fmtDateTime(t.at)} className="text-gray-500">{timeAgo(t.at)}</span> },
  ]
  const failedCols = [
    ...txnCols.slice(0, 1), txnCols[2], txnCols[3], txnCols[5], { key: 'failReason', header: 'Failure reason', nowrap: false }, txnCols[7],
    { key: 'a', header: '', sortable: false, align: 'right', render: (t) => edit && <span className="flex justify-end gap-1.5"><button className="btn-outline btn-sm" onClick={() => toast(`Payment link sent to ${t.customerName}`)}>Send link</button><button className="btn-success btn-sm" onClick={() => { update('transactions', (l) => l.map((x) => (x.id === t.id ? { ...x, resolved: true } : x)), { action: 'Resolved failed payment', module: 'Payments', target: t.id }); toast('Marked resolved') }}>Resolve</button></span> },
  ]
  const stCols = (setter) => [
    { key: 'id', header: 'ID', render: (s) => <b>{s.id}</b> }, { key: 'name', header: 'Payee', render: (s) => s.restaurantName || s.partnerName }, { key: 'period', header: 'Period' },
    { key: 'n', header: 'Orders', sortValue: (s) => s.orders ?? s.deliveries, render: (s) => s.orders ?? s.deliveries },
    { key: 'gross', header: 'Gross / earnings', sortValue: (s) => s.gross ?? s.earnings, render: (s) => currency(s.gross ?? s.earnings) },
    { key: 'ded', header: 'Deductions / incentives', sortable: false, render: (s) => (s.commission !== undefined ? <span className="text-red-500">− {currency(s.commission + s.gst)}</span> : <span className="text-emerald-600">+ {currency(s.incentives)}</span>) },
    { key: 'net', header: 'Net payable', sortValue: (s) => s.net, render: (s) => <b>{currency(s.net)}</b> }, { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
    { key: 'a', header: '', sortable: false, align: 'right', render: (s) => edit && s.status !== 'paid' && <span className="flex justify-end gap-1.5">{s.status === 'pending' && <button className="btn-outline btn-sm" onClick={() => setter(s, 'processing')}>Process</button>}<button className="btn-success btn-sm" onClick={() => setter(s, 'paid')}>Mark paid</button></span> },
  ]
  const comCols = [{ key: 'name', header: 'Restaurant', render: (r) => <Link to={`/admin/restaurants/${r.id}?tab=commission`} className="font-semibold text-brand-600 hover:underline">{r.name}</Link> }, { key: 'rate', header: 'Rate', render: (r) => `${r.rate}%` }, { key: 'orders', header: 'Orders' }, { key: 'gmv', header: 'Food sales', render: (r) => currency(r.gmv) }, { key: 'commission', header: 'Commission earned', sortValue: (r) => r.commission, render: (r) => <b className="text-violet-600">{currency(r.commission)}</b> }]
  const refCols = [{ key: 'id', header: 'Refund', render: (r) => <b>{r.id}</b> }, { key: 'orderId', header: 'Order', render: (r) => <Link to={`/admin/orders/${r.orderId}`} className="text-brand-600 hover:underline">#{r.orderId}</Link> }, { key: 'customerName', header: 'Customer' }, { key: 'amount', header: 'Amount', sortValue: (r) => r.amount, render: (r) => currency(r.amount) }, { key: 'reason', header: 'Reason', nowrap: false }, { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'a', header: '', sortable: false, align: 'right', render: (r) => edit && r.status === 'pending' && <span className="flex justify-end gap-1.5"><button className="btn-success btn-sm" onClick={() => { decideRefund(r, 'approved', 'Approved by finance'); toast('Refund approved') }}>Approve</button><button className="btn-danger btn-sm" onClick={() => setRejectFor(r)}>Reject</button></span> }]
  const taxCols = [{ key: 'period', header: 'Week' }, { key: 'taxable', header: 'Taxable value', render: (t) => currency(t.taxable) }, { key: 'cgst', header: 'CGST (2.5%)', render: (t) => currency(t.cgst) }, { key: 'sgst', header: 'SGST (2.5%)', render: (t) => currency(t.sgst) }, { key: 'del', header: 'GST on delivery (18%)', render: (t) => currency(t.del) }, { key: 'com', header: 'GST on commission (18%)', render: (t) => currency(t.com) }, { key: 'total', header: 'Total GST', render: (t) => <b>{currency(t.total)}</b> }]

  const txRows = transactions.filter((t) => (mf === 'all' || t.method === mf) && (sf === 'all' || t.status === sf))
  const reports = [
    ['Transactions', '🧾', () => downloadCSV('transactions.csv', transactions.map((t) => ({ ID: t.id, Order: t.orderId || '', Customer: t.customerName, Method: t.method, Gateway: t.gateway, Amount: t.amount, Status: t.status, Time: fmtDateTime(t.at) })))],
    ['Restaurant settlements', '🏪', () => downloadCSV('settlements.csv', settlements.map(({ id, restaurantName, period, orders: n, gross, commission, gst, net, status }) => ({ id, restaurantName, period, orders: n, gross, commission, gst, net, status })))],
    ['Partner payouts', '🛵', () => downloadCSV('payouts.csv', payouts.map(({ id, partnerName, period, deliveries, earnings, incentives, net, status }) => ({ id, partnerName, period, deliveries, earnings, incentives, net, status })))],
    ['Platform commissions', '🏦', () => downloadCSV('commissions.csv', commissionRows.map((r) => ({ Restaurant: r.name, Rate: `${r.rate}%`, Orders: r.orders, FoodSales: r.gmv, Commission: r.commission })))],
    ['Tax summary (GST)', '📑', () => downloadCSV('gst-summary.csv', taxRows.map(({ period, taxable, cgst, sgst, del, com, total }) => ({ period, taxable, cgst, sgst, gstDelivery: del, gstCommission: com, total })))],
    ['Refunds', '💸', () => downloadCSV('refunds.csv', refunds.map(({ id, orderId, customerName, amount, reason, status }) => ({ id, orderId, customerName, amount, reason, status })))],
  ]

  return (
    <div>
      <PageHeader emoji="💰" title="Payments & Finance" subtitle="Collections, settlements, payouts, commissions, taxes and financial reports." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'transactions', label: 'Transactions', count: transactions.length }, { id: 'failed', label: 'Failed payments', count: k.failed.length }, { id: 'settlements', label: 'Restaurant settlements' }, { id: 'payouts', label: 'Partner payouts' }, { id: 'commissions', label: 'Commissions' }, { id: 'refunds', label: 'Refunds', count: refunds.filter((r) => r.status === 'pending').length }, { id: 'taxes', label: 'Taxes' }, { id: 'reports', label: 'Financial reports' }]} />

      {tab === 'overview' && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total collected" value={`₹${compact(k.collected)}`} icon="💳" color="emerald" sub="successful payments" />
          <StatCard label="Platform commission" value={`₹${compact(k.commission)}`} icon="🏦" color="violet" sub="all-time" />
          <StatCard label="Refunded" value={`₹${compact(k.refunded)}`} icon="💸" color="pink" sub="approved refunds" />
          <StatCard label="Failed payments" value={k.failed.length} icon="⚠️" color="red" sub="unresolved" onClick={() => setTab('failed')} />
          <StatCard label="Pending settlements" value={`₹${compact(k.pendingSettle)}`} icon="🏪" color="amber" onClick={() => setTab('settlements')} />
          <StatCard label="Pending payouts" value={`₹${compact(k.pendingPayout)}`} icon="🛵" color="orange" onClick={() => setTab('payouts')} />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card title="Daily collections (last 14 days)"><AreaChart data={series} series={[{ key: 'revenue', label: 'Collections', color: '#10b981' }, { key: 'commission', label: 'Commission', color: '#8b5cf6' }]} format={(v) => `₹${compact(v)}`} /></Card>
          <Card title="Collections by method"><Donut data={methods} format={(v) => `₹${compact(v)}`} center={`₹${compact(sum(methods, (m) => m.value))}`} /></Card>
        </div>
      </>}

      {tab === 'transactions' && <Card><DataTable key="t" columns={txnCols} rows={txRows} pageSize={10} searchKeys={['id', 'orderId', 'customerName']} searchPlaceholder="Search transactions…" toolbar={<><Sel label="Method" value={mf} onChange={setMf} options={[['all', 'All methods'], ['upi', 'UPI'], ['card', 'Card'], ['cod', 'COD']]} /><Sel label="Status" value={sf} onChange={setSf} options={[['all', 'All statuses'], ['success', 'Success'], ['failed', 'Failed'], ['refunded', 'Refunded'], ['pending', 'Pending']]} /></>} /></Card>}
      {tab === 'failed' && <Card><DataTable key="f" columns={failedCols} rows={k.failed} searchKeys={['id', 'customerName', 'failReason']} empty="No failed payments 🎉" /></Card>}
      {tab === 'settlements' && <Card title="Restaurant settlements" action={edit && <button className="btn-primary btn-sm" onClick={() => { payAll(settlements, setSettle) }}>Mark all paid</button>}><DataTable key="s" columns={stCols(setSettle)} rows={settlements} searchKeys={['id', 'restaurantName', 'period']} /></Card>}
      {tab === 'payouts' && <Card title="Delivery partner payouts" action={edit && <button className="btn-primary btn-sm" onClick={() => { payAll(payouts, setPay) }}>Mark all paid</button>}><DataTable key="p" columns={stCols(setPay)} rows={payouts} searchKeys={['id', 'partnerName', 'period']} /></Card>}
      {tab === 'commissions' && <><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Commission earned" value={currency(k.commission)} icon="🏦" color="violet" /><StatCard label="Delivery fee revenue" value={currency(sum(live, (o) => o.deliveryFee))} icon="🛵" color="orange" /><StatCard label="Avg. commission rate" value={`${Math.round(sum(commissionRows, (r) => r.rate) / Math.max(1, commissionRows.length))}%`} icon="📊" color="sky" /></div><Card><DataTable key="c" columns={comCols} rows={commissionRows} searchKeys={['name']} /></Card></>}
      {tab === 'refunds' && <Card><DataTable key="r" columns={refCols} rows={refunds} searchKeys={['id', 'orderId', 'customerName']} /></Card>}
      {tab === 'taxes' && <><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="GST on food (5%)" value={currency(sum(taxRows, (t) => t.food))} icon="🍽️" color="emerald" sub="last 4 weeks" /><StatCard label="GST on delivery" value={currency(sum(taxRows, (t) => t.del))} icon="🛵" color="orange" /><StatCard label="GST on commission" value={currency(sum(taxRows, (t) => t.com))} icon="🏦" color="violet" /></div><Card><DataTable columns={taxCols} rows={taxRows} pageSize={6} /></Card></>}
      {tab === 'reports' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{reports.map(([l, e, fn]) => <Card key={l}><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-3xl">{e}</span><div className="flex-1"><p className="font-bold">{l}</p><p className="text-xs text-gray-500">CSV export</p></div><button onClick={() => { fn(); toast(`${l} report downloaded`) }} className="btn-primary btn-sm">⬇ Download</button></div></Card>)}</div>}

      <ReasonModal open={!!rejectFor} danger title={`Reject refund ${rejectFor?.id}`} confirmLabel="Reject" onClose={() => setRejectFor(null)} onConfirm={(r) => { decideRefund(rejectFor, 'rejected', r); toast('Refund rejected'); setRejectFor(null) }} />
    </div>
  )
}
