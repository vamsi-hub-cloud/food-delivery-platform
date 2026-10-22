import { motion } from 'framer-motion'
import { ORDER_STAGES } from '../utils/orderStatus'

export default function OrderTimeline({ current }) {
  return (
    <ol className="relative">
      {ORDER_STAGES.map((s, i) => {
        const done = i < current
        const active = i === current
        const last = i === ORDER_STAGES.length - 1
        return (
          <li key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!last && (
              <span className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 bg-gray-200">
                <motion.span className="block w-full bg-emerald-500" initial={{ height: 0 }} animate={{ height: done ? '100%' : 0 }} transition={{ duration: 0.6 }} />
              </span>
            )}
            <motion.div
              animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={active ? { repeat: Infinity, duration: 1.6 } : {}}
              className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${done || (active && last) ? 'bg-emerald-500 text-white' : active ? 'bg-brand-500 text-white shadow-lift' : 'bg-gray-100 text-gray-400'}`}
            >
              {done ? '✓' : s.emoji}
            </motion.div>
            <div className="pt-1">
              <p className={`font-semibold ${i > current ? 'text-gray-400' : ''}`}>{s.label}</p>
              <p className="text-sm text-gray-500">{s.desc}</p>
              {active && !last && <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">In progress…</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
