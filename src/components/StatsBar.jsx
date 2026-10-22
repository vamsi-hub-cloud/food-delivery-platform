import { motion } from 'framer-motion'
import CountUp from './CountUp'
import SectionHeader from './SectionHeader'
import { stats } from '../data/content'

export default function StatsBar() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 bg-animated animate-gradient p-6 py-12 text-white sm:p-12">
      <span className="absolute -left-6 -top-6 animate-float text-8xl opacity-20">🍕</span>
      <span className="absolute -bottom-6 -right-4 animate-float-slow text-8xl opacity-20">🍩</span>
      <SectionHeader light eyebrow="Our numbers" title="Trusted by food lovers everywhere" />
      <div className="relative grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05 }} className="rounded-2xl bg-white/15 p-5 text-center backdrop-blur">
            <div className="text-3xl">{s.emoji}</div>
            <p className="mt-1 text-3xl font-extrabold sm:text-4xl"><CountUp to={s.value} suffix={s.suffix} /></p>
            <p className="text-sm text-white/80">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
