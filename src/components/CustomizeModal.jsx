import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import VegDot from './VegDot'
import QuantityStepper from './QuantityStepper'
import { currency } from '../utils/format'

export default function CustomizeModal({ item, onClose, onConfirm }) {
  const [size, setSize] = useState(null)
  const [addons, setAddons] = useState([])
  const [notes, setNotes] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (item) {
      setSize(item.sizes ? item.sizes[0].name : null)
      setAddons([])
      setNotes('')
      setQty(1)
    }
  }, [item])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (item) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item) return <AnimatePresence />

  const sizeDelta = item.sizes?.find((s) => s.name === size)?.delta ?? 0
  const addonTotal = (item.addons || []).filter((a) => addons.includes(a.name)).reduce((s, a) => s + a.price, 0)
  const unit = item.price + sizeDelta + addonTotal
  const toggle = (name) => setAddons((a) => (a.includes(name) ? a.filter((x) => x !== name) : [...a, name]))

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          role="dialog" aria-modal="true" aria-label={`Customise ${item.name}`}
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl"
        >
          <div className="flex items-start justify-between border-b border-gray-100 p-5">
            <div>
              <div className="flex items-center gap-2"><VegDot veg={item.veg} /><h3 className="text-lg font-bold">{item.name}</h3></div>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
            <button onClick={onClose} className="btn-ghost !px-3 !py-1" aria-label="Close">✕</button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-5">
            {item.sizes && (
              <section>
                <h4 className="mb-2 text-sm font-bold">Choose size <span className="font-normal text-gray-400">(required)</span></h4>
                <div className="space-y-2">
                  {item.sizes.map((s) => (
                    <label key={s.name} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${size === s.name ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <input type="radio" name="size" checked={size === s.name} onChange={() => setSize(s.name)} className="accent-brand-500" />
                        {s.name}
                      </span>
                      <span className="text-sm text-gray-500">{s.delta === 0 ? 'Included' : `${s.delta > 0 ? '+' : '−'}${currency(Math.abs(s.delta))}`}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {item.addons && (
              <section>
                <h4 className="mb-2 text-sm font-bold">Add-ons <span className="font-normal text-gray-400">(optional)</span></h4>
                <div className="space-y-2">
                  {item.addons.map((a) => (
                    <label key={a.name} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${addons.includes(a.name) ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <input type="checkbox" checked={addons.includes(a.name)} onChange={() => toggle(a.name)} className="accent-brand-500" />
                        {a.name}
                      </span>
                      <span className="text-sm text-gray-500">+{currency(a.price)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h4 className="mb-2 text-sm font-bold">Special instructions</h4>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={120} rows={2} placeholder="e.g. Less spicy, no onions" className="input resize-none" />
            </section>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 p-4">
            <QuantityStepper qty={qty} onInc={() => setQty((q) => q + 1)} onDec={() => setQty((q) => Math.max(1, q - 1))} />
            <button className="btn-primary flex-1" onClick={() => onConfirm({ item, size, addons, notes, qty, unit })}>
              Add to cart · {currency(unit * qty)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
