export default function Marquee({ items, className = '', slow = false }) {
  const row = [...items, ...items]
  return (
    <div className={`marquee overflow-hidden ${className}`} aria-hidden="true">
      <div className={`flex w-max gap-4 ${slow ? 'animate-marquee-slow' : 'animate-marquee'}`}>
        {row.map((it, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-sm font-semibold shadow-card">
            <span className="text-xl">{it.emoji}</span>{it.label}
          </span>
        ))}
      </div>
    </div>
  )
}
