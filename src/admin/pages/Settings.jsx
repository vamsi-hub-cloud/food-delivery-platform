import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import { Card, Field, PageHeader, Toggle } from '../components/ui'
import { ReasonModal } from './shared'

const TOGGLES = [
  ['Orders & operations', [['autoAssignPartners', 'Auto-assign delivery partners', 'Automatically assign the nearest online partner to new orders'], ['requireRestaurantApproval', 'Require restaurant approval', 'New restaurants must be approved before going live'], ['requirePartnerKyc', 'Require partner KYC', 'Partners need verified documents to go online'], ['maintenanceMode', 'Maintenance mode', 'Temporarily disable ordering on the customer site']]],
  ['Payment methods', [['allowCOD', 'Cash on delivery', ''], ['allowUPI', 'UPI', ''], ['allowCards', 'Credit / debit cards', ''], ['allowWallet', 'Wallets', 'Coming soon']]],
  ['Alerts', [['emailAlerts', 'Email alerts', 'Order, payment and support emails'], ['smsAlerts', 'SMS alerts', 'Critical OTP and delivery SMS'], ['pushAlerts', 'Push notifications', 'App and browser push']]],
]

export default function Settings() {
  const { settings, update, resetData, can, user } = useAdmin()
  const toast = useToast()
  const [f, setF] = useState({ ...settings })
  const [er, setEr] = useState({})
  const [reset, setReset] = useState(false)
  const edit = can('settings', 'edit')
  const dirty = JSON.stringify(f) !== JSON.stringify(settings)

  const save = () => {
    const e = {}
    if (f.platformName.trim().length < 2) e.platformName = 'Platform name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.supportEmail.trim())) e.supportEmail = 'Enter a valid email'
    if (f.supportPhone.replace(/\D/g, '').length < 8) e.supportPhone = 'Enter a valid phone number'
    if (!(Number(f.autoCancelMinutes) >= 1 && Number(f.autoCancelMinutes) <= 60)) e.autoCancelMinutes = 'Enter 1–60 minutes'
    if (!(Number(f.maxOrderValueCOD) >= 100)) e.maxOrderValueCOD = 'Enter at least ₹100'
    setEr(e)
    if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'error')
    if (!f.allowCOD && !f.allowUPI && !f.allowCards && !f.allowWallet) return toast('Enable at least one payment method', 'error')
    update('settings', () => ({ ...f, autoCancelMinutes: Number(f.autoCancelMinutes), maxOrderValueCOD: Number(f.maxOrderValueCOD) }), { action: 'Updated platform settings', module: 'Settings', target: 'Platform' }); toast('Settings saved')
  }
  const text = (k, l, type = 'text') => <Field label={l} error={er[k]}><input type={type} disabled={!edit} className={`input ${er[k] ? 'input-error' : ''}`} value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setEr({ ...er, [k]: undefined }) }} /></Field>

  return (
    <div>
      <PageHeader emoji="⚙️" title="Platform Settings" subtitle="General configuration, payment methods, automation and alerts."
        actions={edit && <><button className="btn-outline btn-sm" disabled={!dirty} onClick={() => { setF({ ...settings }); setEr({}) }}>Discard</button><button className="btn-primary btn-sm" disabled={!dirty} onClick={save}>Save changes</button></>} />
      {f.maintenanceMode && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-700">⚠️ Maintenance mode is ON — customers will not be able to place orders after you save.</p>}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="General">
          <div className="grid gap-4 sm:grid-cols-2">{text('platformName', 'Platform name')}{text('supportEmail', 'Support email', 'email')}{text('supportPhone', 'Support phone')}
            <Field label="Currency"><select disabled={!edit} className="input" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}><option>INR (₹)</option><option>USD ($)</option></select></Field>
            <Field label="Timezone"><select disabled={!edit} className="input" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })}><option>Asia/Kolkata (IST)</option><option>UTC</option></select></Field>
            <Field label="Language"><select disabled={!edit} className="input" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })}><option>English</option><option>Hindi</option><option>Telugu</option></select></Field>
            {text('autoCancelMinutes', 'Auto-cancel unaccepted orders after (min)', 'number')}{text('maxOrderValueCOD', 'Max COD order value (₹)', 'number')}</div>
        </Card>
        {TOGGLES.map(([title, list]) => (
          <Card key={title} title={title}><ul className="divide-y divide-gray-100">{list.map(([k, l, d]) => <li key={k} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-semibold">{l}</p>{d && <p className="text-xs text-gray-500">{d}</p>}</div><Toggle label={l} checked={f[k]} disabled={!edit} onChange={(v) => setF({ ...f, [k]: v })} /></li>)}</ul></Card>
        ))}
        <Card title="Danger zone"><p className="text-sm text-gray-600">Reset all admin demo data (orders, restaurants, customers, coupons, logs…) back to the original sample dataset.</p><button disabled={user.roleId !== 'role1'} className="btn-danger mt-4" onClick={() => setReset(true)}>Reset demo data</button>{user.roleId !== 'role1' && <p className="mt-2 text-xs text-gray-400">Only a Super Admin can reset data.</p>}</Card>
      </div>
      <ReasonModal open={reset} danger requireReason={null} title="Reset all demo data?" text="This cannot be undone. You will stay signed in." confirmLabel="Reset data" onClose={() => setReset(false)} onConfirm={() => { resetData(); setReset(false); toast('Demo data reset') }} />
    </div>
  )
}
