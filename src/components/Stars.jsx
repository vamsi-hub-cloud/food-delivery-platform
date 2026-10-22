export default function Rating({ value, className = '' }) {
  const color = value >= 4.5 ? 'bg-emerald-600' : value >= 4 ? 'bg-emerald-500' : 'bg-amber-500'
  return <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold text-white ${color} ${className}`}>★ {value.toFixed(1)}</span>
}
