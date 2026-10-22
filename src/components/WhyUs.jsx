import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import Reveal from './Reveal'
import { features } from '../data/content'

export default function WhyUs() {
  return (
    <section>
      <SectionHeader eyebrow="Why FoodiGo" title="Everything you love, delivered" subtitle="Quality, speed and delightful experiences at every step." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.1}>
            <motion.div whileHover={{ y: -6, scale: 1.02 }} className={`flex h-full items-start gap-4 rounded-2xl ${f.bg} p-5 ring-1 ${f.ring}`}>
              <motion.span whileHover={{ rotate: [0, -15, 15, 0] }} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-card">{f.emoji}</motion.span>
              <div><h3 className="font-bold">{f.title}</h3><p className="mt-1 text-sm text-gray-600">{f.text}</p></div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
