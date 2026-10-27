import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import { Card, Field, PageHeader, Toggle } from '../components/ui'
import { currency } from '../../utils/format'

const FIELDS = [
  ['Delivery charges', [['baseDeliveryFee', 'Base delivery fee (₹)', 0, 200], ['perKmFee', 'Fee per km (₹)', 0, 50], ['freeDeliveryAbove', 'Free delivery above (₹)', 0, 5000], ['minOrderValue', 'Minimum order value (₹)', 0, 1000]]],
  ['Platform charges', [['platformFee', 'Platform fee (₹)', 0, 50], ['packagingCharge', 'Packaging charge (₹)', 0, 100], ['defaultCommission', 'Default restaurant commission (%)', 0, 40]]],
  ['Taxes (GST %)', [['gstFood', 'GST on food', 0, 28], ['gstDelivery', 'GST on delivery', 0, 28], ['gstPlatform', 'GST on platform fee', 0, 28]]],
]

export default function Pricing() {
  const { pricing, update, can } = useAdmin()
  const toast = useToast()
  const [f, setF] = useState(() => ({ ...pricing, surgeRules: pricing.surgeRules.map((r) => ({ ...r })) }))
  const [er, setEr] = useState({})
  const edit = can('settings', 'edit')
  const dirty = JSON.stringify(f) !== JSON.stringify(pricing)
  const setRule = (id, k, v) => setF((x) => ({ ...x, surgeRules: x.surgeRules.map((r) => (r.id === id ? { ...r, [k]: v } : r)) }))

  const save = () => {
    const e = {}
    FIELDS.forEach(([, list]) => list.forEach(([k, l, mn, mx]) => { const v = Number(f[k]); if (f[k] === '' || Number.isNaN(v) || v < mn || v > mx) e[k] = `${mn}–${mx}` }))
    if (!/^\d+(,\s*\d+)*$/.test(String(f.tipOptions).trim())) e.tipOptions = 'Use comma-separated numbers, e.g. 10,20,30'
    f.surgeRules.forEach((r) => { if (Number(r.multiplier) < 1 || Number(r.multiplier) > 3) e[`m${r.id}`] = '1–3'; if (r.from >= r.to) e[`t${r.id}`] = 'End must be after start' })
    setEr(e)
    if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'error')
    const clean = { ...f }
    FIELDS.forEach(([, list]) => list.forEach(([k]) => { clean[k] = Number(f[k]) }))
    clean.surgeRules = f.surgeRules.map((r) => ({ ...r, multiplier: Number(r.multiplier) }))
    update('pricing', () => clean, { action: 'Updated pricing settings', module: 'Settings', target: 'Pricing' }); toast('Pricing settings saved')
  }
  // sample order preview
  const subtotal = 500, dist = 4
  const fee = subtotal >= Number(f.freeDeliveryAbove) ? 0 : Number(f.baseDeliveryFee) + Number(f.perKmFee) * dist
  const total = subtotal + fee + Number(f.platformFee) + Number(f.packagingCharge) + Math.round(subtotal * (Number(f.gstFood) / 100))

  return (
    <div>
      <PageHeader emoji="💲" title="Pricing Settings" subtitle="Delivery fees, platform charges, taxes and surge pricing rules."
        actions={edit && <><button className="btn-outline btn-sm" disabled={!dirty} onClick={() => { setF({ ...pricing, surgeRules: pricing.surgeRules.map((r) => ({ ...r })) }); setEr({}) }}>Reset</button><button className="btn-primary btn-sm" disabled={!dirty} onClick={save}>Save changes</button></>} />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {FIELDS.map(([title, list]) => (
            <Card key={title} title={title}><div className="grid gap-4 sm:grid-cols-2">{list.map(([k, l]) => <Field key={k} label={l} error={er[k] && `Enter a value ${er[k]}`}><input type="number" min="0" disabled={!edit} className={`input ${er[k] ? 'input-error' : ''}`} value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setEr({ ...er, [k]: undefined }) }} /></Field>)}</div>{title === 'Platform charges' && <Field label="Tip options (₹)" error={er.tipOptions} className="mt-4"><input disabled={!edit} className={`input ${er.tipOptions ? 'input-error' : ''}`} value={f.tipOptions} onChange={(e) => { setF({ ...f, tipOptions: e.target.value }); setEr({ ...er, tipOptions: undefined }) }} /></Field>}</Card>
          ))}
          <Card title="Surge pricing rules">
            <div className="space-y-3">{f.surgeRules.map((r) => (
              <div key={r.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3">
                <Toggle label={`${r.label} enabled`} checked={r.enabled} disabled={!edit} onChange={(v) => setRule(r.id, 'enabled', v)} />
                <Field label="Rule" className="min-w-[8rem] flex-1"><input disabled={!edit} className="input !py-1.5" value={r.label} onChange={(e) => setRule(r.id, 'label', e.target.value)} /></Field>
                <Field label="From"><input type="time" disabled={!edit} className="input !py-1.5" value={r.from} onChange={(e) => setRule(r.id, 'from', e.target.value)} /></Field>
                <Field label="To" error={er[`t${r.id}`]}><input type="time" disabled={!edit} className="input !py-1.5" value={r.to} onChange={(e) => setRule(r.id, 'to', e.target.value)} /></Field>
                <Field label="Multiplier" error={er[`m${r.id}`]}><input type="number" step="0.1" disabled={!edit} className="input !w-24 !py-1.5" value={r.multiplier} onChange={(e) => setRule(r.id, 'multiplier', e.target.value)} /></Field>
              </div>))}</div>
          </Card>
        </div>
        <Card title="Live preview" className="h-fit xl:sticky xl:top-24">
          <p className="mb-3 text-sm text-gray-500">Sample order: ₹{subtotal} food · {dist} km</p>
          {[['Food subtotal', currency(subtotal)], ['Delivery fee', fee ? currency(fee) : 'FREE'], ['Platform fee', currency(Number(f.platformFee) || 0)], ['Packaging', currency(Number(f.packagingCharge) || 0)], [`GST on food (${f.gstFood}%)`, currency(Math.round(subtotal * (Number(f.gstFood) / 100)))]].map(([k, v]) => <div key={k} className="flex justify-between border-b border-dashed border-gray-100 py-2 text-sm"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>)}
          <div className="flex justify-between pt-3 text-lg font-extrabold"><span>Customer pays</span><span className="text-brand-600">{currency(total)}</span></div>
        </Card>
      </div>
    </div>
  )
}
