import { useMemo, useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import DataTable from '../components/DataTable'
import { Badge, Card, PageHeader } from '../components/ui'
import { downloadCSV, fmtDateTime, timeAgo } from '../utils/analytics'

const TONE = { Orders: 'orange', Restaurants: 'pink', Partners: 'blue', Customers: 'violet', Payments: 'green', Offers: 'amber', Support: 'blue', Settings: 'gray' }

export default function Audit() {
  const { audit } = useAdmin()
  const [mod, setMod] = useState('all')
  const modules = useMemo(() => [...new Set(audit.map((a) => a.module))].sort(), [audit])
  const rows = audit.filter((a) => mod === 'all' || a.module === mod)
  const cols = [
    { key: 'at', header: 'Time', sortValue: (a) => a.at, render: (a) => <div><p className="font-medium">{timeAgo(a.at)}</p><p className="text-xs text-gray-400">{fmtDateTime(a.at)}</p></div> },
    { key: 'admin', header: 'Admin', render: (a) => <div><p className="font-semibold">{a.admin}</p><p className="text-xs text-gray-400">{a.role}</p></div> },
    { key: 'action', header: 'Action', nowrap: false },
    { key: 'module', header: 'Module', render: (a) => <Badge tone={TONE[a.module] || 'gray'}>{a.module}</Badge> },
    { key: 'target', header: 'Target', render: (a) => <b>{a.target}</b> },
    { key: 'details', header: 'Details', nowrap: false, render: (a) => <span className="text-gray-500">{a.details || '—'}</span> },
  ]
  return (
    <div>
      <PageHeader emoji="📜" title="Audit Logs" subtitle="Every admin action is recorded here for security and compliance."
        actions={<button className="btn-outline btn-sm" onClick={() => downloadCSV('audit-log.csv', rows.map((a) => ({ Time: fmtDateTime(a.at), Admin: a.admin, Role: a.role, Action: a.action, Module: a.module, Target: a.target, Details: a.details })))}>⬇ Export CSV</button>} />
      <Card><DataTable columns={cols} rows={rows} pageSize={12} searchKeys={['admin', 'action', 'target', 'details']} searchPlaceholder="Search logs…" toolbar={<select aria-label="Filter module" className="input !w-auto !py-2" value={mod} onChange={(e) => setMod(e.target.value)}><option value="all">All modules</option>{modules.map((m) => <option key={m}>{m}</option>)}</select>} /></Card>
    </div>
  )
}
