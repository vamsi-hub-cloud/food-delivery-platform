import Reveal from './Reveal'

export default function SectionHeader({ eyebrow, title, subtitle, align = 'center', light = false }) {
  return (
    <Reveal className={`mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      {eyebrow && (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${light ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>{eyebrow}</span>
      )}
      <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl lg:text-4xl ${light ? 'text-white' : ''}`}>{title}</h2>
      {subtitle && <p className={`mx-auto mt-2 max-w-2xl text-sm sm:text-base ${light ? 'text-white/80' : 'text-gray-500'}`}>{subtitle}</p>}
    </Reveal>
  )
}
