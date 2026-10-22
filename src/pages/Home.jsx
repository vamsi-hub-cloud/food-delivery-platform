import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SearchBar from '../components/SearchBar'
import OfferCarousel from '../components/OfferCarousel'
import CategoryChips from '../components/CategoryChips'
import RestaurantExplorer from '../components/RestaurantExplorer'
import Marquee from '../components/Marquee'
import SectionHeader from '../components/SectionHeader'
import PopularDishes from '../components/PopularDishes'
import HowItWorks from '../components/HowItWorks'
import StatsBar from '../components/StatsBar'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import CtaBanner from '../components/CtaBanner'
import FAQ from '../components/FAQ'
import { categories } from '../data/restaurants'

const floaters = [
  { e: '🍟', top: '2%', left: '-10%', d: 'animate-float' },
  { e: '🥤', top: '68%', left: '-14%', d: 'animate-float-slow' },
  { e: '🍕', top: '78%', left: '90%', d: 'animate-float' },
  { e: '🍩', top: '4%', left: '92%', d: 'animate-float-slow' },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const listRef = useRef(null)
  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <PageTransition>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-pink-500 to-violet-600 bg-animated animate-gradient">
        <motion.div className="absolute -right-16 -top-16 text-[12rem] opacity-20" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}>🍕</motion.div>
        <motion.div className="absolute -bottom-20 -left-10 text-[10rem] opacity-15" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}>🍩</motion.div>
        <div className="container-page relative grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">🔥 Free delivery on your first order</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Hungry? We deliver <span className="bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent">happiness</span> in minutes.
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-4 max-w-md text-white/90">
              Order from top-rated restaurants, explore full dish details, customise your meal and track it live.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8 max-w-xl">
              <SearchBar value={query} onChange={(v) => { setQuery(v); if (v) scrollToList() }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-white">
              {['⚡ 28 min avg delivery', '⭐ 4.5 avg rating', '🎟️ Daily coupons'].map((t) => <span key={t} className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">{t}</span>)}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="hidden justify-center md:flex">
            <div className="relative">
              <div className="grid h-72 w-72 place-items-center rounded-full bg-white/25 text-[9rem] backdrop-blur lg:h-80 lg:w-80"><span className="animate-wiggle">🍔</span></div>
              {floaters.map((f) => <span key={f.e} className={`absolute text-5xl ${f.d}`} style={{ top: f.top, left: f.left }}>{f.e}</span>)}
            </div>
          </motion.div>
        </div>
        <div className="relative pb-6"><Marquee slow items={categories} /></div>
      </section>

      <div className="container-page space-y-16 py-12 sm:space-y-20">
        <section>
          <SectionHeader eyebrow="🎟️ Deals" title="Offers for you" subtitle="Tap an offer to copy the code, then apply it in your cart." />
          <OfferCarousel />
        </section>

        <section>
          <SectionHeader eyebrow="Cravings" title="What's on your mind?" />
          <CategoryChips active={category} onChange={(c) => { setCategory(c); scrollToList() }} />
        </section>

        <PopularDishes />

        <section ref={listRef} className="scroll-mt-24">
          <RestaurantExplorer query={query} category={category} onReset={() => { setQuery(''); setCategory(null) }} />
        </section>

        <HowItWorks />
        <StatsBar />
        <WhyUs />
        <Testimonials />
        <CtaBanner />
        <FAQ />
      </div>
    </PageTransition>
  )
}
