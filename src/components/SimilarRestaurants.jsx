import { restaurants } from '../data/restaurants'
import RestaurantCard from './RestaurantCard'

export default function SimilarRestaurants({ restaurant }) {
  const similar = restaurants
    .filter((r) => r.id !== restaurant.id)
    .map((r) => ({ r, score: r.categories.filter((c) => restaurant.categories.includes(c)).length }))
    .sort((a, b) => b.score - a.score || b.r.rating - a.r.rating)
    .slice(0, 4)
    .map((x) => x.r)
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-2xl font-extrabold">You may also like</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {similar.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
      </div>
    </section>
  )
}
