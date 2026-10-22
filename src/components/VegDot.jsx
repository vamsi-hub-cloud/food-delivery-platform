export default function VegDot({ veg }) {
  const c = veg ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'
  return (
    <span className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded-sm border-2 ${c}`} title={veg ? 'Vegetarian' : 'Non-vegetarian'}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  )
}
