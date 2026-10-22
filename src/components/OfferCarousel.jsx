import { motion } from 'framer-motion'
import { offers } from '../data/restaurants'
import { useToast } from '../context/ToastContext'

export default function OfferCarousel() {
  const toast = useToast()
  const copy = async (code) => {
    try { await navigator.clipboard.writeText(code) } catch { /* ignore */ }
    toast(`Coupon ${code} copied!`)
  }
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0">
      {offers.map((o, i) => (
        <motion.button
          key={o.id}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => copy(o.code)}
          className={`relative flex min-w-[260px] snap-start items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r ${o.gradient} p-5 text-left text-white shadow-card sm:min-w-[300px]`}
        >
          <div>
            <p className="text-lg font-extrabold leading-tight">{o.title}</p>
            <p className="mt-0.5 text-sm text-white/90">{o.subtitle}</p>
            <p className="mt-3 inline-block rounded-md border border-dashed border-white/70 px-2 py-0.5 text-xs font-bold tracking-widest">{o.code}</p>
          </div>
          <span className="text-5xl drop-shadow">{o.emoji}</span>
        </motion.button>
      ))}
    </div>
  )
}
