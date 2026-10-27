import { useState } from 'react'
import { motion } from 'framer-motion'

export const PALETTE = ['#f95a16', '#ec4899', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#14b8a6']

const nice = (max) => { if (max <= 0) return 1; const p = 10 ** Math.floor(Math.log10(max)); const n = max / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p }

export function AreaChart({ data, series, height = 230, format = (v) => v }) {
  const [hover, setHover] = useState(null)
  const W = 640, H = height, pl = 44, pr = 12, pt = 14, pb = 26
  const max = nice(Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0))))
  const x = (i) => pl + (data.length === 1 ? 0 : (i * (W - pl - pr)) / (data.length - 1))
  const y = (v) => pt + (1 - v / max) * (H - pt - pb)
  const step = Math.ceil(data.length / 7)
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Line chart" onMouseLeave={() => setHover(null)}>
        <defs>{series.map((s) => <linearGradient key={s.key} id={`g-${s.key}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={s.color} stopOpacity="0.28" /><stop offset="100%" stopColor={s.color} stopOpacity="0" /></linearGradient>)}</defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}><line x1={pl} x2={W - pr} y1={y(max * t)} y2={y(max * t)} stroke="#eceff3" /><text x={pl - 6} y={y(max * t) + 4} textAnchor="end" fontSize="10" fill="#9aa3b2">{format(max * t)}</text></g>
        ))}
        {data.map((d, i) => i % step === 0 && <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9aa3b2">{d.label}</text>)}
        {series.map((s) => {
          const pts = data.map((d, i) => `${x(i)},${y(d[s.key] || 0)}`)
          return (
            <g key={s.key}>
              <path d={`M${x(0)},${y(0)} L${pts.join(' L')} L${x(data.length - 1)},${y(0)} Z`} fill={`url(#g-${s.key})`} />
              <motion.polyline points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            </g>
          )
        })}
        {data.map((d, i) => <rect key={i} x={x(i) - (W - pl - pr) / data.length / 2} y={0} width={(W - pl - pr) / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />)}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={H - pb} stroke="#cbd2dc" strokeDasharray="4 3" />
            {series.map((s) => <circle key={s.key} cx={x(hover)} cy={y(data[hover][s.key] || 0)} r="4.5" fill="#fff" stroke={s.color} strokeWidth="2.5" />)}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-2 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg" style={{ left: `${Math.min(75, Math.max(2, (x(hover) / W) * 100 - 8))}%` }}>
          <p className="mb-1 font-semibold">{data[hover].label}</p>
          {series.map((s) => <p key={s.key} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label}: <b>{format(data[hover][s.key] || 0)}</b></p>)}
        </div>
      )}
      {series.length > 1 && <div className="mt-1 flex justify-center gap-4 text-xs text-gray-500">{series.map((s) => <span key={s.key} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label}</span>)}</div>}
    </div>
  )
}

export function BarChart({ data, height = 200, color = '#f95a16', format = (v) => v, highlightMax = true }) {
  const [hover, setHover] = useState(null)
  const W = 640, H = height, pl = 34, pb = 24, pt = 10
  const max = nice(Math.max(1, ...data.map((d) => d.value)))
  const bw = (W - pl) / data.length
  const top = Math.max(...data.map((d) => d.value))
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Bar chart" onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((t) => <g key={t}><line x1={pl} x2={W} y1={pt + (1 - t) * (H - pt - pb)} y2={pt + (1 - t) * (H - pt - pb)} stroke="#eceff3" /><text x={pl - 5} y={pt + (1 - t) * (H - pt - pb) + 4} textAnchor="end" fontSize="10" fill="#9aa3b2">{format(max * t)}</text></g>)}
        {data.map((d, i) => {
          const h = (d.value / max) * (H - pt - pb)
          const on = highlightMax && d.value === top && top > 0
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <motion.rect x={pl + i * bw + bw * 0.15} width={bw * 0.7} rx="4" fill={d.color || (on ? '#ec4899' : color)} opacity={hover === null || hover === i ? 1 : 0.55}
                initial={{ y: H - pb, height: 0 }} animate={{ y: H - pb - h, height: h }} transition={{ duration: 0.6, delay: i * 0.015 }} />
              {(data.length <= 12 || i % 2 === 0) && <text x={pl + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#9aa3b2">{d.label}</text>}
            </g>
          )
        })}
      </svg>
      {hover !== null && <div className="pointer-events-none absolute right-2 top-0 rounded-lg bg-ink px-3 py-1.5 text-xs text-white shadow-lg">{data[hover].label}: <b>{format(data[hover].value)}</b></div>}
    </div>
  )
}

export function Donut({ data, size = 170, format = (v) => v, center }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 52, c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="Donut chart">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f3f6" strokeWidth="18" />
        {data.map((d, i) => {
          const len = (d.value / total) * c
          const el = <motion.circle key={d.label} cx="70" cy="70" r={r} fill="none" stroke={d.color || PALETTE[i % PALETTE.length]} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} />
          acc += len
          return el
        })}
        <text x="70" y="68" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1f2430">{center ?? total}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="9" fill="#9aa3b2">TOTAL</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => <li key={d.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color || PALETTE[i % PALETTE.length] }} /><span className="text-gray-600">{d.label}</span><b className="ml-auto pl-3">{format(d.value)}</b></li>)}
      </ul>
    </div>
  )
}

export function Heatmap({ matrix }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const max = Math.max(1, ...matrix.flat())
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="ml-10 flex text-[10px] text-gray-400">{Array.from({ length: 24 }, (_, h) => <span key={h} className="flex-1 text-center">{h % 3 === 0 ? h : ''}</span>)}</div>
        {matrix.map((row, d) => (
          <div key={d} className="mt-1 flex items-center">
            <span className="w-10 text-xs text-gray-500">{days[d]}</span>
            {row.map((v, h) => <span key={h} title={`${days[d]} ${h}:00 — ${v} orders`} className="mx-px h-6 flex-1 rounded-sm" style={{ background: v ? `rgba(249,90,22,${0.12 + (v / max) * 0.88})` : '#f3f4f6' }} />)}
          </div>
        ))}
        <p className="mt-2 text-right text-[10px] text-gray-400">Fewer orders <span className="inline-block h-2 w-16 rounded bg-gradient-to-r from-orange-100 to-brand-500 align-middle" /> More orders</p>
      </div>
    </div>
  )
}

export function RankList({ items, format = (v) => v, color = 'from-brand-500 to-pink-500', sub }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm"><span className="truncate font-medium"><span className="mr-2 text-gray-400">{i + 1}</span>{it.label}</span><span className="font-bold">{format(it.value)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100"><motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`} initial={{ width: 0 }} animate={{ width: `${(it.value / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 }} /></div>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub(it)}</p>}
        </li>
      ))}
    </ul>
  )
}

export function Sparkline({ values, color = '#f95a16', w = 90, h = 28 }) {
  const max = Math.max(...values, 1)
  const pts = values.map((v, i) => `${(i / (values.length - 1 || 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg>
}
