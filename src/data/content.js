export const steps = [
  { emoji: '📍', title: 'Choose a restaurant', text: 'Browse top-rated restaurants, cuisines and offers around you.', color: 'from-orange-400 to-red-400' },
  { emoji: '🍽️', title: 'Pick & customise', text: 'Select dishes, choose sizes and add extras exactly how you like.', color: 'from-pink-400 to-fuchsia-500' },
  { emoji: '💳', title: 'Pay securely', text: 'Apply coupons and pay with UPI, card or cash on delivery.', color: 'from-violet-400 to-indigo-500' },
  { emoji: '🛵', title: 'Track & enjoy', text: 'Watch your order move live from kitchen to your doorstep.', color: 'from-emerald-400 to-teal-500' },
]

export const features = [
  { emoji: '⚡', title: 'Lightning fast', text: 'Average delivery in under 30 minutes.', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  { emoji: '🥬', title: 'Fresh & hygienic', text: 'Partner kitchens audited for quality.', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { emoji: '🎟️', title: 'Daily offers', text: 'Coupons and free delivery deals every day.', bg: 'bg-pink-50', ring: 'ring-pink-200' },
  { emoji: '📍', title: 'Live tracking', text: 'Follow every stage of your order in real time.', bg: 'bg-sky-50', ring: 'ring-sky-200' },
  { emoji: '🔒', title: 'Safe payments', text: 'UPI, cards and cash — your choice.', bg: 'bg-violet-50', ring: 'ring-violet-200' },
  { emoji: '🎧', title: '24×7 support', text: 'Real humans ready to help anytime.', bg: 'bg-orange-50', ring: 'ring-orange-200' },
]

export const stats = [
  { value: 12000, suffix: '+', label: 'Happy customers', emoji: '😋' },
  { value: 850, suffix: '+', label: 'Partner restaurants', emoji: '🏪' },
  { value: 25, suffix: '+', label: 'Cities served', emoji: '🌆' },
  { value: 28, suffix: ' min', label: 'Avg. delivery time', emoji: '⏱️' },
]

export const testimonials = [
  { name: 'Ananya R.', city: 'Hyderabad', text: 'The biryani arrived piping hot and the live tracking was spot on. Easily my go-to app now!', rating: 5, color: 'from-orange-400 to-pink-400' },
  { name: 'Karthik S.', city: 'Bengaluru', text: 'Love how I can customise my pizza size and toppings. Coupons actually work, too.', rating: 5, color: 'from-violet-400 to-indigo-400' },
  { name: 'Meera P.', city: 'Chennai', text: 'Clean design, quick checkout and the order history makes reordering super easy.', rating: 4, color: 'from-emerald-400 to-teal-400' },
  { name: 'Rahul V.', city: 'Vijayawada', text: 'Desserts from Sweet Tooth were delivered in 20 minutes. Fantastic service!', rating: 5, color: 'from-pink-400 to-rose-400' },
]

export const faqs = [
  { q: 'How do I apply a coupon?', a: 'Open your cart and enter a code such as WELCOME50, FREEDEL, FLAT100 or WEEKEND20. Each coupon has a minimum order value that must be met.' },
  { q: 'Can I order from multiple restaurants at once?', a: 'One order can contain items from a single restaurant. If you add an item from another restaurant we will ask whether to replace your cart.' },
  { q: 'How does order tracking work?', a: 'After placing an order, open Track Order to watch it move through Placed, Confirmed, Preparing, Out for delivery and Delivered.' },
  { q: 'What payment methods are supported?', a: 'Cash on delivery, UPI and credit/debit cards. This demo does not process real payments.' },
  { q: 'Is my cart saved if I refresh?', a: 'Yes. Your cart and order history are stored in your browser, so they survive page refreshes.' },
]

export const cities = [
  { name: 'Hyderabad', emoji: '🕌', color: 'from-orange-400 to-red-400', branches: [
    { area: 'Jubilee Hills', address: 'Road No. 36, Jubilee Hills', phone: '+91 40 4000 1101' },
    { area: 'Madhapur', address: 'Hitech City Main Rd, Madhapur', phone: '+91 40 4000 1102' },
    { area: 'Kukatpally', address: 'KPHB Colony, Kukatpally', phone: '+91 40 4000 1103' },
  ] },
  { name: 'Bengaluru', emoji: '🌳', color: 'from-emerald-400 to-teal-400', branches: [
    { area: 'Indiranagar', address: '100 Feet Road, Indiranagar', phone: '+91 80 4000 2201' },
    { area: 'Koramangala', address: '5th Block, Koramangala', phone: '+91 80 4000 2202' },
  ] },
  { name: 'Chennai', emoji: '🏖️', color: 'from-sky-400 to-blue-500', branches: [
    { area: 'T. Nagar', address: 'Usman Road, T. Nagar', phone: '+91 44 4000 3301' },
    { area: 'Adyar', address: 'Lattice Bridge Rd, Adyar', phone: '+91 44 4000 3302' },
  ] },
  { name: 'Mumbai', emoji: '🌉', color: 'from-pink-400 to-fuchsia-500', branches: [
    { area: 'Bandra', address: 'Linking Road, Bandra West', phone: '+91 22 4000 4401' },
    { area: 'Andheri', address: 'Lokhandwala, Andheri West', phone: '+91 22 4000 4402' },
  ] },
  { name: 'Delhi NCR', emoji: '🏛️', color: 'from-amber-400 to-orange-500', branches: [
    { area: 'Connaught Place', address: 'Block F, Connaught Place', phone: '+91 11 4000 5501' },
    { area: 'Gurugram', address: 'Sector 29, Gurugram', phone: '+91 124 400 5502' },
  ] },
  { name: 'Pune', emoji: '⛰️', color: 'from-violet-400 to-purple-500', branches: [
    { area: 'Koregaon Park', address: 'Lane 5, Koregaon Park', phone: '+91 20 4000 6601' },
    { area: 'Hinjewadi', address: 'Phase 1, Hinjewadi', phone: '+91 20 4000 6602' },
  ] },
  { name: 'Kolkata', emoji: '🌇', color: 'from-yellow-400 to-amber-500', branches: [
    { area: 'Park Street', address: 'Park Street, Kolkata', phone: '+91 33 4000 7701' },
    { area: 'Salt Lake', address: 'Sector V, Salt Lake', phone: '+91 33 4000 7702' },
  ] },
  { name: 'Vijayawada', emoji: '🌊', color: 'from-cyan-400 to-sky-500', branches: [
    { area: 'Benz Circle', address: 'MG Road, Benz Circle', phone: '+91 866 400 8801' },
    { area: 'Labbipet', address: 'Labbipet Main Road', phone: '+91 866 400 8802' },
  ] },
  { name: 'Visakhapatnam', emoji: '⚓', color: 'from-blue-400 to-indigo-500', branches: [
    { area: 'MVP Colony', address: 'Sector 9, MVP Colony', phone: '+91 891 400 9901' },
    { area: 'Siripuram', address: 'Siripuram Junction', phone: '+91 891 400 9902' },
  ] },
  { name: 'Guntur', emoji: '🌶️', color: 'from-red-400 to-rose-500', branches: [
    { area: 'Brodipet', address: '2/1 Brodipet Main Road', phone: '+91 863 400 1001' },
    { area: 'Arundelpet', address: 'Arundelpet, Guntur', phone: '+91 863 400 1002' },
  ] },
  { name: 'Ahmedabad', emoji: '🪁', color: 'from-lime-400 to-green-500', branches: [
    { area: 'CG Road', address: 'CG Road, Navrangpura', phone: '+91 79 4000 1201' },
  ] },
  { name: 'Jaipur', emoji: '🏰', color: 'from-fuchsia-400 to-pink-500', branches: [
    { area: 'C-Scheme', address: 'Ashok Marg, C-Scheme', phone: '+91 141 400 1301' },
  ] },
]

const REVIEWERS = ['Aarav M.', 'Sneha K.', 'Vikram T.', 'Pooja N.', 'Arjun D.', 'Divya L.', 'Rohit B.', 'Isha G.']
const COMMENTS = [
  ['Absolutely delicious, portions were generous!', 5],
  ['Packaging was neat and the food arrived hot.', 5],
  ['Great taste, a little late but worth the wait.', 4],
  ['Good value for money. Will order again.', 4],
  ['Loved the flavours — the customisation options are great.', 5],
  ['Tasty overall, could be slightly spicier.', 4],
  ['Fresh ingredients and quick delivery.', 5],
  ['Decent, but I expected a bit more.', 3],
]
const hashStr = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11)
export const makeReviews = (restaurant, count = 6) => {
  const h = hashStr(restaurant.id)
  return Array.from({ length: count }, (_, i) => {
    const [text, rating] = COMMENTS[(h + i * 3) % COMMENTS.length]
    const dish = restaurant.menu[(h + i) % restaurant.menu.length]
    return { name: REVIEWERS[(h + i * 5) % REVIEWERS.length], text, rating, dish: dish.name, daysAgo: 1 + ((h + i * 7) % 28) }
  })
}
