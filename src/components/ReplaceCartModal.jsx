import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function ReplaceCartModal() {
  const { pending, confirmReplace, cancelReplace, restaurant } = useCart()
  return (
    <AnimatePresence>
      {pending && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card w-full max-w-sm p-6 text-center" role="alertdialog">
            <div className="text-4xl">🛒</div>
            <h3 className="mt-3 text-lg font-bold">Replace cart items?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your cart has items from <b>{restaurant?.name}</b>. Adding this item will clear your current cart.
            </p>
            <div className="mt-6 flex gap-3">
              <button className="btn-outline flex-1" onClick={cancelReplace}>Keep cart</button>
              <button className="btn-primary flex-1" onClick={confirmReplace}>Replace</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
