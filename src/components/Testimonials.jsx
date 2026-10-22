import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { testimonials } from '../data/content'

export default function Testimonials() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [])
  const t = testimonials[i]
  return (
    <section>
      <SectionHeader eyebrow="💬 Reviews" title="What our customers say" />
      <div className="relative mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div key={t.name} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="card overflow-hidden p-6 text-center sm:p-10">
            <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${t.color} text-2xl font-bold text-white shadow-lg`}>{t.name[0]}</div>
            <div className="mt-3 text-amber-400">{'★'.repeat(t.rating)}<span className="text-gray-200">{'★'.repeat(5 - t.rating)}</span></div>
            <p className="mt-3 text-lg font-medium sm:text-xl">“{t.text}”</p>
            <p className="mt-4 text-sm font-bold">{t.name}</p>
            <p className="text-xs text-gray-500">{t.city}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex justify-center gap-2">
          {testimonials.map((x, idx) => (
            <button key={x.name} onClick={() => setI(idx)} aria-label={`Show review ${idx + 1}`} className={`h-2.5 rounded-full transition-all ${idx === i ? 'w-8 bg-brand-500' : 'w-2.5 bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
