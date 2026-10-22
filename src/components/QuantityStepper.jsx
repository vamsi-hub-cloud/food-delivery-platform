import { motion } from 'framer-motion'

export default function QuantityStepper({ qty, onInc, onDec, size = 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-sm' : 'h-9 w-9'
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 p-0.5">
      <button onClick={onDec} className={`${s} rounded-lg font-bold text-brand-600 transition hover:bg-white active:scale-90`} aria-label="Decrease quantity">−</button>
      <motion.span key={qty} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="min-w-6 text-center text-sm font-bold">{qty}</motion.span>
      <button onClick={onInc} className={`${s} rounded-lg font-bold text-brand-600 transition hover:bg-white active:scale-90`} aria-label="Increase quantity">+</button>
    </div>
  )
}
