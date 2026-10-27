import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import { Avatar, Badge, Card, Empty, PageHeader, StatCard, StatusBadge, Tabs } from '../components/ui'
import { fmtDateTime, timeAgo } from '../utils/analytics'
import { currency } from '../../utils/format'
import { useTab } from './shared'

export default function Support() {
  const { tickets, orders, user, update, createRefund, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('tickets')
  const [sel, setSel] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [reply, setReply] = useState('')
  const [err, setErr] = useState('')
  const [resolution, setResolution] = useState('')
  const edit = can('support', 'edit')

  const list = useMemo(() => tickets
    .filter((t) => (tab === 'disputes' ? t.isDispute : true))
    .filter((t) => status === 'all' || t.status === status)
    .filter((t) => !q.trim() || `${t.id} ${t.subject} ${t.customerName}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt), [tickets, tab, status, q])
  const ticket = tickets.find((t) => t.id === sel) || null
  const order = ticket && orders.find((o) => o.id === ticket.orderId)
  const patch = (id, fn, a) => update('tickets', (l) => l.map((t) => (t.id === id ? { ...t, ...fn(t) } : t)), a && { module: 'Support', target: id, ...a })

  const send = (e) => {
    e.preventDefault()
    if (reply.trim().length < 2) return setErr('Write a reply first')
    patch(ticket.id, (t) => ({ messages: [...t.messages, { from: 'admin', text: reply.trim(), at: Date.now() }], status: t.status === 'open' ? 'in_progress' : t.status, assignee: t.assignee || user.name }), { action: 'Replied to ticket' })
    setReply(''); setErr(''); toast('Reply sent')
  }
  const resolve = (note, extra) => {
    if (note.trim().length < 3) return toast('Add a resolution note', 'error')
    patch(ticket.id, (t) => ({ status: 'resolved', resolution: note.trim(), messages: [...t.messages, { from: 'admin', text: `Resolved: ${note.trim()}`, at: Date.now() }] }), { action: ticket.isDispute ? 'Resolved dispute' : 'Resolved ticket', details: note })
    extra?.(); setResolution(''); toast('Ticket resolved')
  }

  return (
    <div>
      <PageHeader emoji="🎧" title="Support & Disputes" subtitle="Customer support tickets and dispute resolution." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open" value={tickets.filter((t) => t.status === 'open').length} icon="📬" color="amber" />
        <StatCard label="In progress" value={tickets.filter((t) => t.status === 'in_progress').length} icon="🛠️" color="sky" />
        <StatCard label="Resolved" value={tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length} icon="✅" color="emerald" />
        <StatCard label="Open disputes" value={tickets.filter((t) => t.isDispute && !['resolved', 'closed'].includes(t.status)).length} icon="⚖️" color="red" />
      </div>
      <Tabs value={tab} onChange={(t) => { setTab(t); setSel(null) }} tabs={[{ id: 'tickets', label: 'Support tickets', count: tickets.length }, { id: 'disputes', label: 'Disputes', count: tickets.filter((t) => t.isDispute).length }]} />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card pad={false} className="h-fit">
          <div className="space-y-2 border-b border-gray-100 p-3">
            <input className="input !py-2" placeholder="Search tickets…" aria-label="Search tickets" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="input !py-2" aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select>
          </div>
          <ul className="max-h-[560px] divide-y divide-gray-100 overflow-y-auto">
            {list.map((t) => (
              <li key={t.id}><button onClick={() => { setSel(t.id); setErr(''); setReply('') }} className={`w-full p-4 text-left transition hover:bg-orange-50 ${sel === t.id ? 'bg-orange-50' : ''}`}>
                <div className="flex items-center justify-between gap-2"><b className="text-sm">{t.id}</b><span className="flex gap-1"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></span></div>
                <p className="mt-1 truncate text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-gray-500">{t.customerName} · {t.category} · {timeAgo(t.createdAt)}</p>
                {t.isDispute && <Badge tone="violet" className="mt-1">⚖️ {t.disputeParty}</Badge>}
              </button></li>
            ))}
            {!list.length && <li><Empty text="No tickets match" /></li>}
          </ul>
        </Card>

        {ticket ? (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">{ticket.subject}</h2><p className="text-sm text-gray-500">{ticket.id} · {ticket.category} · opened {fmtDateTime(ticket.createdAt)}</p></div>
              <div className="flex gap-2"><StatusBadge status={ticket.priority} /><StatusBadge status={ticket.status} /></div>
            </div>
            <div className="mt-4 grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs text-gray-500">Customer</p><Link to={`/admin/customers/${ticket.customerId}`} className="font-semibold text-brand-600 hover:underline">{ticket.customerName}</Link></div>
              <div><p className="text-xs text-gray-500">Order</p><Link to={`/admin/orders/${ticket.orderId}`} className="font-semibold text-brand-600 hover:underline">#{ticket.orderId}</Link>{order && <span className="text-gray-500"> · {currency(order.total)}</span>}</div>
              <div><p className="text-xs text-gray-500">Assignee</p><b>{ticket.assignee || 'Unassigned'}</b></div>
            </div>
            {edit && <div className="mt-4 flex flex-wrap gap-3">
              <label className="text-xs font-semibold text-gray-500">Priority <select className="input !w-auto !py-1.5" value={ticket.priority} onChange={(e) => patch(ticket.id, () => ({ priority: e.target.value }), { action: `Priority → ${e.target.value}` })}>{['low', 'medium', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}</select></label>
              <label className="text-xs font-semibold text-gray-500">Status <select className="input !w-auto !py-1.5" value={ticket.status} onChange={(e) => patch(ticket.id, () => ({ status: e.target.value }), { action: `Status → ${e.target.value}` })}>{['open', 'in_progress', 'resolved', 'closed'].map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}</select></label>
              <button className="btn-outline btn-sm self-end" onClick={() => patch(ticket.id, () => ({ assignee: user.name, status: ticket.status === 'open' ? 'in_progress' : ticket.status }), { action: 'Assigned to self' })}>Assign to me</button>
            </div>}

            <div className="mt-5 space-y-3">
              {ticket.messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.from === 'admin' ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={m.from === 'admin' ? 'A' : ticket.customerName} color={m.from === 'admin' ? 'from-brand-500 to-pink-500' : 'from-violet-500 to-indigo-400'} />
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'admin' ? 'bg-brand-50' : 'bg-gray-100'}`}><p>{m.text}</p><p className="mt-1 text-[11px] text-gray-400">{fmtDateTime(m.at)}</p></div>
                </div>
              ))}
            </div>
            {ticket.resolution && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">✅ Resolution: {ticket.resolution}</p>}

            {edit && !['resolved', 'closed'].includes(ticket.status) && <>
              <form onSubmit={send} className="mt-5">
                <textarea rows={3} aria-label="Reply" value={reply} onChange={(e) => { setReply(e.target.value); setErr('') }} placeholder="Type your reply to the customer…" className={`input resize-none ${err ? 'input-error' : ''}`} />
                {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
                <div className="mt-2 flex justify-end"><button className="btn-primary btn-sm">Send reply</button></div>
              </form>
              <div className="mt-5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4">
                <p className="mb-2 text-sm font-bold">{ticket.isDispute ? '⚖️ Resolve dispute' : '✅ Resolve ticket'}</p>
                <input className="input" aria-label="Resolution note" placeholder="Resolution note (required)" value={resolution} onChange={(e) => setResolution(e.target.value)} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-success btn-sm" onClick={() => resolve(resolution)}>Resolve</button>
                  {ticket.isDispute && order && order.payment.status === 'paid' && <>
                    <button className="btn-outline btn-sm" onClick={() => resolve(resolution || 'Full refund issued to customer', () => createRefund(order, order.total, `Dispute ${ticket.id}`))}>Resolve + full refund</button>
                    <button className="btn-outline btn-sm" onClick={() => resolve(resolution || 'Partial (50%) refund issued', () => createRefund(order, Math.round(order.total / 2), `Dispute ${ticket.id} (partial)`))}>Resolve + 50% refund</button>
                  </>}
                </div>
              </div>
            </>}
          </Card>
        ) : <Card><Empty emoji="💬" text="Select a ticket to view the conversation" /></Card>}
      </div>
    </div>
  )
}
