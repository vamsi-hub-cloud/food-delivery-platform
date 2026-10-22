import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { faqs } from '../data/content'

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section>
      <SectionHeader eyebrow="❓ FAQ" title="Frequently asked questions" />
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className={`card overflow-hidden border-l-4 transition ${isOpen ? 'border-brand-500' : 'border-transparent'}`}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold sm:p-5">
                {f.q}
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-lg text-brand-600">+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm text-gray-600 sm:px-5 sm:pb-5">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
