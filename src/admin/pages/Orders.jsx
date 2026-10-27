import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Badge, Card, PageHeader, StatusBadge, Tabs, StatCard } from '../components/ui'
import { downloadCSV, fmtDateTime, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'
import { ReasonModal, useTab } from './shared'

const FILTERS = {
  all: () => true,
  pending: (o) => o.status === 'pending',
  confirmed: (o) => ['confirmed', 'preparing'].includes(o.status),
  active: (o) => o.status === 'out_for_delivery',
  delivered: (o) => o.status === 'delivered',
  cancelled: (o) => o.status === 'cancelled',
}

export default function Orders() {
  const { orders, refunds, setOrderStatus, cancelOrder, decideRefund, can } = useAdmin()
  const toast = useToast()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [tab, setTab] = useTab('all')
  const [cancelFor, setCancelFor] = useState(null)
  const [refundFor, setRefundFor] = useState(null)
  const [refund, setRefund] = useState(true)
  const edit = can('orders', 'edit')

  const count = (k) => (k === 'refunds' ? refunds.filter((r) => r.status === 'pending').length : orders.filter(FILTERS[k]).length)
  const tabs = [
    ['all', 'All orders'], ['pending', 'Pending'], ['confirmed', 'Confirmed'], ['active', 'Active deliveries'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled'], ['refunds', 'Refund requests'],
  ].map(([id, label]) => ({ id, label, count: count(id) }))

  const rows = useMemo(() => (tab === 'refunds' ? [] : orders.filter(FILTERS[tab] || FILTERS.all)), [orders, tab])

  const columns = [
    { key: 'id', header: 'Order', render: (o) => <b>#{o.id}{o.source === 'live' && <Badge tone="pink" className="ml-1.5">NEW</Badge>}</b> },
    { key: 'customerName', header: 'Customer' },
    { key: 'restaurantName', header: 'Restaurant' },
    { key: 'items', header: 'Items', sortable: false, render: (o) => `${o.items.reduce((s, i) => s + i.qty, 0)} items` },
    { key: 'total', header: 'Total', sortValue: (o) => o.total, render: (o) => <b>{currency(o.total)}</b> },
    { key: 'payment', header: 'Payment', sortable: false, render: (o) => <span className="flex gap-1"><StatusBadge status={o.payment.method} /><StatusBadge status={o.payment.status} /></span> },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'placedAt', header: 'Placed', sortValue: (o) => o.placedAt, render: (o) => <span title={fmtDateTime(o.placedAt)} className="text-gray-500">{timeAgo(o.placedAt)}</span> },
    { key: 'actions', header: '', sortable: false, align: 'right', render: (o) => (
      <span className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        {edit && o.status === 'pending' && <><button className="btn-success btn-sm" onClick={() => { setOrderStatus(o.id, 'confirmed'); toast(`Order #${o.id} accepted`) }}>Accept</button><button className="btn-danger btn-sm" onClick={() => setCancelFor(o)}>Reject</button></>}
        <Link to={`/admin/orders/${o.id}`} className="btn-outline btn-sm">View</Link>
      </span>
    ) },
  ]

  const refundCols = [
    { key: 'id', header: 'Refund', render: (r) => <b>{r.id}</b> },
    { key: 'orderId', header: 'Order', render: (r) => <Link to={`/admin/orders/${r.orderId}`} className="font-semibold text-brand-600 hover:underline">#{r.orderId}</Link> },
    { key: 'customerName', header: 'Customer' },
    { key: 'amount', header: 'Amount', sortValue: (r) => r.amount, render: (r) => <b>{currency(r.amount)}</b> },
    { key: 'reason', header: 'Reason', nowrap: false },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'requestedAt', header: 'Requested', sortValue: (r) => r.requestedAt, render: (r) => <span className="text-gray-500">{timeAgo(r.requestedAt)}</span> },
    { key: 'actions', header: '', sortable: false, align: 'right', render: (r) => r.status === 'pending' && edit ? (
      <span className="flex justify-end gap-1.5"><button className="btn-success btn-sm" onClick={() => { decideRefund(r, 'approved', 'Approved by admin'); toast(`Refund ${r.id} approved`) }}>Approve</button><button className="btn-danger btn-sm" onClick={() => setRefundFor(r)}>Reject</button></span>
    ) : <span className="text-xs text-gray-400">{r.note}</span> },
  ]

  const exportCsv = () => downloadCSV(`orders-${tab}.csv`, (tab === 'refunds' ? refunds : rows).map((o) => (tab === 'refunds' ? { ...o } : { Order: o.id, Customer: o.customerName, Restaurant: o.restaurantName, Total: o.total, Payment: o.payment.method, PaymentStatus: o.payment.status, Status: o.status, Placed: fmtDateTime(o.placedAt) })))

  return (
    <div>
      <PageHeader emoji="🧾" title="Order Management" subtitle="Track, update and resolve every order on the platform."
        actions={<button onClick={exportCsv} className="btn-outline btn-sm">⬇ Export CSV</button>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={count('pending')} icon="⏳" color="amber" onClick={() => setTab('pending')} />
        <StatCard label="In kitchen" value={count('confirmed')} icon="👨‍🍳" color="violet" onClick={() => setTab('confirmed')} />
        <StatCard label="On the way" value={count('active')} icon="🛵" color="orange" onClick={() => setTab('active')} />
        <StatCard label="Refund requests" value={count('refunds')} icon="💸" color="red" onClick={() => setTab('refunds')} />
      </div>
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <Card>
        {tab === 'refunds'
          ? <DataTable key="refunds" columns={refundCols} rows={refunds} searchKeys={['id', 'orderId', 'customerName', 'reason']} searchPlaceholder="Search refunds…" />
          : <DataTable key={tab} columns={columns} rows={rows} searchKeys={['id', 'customerName', 'restaurantName']} searchPlaceholder="Search by order ID, customer, restaurant…" initialSearch={params.get('q') || ''} onRowClick={(o) => nav(`/admin/orders/${o.id}`)} />}
      </Card>

      <ReasonModal open={!!cancelFor} danger title={`Reject order #${cancelFor?.id}`} text="The order will be cancelled and the customer notified." confirmLabel="Reject order" onClose={() => setCancelFor(null)}
        extra={cancelFor?.payment.status === 'paid' && <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-500" checked={refund} onChange={(e) => setRefund(e.target.checked)} /> Refund {currency(cancelFor.total)} to customer</label>}
        onConfirm={(reason) => { cancelOrder(cancelFor, reason, refund); toast(`Order #${cancelFor.id} rejected`); setCancelFor(null) }} />
      <ReasonModal open={!!refundFor} danger title={`Reject refund ${refundFor?.id}`} confirmLabel="Reject refund" onClose={() => setRefundFor(null)}
        onConfirm={(reason) => { decideRefund(refundFor, 'rejected', reason); toast('Refund rejected'); setRefundFor(null) }} />
    </div>
  )
}
