import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Badge, Card, Field, PageHeader, StatusBadge } from '../components/ui'
import { fmtDateTime } from '../utils/analytics'

const AUDIENCES = ['All customers', 'New customers (30 days)', 'Inactive customers', 'Delivery partners', 'Restaurants']
const TEMPLATES = [
  ['🎉 Weekend offer', 'Weekend Feast: 20% off', 'Use code WEEKEND20 on orders above ₹349. Valid till Sunday!'],
  ['🛵 Free delivery', 'Free delivery today', 'Enjoy free delivery on all orders above ₹299 with FREEDEL.'],
  ['🔧 Maintenance', 'Scheduled maintenance', 'FoodiGo will be briefly unavailable tonight from 2–3 AM.'],
]
const blank = { title: '', message: '', audience: AUDIENCES[0], channels: ['push'], when: '' }

export default function Notifications() {
  const { notificationsSent, customers, partners, restaurants, update, can } = useAdmin()
  const toast = useToast()
  const [f, setF] = useState(blank)
  const [err, setErr] = useState({})
  const edit = can('support', 'edit')
  const reach = (a) => (a === 'Delivery partners' ? partners.length : a === 'Restaurants' ? restaurants.length : a === 'New customers (30 days)' ? Math.round(customers.length * 0.3) : a === 'Inactive customers' ? Math.round(customers.length * 0.25) : customers.length)
  const toggleCh = (c) => setF((x) => ({ ...x, channels: x.channels.includes(c) ? x.channels.filter((y) => y !== c) : [...x.channels, c] }))

  const send = (e) => {
    e.preventDefault()
    const er = {}
    if (f.title.trim().length < 4) er.title = 'Title must be at least 4 characters'
    if (f.message.trim().length < 10) er.message = 'Message must be at least 10 characters'
    if (!f.channels.length) er.channels = 'Select at least one channel'
    setErr(er)
    if (Object.keys(er).length) return
    const sched = f.when && new Date(f.when).getTime() > Date.now()
    update('notificationsSent', (l) => [{ id: `n${Date.now()}`, title: f.title.trim(), message: f.message.trim(), audience: f.audience, channels: f.channels, sentAt: sched ? new Date(f.when).getTime() : Date.now(), status: sched ? 'scheduled' : 'sent', reach: reach(f.audience) }, ...l], { action: sched ? 'Scheduled notification' : 'Sent notification', module: 'Support', target: f.title.trim(), details: f.audience })
    toast(sched ? 'Notification scheduled' : `Sent to ${reach(f.audience)} recipients`); setF(blank)
  }

  const cols = [
    { key: 'title', header: 'Notification', nowrap: false, render: (n) => <div className="min-w-[14rem]"><p className="font-semibold">{n.title}</p><p className="text-xs text-gray-500">{n.message}</p></div> },
    { key: 'audience', header: 'Audience' },
    { key: 'channels', header: 'Channels', sortable: false, render: (n) => <span className="flex gap-1">{n.channels.map((c) => <Badge key={c} tone="blue">{c}</Badge>)}</span> },
    { key: 'reach', header: 'Reach', render: (n) => n.reach.toLocaleString('en-IN') },
    { key: 'status', header: 'Status', render: (n) => <StatusBadge status={n.status} /> },
    { key: 'sentAt', header: 'Time', sortValue: (n) => n.sentAt, render: (n) => fmtDateTime(n.sentAt) },
  ]

  return (
    <div>
      <PageHeader emoji="🔔" title="Notifications" subtitle="Broadcast push, email and SMS messages to customers, partners and restaurants." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Card title="Compose notification">
          <div className="mb-4 flex flex-wrap gap-2">{TEMPLATES.map(([l, t, m]) => <button key={l} type="button" onClick={() => setF((x) => ({ ...x, title: t, message: m }))} className="chip !py-1 text-xs">{l}</button>)}</div>
          <form onSubmit={send} noValidate className="space-y-4">
            <Field label="Title" error={err.title}><input className={`input ${err.title ? 'input-error' : ''}`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={60} /></Field>
            <Field label="Message" error={err.message} hint={`${f.message.length}/200`}><textarea rows={4} maxLength={200} className={`input resize-none ${err.message ? 'input-error' : ''}`} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
            <Field label="Audience" hint={`Estimated reach: ${reach(f.audience).toLocaleString('en-IN')}`}><select className="input" value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}>{AUDIENCES.map((a) => <option key={a}>{a}</option>)}</select></Field>
            <Field label="Channels" error={err.channels}><div className="flex gap-4 text-sm font-medium">{['push', 'email', 'sms'].map((c) => <label key={c} className="flex items-center gap-2"><input type="checkbox" className="accent-brand-500" checked={f.channels.includes(c)} onChange={() => toggleCh(c)} /> {c.toUpperCase()}</label>)}</div></Field>
            <Field label="Schedule (optional)"><input type="datetime-local" className="input" value={f.when} onChange={(e) => setF({ ...f, when: e.target.value })} /></Field>
            <button className="btn-primary w-full" disabled={!edit}>{f.when ? 'Schedule notification' : 'Send now'}</button>
          </form>
        </Card>
        <Card title="Notification history"><DataTable columns={cols} rows={notificationsSent} pageSize={6} searchKeys={['title', 'audience']} /></Card>
      </div>
    </div>
  )
}
