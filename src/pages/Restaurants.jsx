import { useState } from 'react'
import PageTransition from '../components/PageTransition'
import SearchBar from '../components/SearchBar'
import CategoryChips from '../components/CategoryChips'
import RestaurantExplorer from '../components/RestaurantExplorer'

export default function Restaurants() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  return (
    <PageTransition>
      <div className="container-page space-y-6 py-8">
        <h1 className="text-3xl font-extrabold">All Restaurants</h1>
        <SearchBar value={query} onChange={setQuery} />
        <CategoryChips active={category} onChange={setCategory} />
        <RestaurantExplorer query={query} category={category} onReset={() => { setQuery(''); setCategory(null) }} />
      </div>
    </PageTransition>
  )
}
