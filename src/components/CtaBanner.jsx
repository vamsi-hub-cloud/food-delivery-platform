import { motion } from 'framer-motion'
import Reveal from './Reveal'

export default function CtaBanner() {
  const cards = [
    { emoji: '📱', title: 'Get the FoodiGo app', text: 'Order faster and unlock app-only offers.', btn: 'Coming soon', grad: 'from-sky-500 to-indigo-600' },
    { emoji: '🏪', title: 'Partner with us', text: 'Grow your restaurant with thousands of new customers.', btn: 'Register restaurant', grad: 'from-emerald-500 to-teal-600' },
    { emoji: '🛵', title: 'Ride with us', text: 'Flexible hours and great earnings as a delivery partner.', btn: 'Become a rider', grad: 'from-orange-500 to-pink-600' },
  ]
  return (
    <section className="grid gap-5 md:grid-cols-3">
      {cards.map((c, i) => (
        <Reveal key={c.title} delay={i * 0.1}>
          <motion.div whileHover={{ y: -6 }} className={`relative h-full overflow-hidden rounded-3xl bg-gradient-to-br ${c.grad} p-6 text-white shadow-card`}>
            <span className="absolute -right-4 -top-4 animate-float text-8xl opacity-20">{c.emoji}</span>
            <div className="text-4xl">{c.emoji}</div>
            <h3 className="mt-3 text-xl font-extrabold">{c.title}</h3>
            <p className="mt-1 text-sm text-white/85">{c.text}</p>
            <span className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink">{c.btn}</span>
          </motion.div>
        </Reveal>
      ))}
    </section>
  )
}
