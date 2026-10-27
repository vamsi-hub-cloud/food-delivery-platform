import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import DataTable from '../components/DataTable'
import { Avatar, Card, PageHeader, StatCard, StatusBadge } from '../components/ui'
import { customerStats, downloadCSV, fmtDate, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'

export default function Customers() {
  const { customers, orders, tickets } = useAdmin()
  const nav = useNavigate()
  const [status, setStatus] = useState('all')
  const stats = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, customerStats(c, orders)])), [customers, orders])
  const rows = customers.filter((c) => status === 'all' || c.status === status)
  const cols = [
    { key: 'name', header: 'Customer', render: (c) => <div className="flex items-center gap-3"><Avatar name={c.name} color="from-violet-500 to-indigo-400" /><div><p className="font-semibold">{c.name}</p><p className="text-xs text-gray-500">{c.email}</p></div></div> },
    { key: 'phone', header: 'Phone' },
    { key: 'orders', header: 'Orders', sortValue: (c) => stats[c.id].count, render: (c) => stats[c.id].count },
    { key: 'spent', header: 'Total spent', sortValue: (c) => stats[c.id].spent, render: (c) => <b>{currency(stats[c.id].spent)}</b> },
    { key: 'last', header: 'Last order', sortValue: (c) => stats[c.id].lastOrder || 0, render: (c) => (stats[c.id].lastOrder ? timeAgo(stats[c.id].lastOrder) : '—') },
    { key: 'joinedAt', header: 'Joined', sortValue: (c) => c.joinedAt, render: (c) => fmtDate(c.joinedAt) },
    { key: 'status', header: 'Account', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'v', header: '', sortable: false, align: 'right', render: (c) => <Link to={`/admin/customers/${c.id}`} className="btn-outline btn-sm" onClick={(e) => e.stopPropagation()}>Profile</Link> },
  ]
  return (
    <div>
      <PageHeader emoji="👥" title="Customer Management" subtitle="Profiles, order history, complaints and account status."
        actions={<button className="btn-outline btn-sm" onClick={() => downloadCSV('customers.csv', customers.map((c) => ({ Name: c.name, Email: c.email, Phone: c.phone, Status: c.status, Orders: stats[c.id].count, Spent: stats[c.id].spent })))}>⬇ Export</button>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total customers" value={customers.length} icon="👥" color="violet" />
        <StatCard label="Active" value={customers.filter((c) => c.status === 'active').length} icon="✅" color="emerald" />
        <StatCard label="Suspended / blocked" value={customers.filter((c) => c.status !== 'active').length} icon="🚫" color="red" />
        <StatCard label="Open complaints" value={tickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length} icon="📣" color="amber" />
      </div>
      <Card>
        <DataTable columns={cols} rows={rows} searchKeys={['name', 'email', 'phone']} searchPlaceholder="Search customers…" onRowClick={(c) => nav(`/admin/customers/${c.id}`)}
          toolbar={<select aria-label="Filter by status" className="input !w-auto !py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="blocked">Blocked</option></select>} />
      </Card>
    </div>
  )
}
