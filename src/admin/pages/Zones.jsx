import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import { Badge, Card, Field, Modal, PageHeader, StatCard, Toggle } from '../components/ui'
import { currency } from '../../utils/format'

const blank = { name: '', radiusKm: '5', baseFee: '30', perKmFee: '7', minOrder: '149', avgDeliveryMin: '30', surge: false, surgeMultiplier: '1.2', active: true }
const COLORS = ['#f95a16', '#ec4899', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b']

export default function Zones() {
  const { zones, partners, update, can } = useAdmin()
  const toast = useToast()
  const [f, setF] = useState(null)
  const [er, setEr] = useState({})
  const edit = can('settings', 'edit')
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setEr((x) => ({ ...x, [k]: undefined })) }

  const save = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Zone name is required'
    else if (zones.some((z) => z.id !== f.id && z.name.toLowerCase() === f.name.trim().toLowerCase())) e.name = 'A zone with this name already exists'
    ;[['radiusKm', 1, 30], ['baseFee', 0, 200], ['perKmFee', 0, 50], ['minOrder', 0, 1000], ['avgDeliveryMin', 5, 120]].forEach(([k, mn, mx]) => { const v = Number(f[k]); if (f[k] === '' || Number.isNaN(v) || v < mn || v > mx) e[k] = `Enter ${mn}–${mx}` })
    if (f.surge && (Number(f.surgeMultiplier) < 1 || Number(f.surgeMultiplier) > 3)) e.surgeMultiplier = 'Multiplier must be 1–3'
    setEr(e)
    if (Object.keys(e).length) return
    const z = { id: f.id || `z${Date.now()}`, name: f.name.trim(), city: 'Hyderabad', radiusKm: Number(f.radiusKm), baseFee: Number(f.baseFee), perKmFee: Number(f.perKmFee), minOrder: Number(f.minOrder), avgDeliveryMin: Number(f.avgDeliveryMin), surge: f.surge, surgeMultiplier: Number(f.surgeMultiplier), active: f.active }
    update('zones', (l) => (f.id ? l.map((x) => (x.id === z.id ? z : x)) : [...l, z]), { action: f.id ? 'Updated delivery zone' : 'Created delivery zone', module: 'Settings', target: z.name })
    toast(f.id ? 'Zone updated' : 'Zone created'); setF(null)
  }
  const toggle = (z, k, v) => update('zones', (l) => l.map((x) => (x.id === z.id ? { ...x, [k]: v } : x)), { action: `${k === 'active' ? (v ? 'Activated' : 'Deactivated') : v ? 'Enabled surge in' : 'Disabled surge in'} zone`, module: 'Settings', target: z.name })

  return (
    <div>
      <PageHeader emoji="🗺️" title="Delivery Zones" subtitle="Define service areas, delivery radius, fees and surge pricing per zone."
        actions={can('settings', 'create') && <button className="btn-primary btn-sm" onClick={() => { setF(blank); setEr({}) }}>+ Add zone</button>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Zones" value={zones.length} icon="🗺️" color="orange" /><StatCard label="Active" value={zones.filter((z) => z.active).length} icon="✅" color="emerald" /><StatCard label="Surge enabled" value={zones.filter((z) => z.surge).length} icon="⚡" color="amber" /><StatCard label="Partners online" value={partners.filter((p) => p.online).length} icon="🛵" color="sky" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card title="Coverage map (illustrative)">
          <svg viewBox="0 0 400 320" className="w-full rounded-2xl bg-sky-50" role="img" aria-label="Zone coverage map">
            {[0, 1, 2, 3, 4].map((i) => <line key={`h${i}`} x1="0" x2="400" y1={i * 80} y2={i * 80} stroke="#e0f2fe" />)}{[0, 1, 2, 3, 4, 5].map((i) => <line key={`v${i}`} y1="0" y2="320" x1={i * 80} x2={i * 80} stroke="#e0f2fe" />)}
            {zones.map((z, i) => { const cx = 70 + (i % 3) * 130 + (i % 2) * 15, cy = 80 + Math.floor(i / 3) * 130; return (
              <g key={z.id} opacity={z.active ? 1 : 0.35}>
                <motion.circle cx={cx} cy={cy} r={z.radiusKm * 7} fill={COLORS[i % 6]} fillOpacity="0.18" stroke={COLORS[i % 6]} strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} style={{ transformOrigin: `${cx}px ${cy}px` }} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1f2430">{z.name.split(' ')[0]}</text><text x={cx} y={cy + 17} textAnchor="middle" fontSize="9" fill="#64748b">{z.radiusKm} km</text>
              </g>) })}
          </svg>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {zones.map((z, i) => (
            <Card key={z.id} className={z.active ? '' : 'opacity-70'}>
              <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % 6] }} /><h3 className="font-bold">{z.name}</h3></div>{z.surge && <Badge tone="amber">⚡ {z.surgeMultiplier}×</Badge>}</div>
              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm"><dt className="text-gray-500">Radius</dt><dd className="font-semibold">{z.radiusKm} km</dd><dt className="text-gray-500">Base fee</dt><dd className="font-semibold">{currency(z.baseFee)}</dd><dt className="text-gray-500">Per km</dt><dd className="font-semibold">{currency(z.perKmFee)}</dd><dt className="text-gray-500">Min. order</dt><dd className="font-semibold">{currency(z.minOrder)}</dd><dt className="text-gray-500">Avg. time</dt><dd className="font-semibold">{z.avgDeliveryMin} min</dd></dl>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold"><label className="flex items-center gap-2">Active <Toggle label={`${z.name} active`} checked={z.active} disabled={!edit} onChange={(v) => toggle(z, 'active', v)} /></label><label className="flex items-center gap-2">Surge <Toggle label={`${z.name} surge`} checked={z.surge} disabled={!edit} onChange={(v) => toggle(z, 'surge', v)} /></label></div>
              {edit && <div className="mt-3 flex gap-2"><button className="btn-outline btn-sm flex-1" onClick={() => { setF({ ...z, radiusKm: String(z.radiusKm), baseFee: String(z.baseFee), perKmFee: String(z.perKmFee), minOrder: String(z.minOrder), avgDeliveryMin: String(z.avgDeliveryMin), surgeMultiplier: String(z.surgeMultiplier) }); setEr({}) }}>Edit</button><button className="btn-danger btn-sm" onClick={() => { update('zones', (l) => l.filter((x) => x.id !== z.id), { action: 'Deleted delivery zone', module: 'Settings', target: z.name }); toast('Zone deleted') }}>Delete</button></div>}
            </Card>
          ))}
        </div>
      </div>
      <Modal open={!!f} onClose={() => setF(null)} title={f?.id ? 'Edit zone' : 'Add delivery zone'} footer={<><button className="btn-outline" onClick={() => setF(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save zone</button></>}>
        {f && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Zone name" error={er.name} className="sm:col-span-2"><input className={`input ${er.name ? 'input-error' : ''}`} value={f.name} onChange={set('name')} /></Field>
          {[['radiusKm', 'Delivery radius (km)'], ['baseFee', 'Base delivery fee (₹)'], ['perKmFee', 'Fee per km (₹)'], ['minOrder', 'Minimum order (₹)'], ['avgDeliveryMin', 'Avg. delivery time (min)']].map(([k, l]) => <Field key={k} label={l} error={er[k]}><input type="number" className={`input ${er[k] ? 'input-error' : ''}`} value={f[k]} onChange={set(k)} /></Field>)}
          <Field label="Surge multiplier" error={er.surgeMultiplier}><input type="number" step="0.1" className={`input ${er.surgeMultiplier ? 'input-error' : ''}`} value={f.surgeMultiplier} onChange={set('surgeMultiplier')} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="accent-brand-500" checked={f.surge} onChange={(e) => setF({ ...f, surge: e.target.checked })} /> Enable surge pricing</label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="accent-brand-500" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Zone active</label>
        </div>}
      </Modal>
    </div>
  )
}
