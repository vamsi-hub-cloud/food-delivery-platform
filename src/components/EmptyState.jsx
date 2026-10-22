import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function EmptyState({ emoji = '🍽️', title, message, actionLabel, to = '/' }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card mx-auto max-w-md p-10 text-center">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">{emoji}</motion.div>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {actionLabel && <Link to={to} className="btn-primary mt-6">{actionLabel}</Link>}
    </motion.div>
  )
}
