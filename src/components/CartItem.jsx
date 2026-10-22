import { motion } from 'framer-motion'
import VegDot from './VegDot'
import QuantityStepper from './QuantityStepper'
import { currency } from '../utils/format'
import { useCart } from '../context/CartContext'

export default function CartItem({ item }) {
  const { increase, decrease, remove } = useCart()
  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0 }} className="flex items-start gap-4 border-b border-gray-100 py-4 last:border-0">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-50 text-3xl">{item.emoji}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><VegDot veg={item.veg} /><h4 className="truncate font-semibold">{item.name}</h4></div>
        {(item.size || item.addons.length > 0) && (
          <p className="mt-0.5 text-xs text-gray-500">{[item.size, ...item.addons].filter(Boolean).join(' • ')}</p>
        )}
        {item.notes && <p className="mt-0.5 text-xs italic text-gray-400">“{item.notes}”</p>}
        <div className="mt-2 flex items-center gap-3">
          <QuantityStepper size="sm" qty={item.qty} onInc={() => increase(item.key)} onDec={() => decrease(item.key)} />
          <button onClick={() => remove(item.key)} className="text-xs font-medium text-red-500 hover:underline">Remove</button>
        </div>
      </div>
      <p className="font-bold">{currency(item.price * item.qty)}</p>
    </motion.div>
  )
}
