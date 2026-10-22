import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import Reveal from './Reveal'
import { steps } from '../data/content'

export default function HowItWorks() {
  return (
    <section>
      <SectionHeader eyebrow="Simple as 1-2-3-4" title="How FoodiGo works" subtitle="From craving to doorstep in four easy steps." />
      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-12 hidden border-t-2 border-dashed border-brand-300 lg:block" />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1}>
            <motion.div whileHover={{ y: -8 }} className="card relative p-6 text-center">
              <span className="absolute -top-3 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
              <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${s.color} text-4xl shadow-lg`}>{s.emoji}</motion.div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{s.text}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
