export default function SearchBar({ value, onChange, placeholder = 'Search restaurants, cuisines or dishes…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input !rounded-2xl !py-3.5 pl-11 shadow-card"
        aria-label="Search"
      />
    </div>
  )
}
