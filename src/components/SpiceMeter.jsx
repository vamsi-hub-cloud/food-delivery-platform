export default function SpiceMeter({ level }) {
  if (level === 0) return <span className="text-sm font-semibold text-gray-500">Not spicy</span>
  const label = ['', 'Mild', 'Medium', 'Hot'][level]
  return (
    <span className="inline-flex items-center gap-1" title={`Spice level: ${label}`}>
      {[1, 2, 3].map((i) => <span key={i} className={`text-sm ${i <= level ? '' : 'opacity-20 grayscale'}`}>🌶️</span>)}
      <span className="ml-1 text-sm font-semibold">{label}</span>
    </span>
  )
}
