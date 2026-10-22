import { SIZES, ADDONS } from './options'
import { enrichItem } from './enrich'

const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const categories = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕', grad: 'from-red-500 to-orange-400', tile: 'from-red-100 to-orange-100', text: 'text-red-600' },
  { id: 'burger', label: 'Burgers', emoji: '🍔', grad: 'from-amber-500 to-yellow-400', tile: 'from-amber-100 to-yellow-100', text: 'text-amber-600' },
  { id: 'indian', label: 'Indian', emoji: '🍛', grad: 'from-orange-600 to-red-500', tile: 'from-orange-100 to-red-100', text: 'text-orange-600' },
  { id: 'biryani', label: 'Biryani', emoji: '🍚', grad: 'from-yellow-500 to-amber-500', tile: 'from-yellow-100 to-amber-100', text: 'text-yellow-700' },
  { id: 'asian', label: 'Asian', emoji: '🍜', grad: 'from-rose-500 to-pink-400', tile: 'from-rose-100 to-pink-100', text: 'text-rose-600' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗', grad: 'from-green-500 to-emerald-400', tile: 'from-green-100 to-emerald-100', text: 'text-green-600' },
  { id: 'dessert', label: 'Desserts', emoji: '🍰', grad: 'from-pink-500 to-fuchsia-500', tile: 'from-pink-100 to-fuchsia-100', text: 'text-pink-600' },
  { id: 'drinks', label: 'Drinks', emoji: '🥤', grad: 'from-sky-500 to-cyan-400', tile: 'from-sky-100 to-cyan-100', text: 'text-sky-600' },
]

export const offers = [
  { id: 1, title: '50% OFF up to ₹100', subtitle: 'On your first order', code: 'WELCOME50', gradient: 'from-brand-500 to-amber-400', emoji: '🎉' },
  { id: 2, title: 'FREE Delivery', subtitle: 'On orders above ₹299', code: 'FREEDEL', gradient: 'from-emerald-500 to-teal-400', emoji: '🛵' },
  { id: 3, title: 'Flat ₹100 OFF', subtitle: 'On orders above ₹599', code: 'FLAT100', gradient: 'from-fuchsia-500 to-pink-400', emoji: '💸' },
  { id: 4, title: '20% OFF Weekend', subtitle: 'Max discount ₹150', code: 'WEEKEND20', gradient: 'from-indigo-500 to-sky-400', emoji: '🎈' },
]

let n = 0
const item = (category, name, desc, price, emoji, veg, options = {}) => ({
  id: `m${++n}`,
  category,
  name,
  desc,
  price,
  emoji,
  veg,
  popular: !!options.popular,
  sizes: options.sizes || null,
  addons: options.addons || null,
})

export const restaurants = [
  {
    id: 'r1',
    name: "Napoli's Wood Fired Pizza",
    cuisines: ['Pizza', 'Italian'],
    categories: ['pizza', 'dessert', 'drinks'],
    rating: 4.6, reviews: 2310, deliveryTime: 30, deliveryFee: 30, minOrder: 199, priceForTwo: 600,
    veg: false, promoted: true, offer: '50% OFF up to ₹100', area: 'Jubilee Hills',
    image: u('photo-1513104890138-7c749659a591'),
    menu: [
      item('pizza', 'Margherita', 'Classic tomato, fresh mozzarella and basil', 249, '🍕', true, { popular: true, sizes: SIZES.pizza, addons: ADDONS.pizza }),
      item('pizza', 'Pepperoni Feast', 'Loaded with spicy pepperoni and double cheese', 399, '🍕', false, { popular: true, sizes: SIZES.pizza, addons: ADDONS.pizza }),
      item('pizza', 'Farmhouse', 'Capsicum, onion, mushroom, sweet corn', 329, '🍕', true, { sizes: SIZES.pizza, addons: ADDONS.pizza }),
      item('pizza', 'BBQ Chicken', 'Smoky BBQ sauce, grilled chicken, onions', 379, '🍕', false, { sizes: SIZES.pizza, addons: ADDONS.pizza }),
      item('dessert', 'Choco Lava Cake', 'Warm cake with molten chocolate centre', 99, '🍫', true, { popular: true }),
      item('dessert', 'Tiramisu Cup', 'Italian coffee-soaked layered dessert', 149, '🍰', true),
      item('drinks', 'Cold Coffee', 'Thick and creamy blended cold coffee', 129, '🥤', true, { sizes: SIZES.drink }),
      item('drinks', 'Fresh Lime Soda', 'Sweet, salted or mixed', 79, '🍋', true, { sizes: SIZES.drink }),
    ],
  },
  {
    id: 'r2',
    name: 'Burger Barn',
    cuisines: ['Burgers', 'Fast Food'],
    categories: ['burger', 'drinks', 'dessert'],
    rating: 4.3, reviews: 1840, deliveryTime: 25, deliveryFee: 25, minOrder: 149, priceForTwo: 400,
    veg: false, promoted: false, offer: 'Free delivery above ₹299', area: 'Madhapur',
    image: u('photo-1568901346375-23c9450c58cd'),
    menu: [
      item('burger', 'Classic Veg Burger', 'Crispy veg patty, lettuce, tomato, mayo', 119, '🍔', true, { addons: ADDONS.burger }),
      item('burger', 'Double Cheese Smash', 'Two smashed patties with melted cheddar', 249, '🍔', false, { popular: true, addons: ADDONS.burger }),
      item('burger', 'Crispy Chicken Zinger', 'Spicy fried chicken fillet with slaw', 189, '🍔', false, { popular: true, addons: ADDONS.burger }),
      item('burger', 'Paneer Tikka Burger', 'Grilled tandoori paneer with mint mayo', 159, '🍔', true, { addons: ADDONS.burger }),
      item('burger', 'Loaded Fries', 'Fries with cheese sauce and jalapeños', 129, '🍟', true, { sizes: SIZES.drink }),
      item('dessert', 'Brownie Sundae', 'Warm brownie with vanilla scoop', 139, '🍨', true),
      item('drinks', 'Oreo Shake', 'Thick milkshake with crushed Oreo', 149, '🥛', true, { sizes: SIZES.drink }),
      item('drinks', 'Cola', 'Chilled soft drink', 60, '🥤', true, { sizes: SIZES.drink }),
    ],
  },
  {
    id: 'r3',
    name: 'Spice Route',
    cuisines: ['North Indian', 'Mughlai'],
    categories: ['indian', 'dessert', 'drinks'],
    rating: 4.5, reviews: 3120, deliveryTime: 40, deliveryFee: 35, minOrder: 249, priceForTwo: 700,
    veg: false, promoted: true, offer: 'Flat ₹100 OFF above ₹599', area: 'Banjara Hills',
    image: u('photo-1585937421612-70a008356fbe'),
    menu: [
      item('indian', 'Butter Chicken', 'Creamy tomato gravy with tender chicken', 349, '🍗', false, { popular: true, sizes: SIZES.portion, addons: ADDONS.indian }),
      item('indian', 'Paneer Butter Masala', 'Cottage cheese in rich buttery gravy', 299, '🧀', true, { popular: true, sizes: SIZES.portion, addons: ADDONS.indian }),
      item('indian', 'Dal Makhani', 'Slow-cooked black lentils with cream', 239, '🍲', true, { sizes: SIZES.portion, addons: ADDONS.indian }),
      item('indian', 'Garlic Naan', 'Tandoor-baked bread with garlic butter', 59, '🫓', true),
      item('indian', 'Tandoori Platter', 'Chicken tikka, seekh kebab, malai tikka', 449, '🍢', false),
      item('dessert', 'Gulab Jamun (2 pcs)', 'Warm milk dumplings in sugar syrup', 89, '🍡', true),
      item('drinks', 'Sweet Lassi', 'Thick chilled yoghurt drink', 89, '🥛', true, { sizes: SIZES.drink }),
      item('drinks', 'Masala Chaas', 'Spiced buttermilk', 59, '🥛', true),
    ],
  },
  {
    id: 'r4',
    name: 'Biryani Junction',
    cuisines: ['Biryani', 'Hyderabadi'],
    categories: ['biryani', 'dessert', 'drinks'],
    rating: 4.7, reviews: 5480, deliveryTime: 35, deliveryFee: 0, minOrder: 199, priceForTwo: 500,
    veg: false, promoted: true, offer: 'Free delivery', area: 'Kukatpally',
    image: u('photo-1563379091339-03b21ab4a4f8'),
    menu: [
      item('biryani', 'Hyderabadi Chicken Dum Biryani', 'Aromatic basmati layered with spiced chicken', 289, '🍚', false, { popular: true, sizes: SIZES.portion, addons: ADDONS.indian }),
      item('biryani', 'Mutton Biryani', 'Slow-cooked mutton with saffron rice', 399, '🍖', false, { popular: true, sizes: SIZES.portion, addons: ADDONS.indian }),
      item('biryani', 'Veg Dum Biryani', 'Seasonal vegetables with fragrant rice', 219, '🥘', true, { sizes: SIZES.portion, addons: ADDONS.indian }),
      item('biryani', 'Egg Biryani', 'Boiled eggs tossed in masala with rice', 199, '🥚', false, { sizes: SIZES.portion, addons: ADDONS.indian }),
      item('biryani', 'Chicken 65', 'Spicy deep-fried chicken starter', 229, '🍗', false),
      item('dessert', 'Double Ka Meetha', 'Hyderabadi bread pudding dessert', 99, '🍮', true),
      item('drinks', 'Rose Milk', 'Chilled rose flavoured milk', 69, '🥛', true),
      item('drinks', 'Thums Up', 'Chilled soft drink', 50, '🥤', true),
    ],
  },
  {
    id: 'r5',
    name: 'Wok & Roll',
    cuisines: ['Chinese', 'Asian'],
    categories: ['asian', 'drinks'],
    rating: 4.2, reviews: 1260, deliveryTime: 28, deliveryFee: 30, minOrder: 199, priceForTwo: 450,
    veg: false, promoted: false, offer: '20% OFF Weekend', area: 'Gachibowli',
    image: u('photo-1569718212165-3a8278d5f624'),
    menu: [
      item('asian', 'Veg Hakka Noodles', 'Wok-tossed noodles with crunchy veggies', 169, '🍜', true, { popular: true, addons: ADDONS.asian }),
      item('asian', 'Chicken Fried Rice', 'Smoky fried rice with chicken and egg', 199, '🍛', false, { addons: ADDONS.asian }),
      item('asian', 'Chilli Paneer Dry', 'Crispy paneer in spicy soy glaze', 219, '🌶️', true, { popular: true }),
      item('asian', 'Veg Manchurian', 'Fried veg balls in tangy gravy', 189, '🥟', true),
      item('asian', 'Chicken Momos (8 pcs)', 'Steamed dumplings with spicy chutney', 149, '🥟', false, { popular: true }),
      item('asian', 'Schezwan Chicken Noodles', 'Fiery noodles with schezwan sauce', 219, '🍜', false, { addons: ADDONS.asian }),
      item('drinks', 'Iced Lemon Tea', 'Refreshing iced tea with lemon', 89, '🧋', true, { sizes: SIZES.drink }),
    ],
  },
  {
    id: 'r6',
    name: 'Green Bowl',
    cuisines: ['Healthy', 'Salads'],
    categories: ['healthy', 'drinks', 'dessert'],
    rating: 4.4, reviews: 920, deliveryTime: 22, deliveryFee: 20, minOrder: 149, priceForTwo: 500,
    veg: true, promoted: false, offer: '10% OFF on bowls', area: 'Hitech City',
    image: u('photo-1512621776951-a57141f2eefd'),
    menu: [
      item('healthy', 'Greek Salad Bowl', 'Cucumber, olives, feta, cherry tomatoes', 229, '🥗', true, { popular: true, addons: ADDONS.healthy }),
      item('healthy', 'Quinoa Power Bowl', 'Quinoa, roasted veggies, hummus', 279, '🥣', true, { popular: true, addons: ADDONS.healthy }),
      item('healthy', 'Paneer Protein Wrap', 'Whole wheat wrap with grilled paneer', 189, '🌯', true, { addons: ADDONS.healthy }),
      item('healthy', 'Avocado Toast', 'Sourdough with smashed avocado', 219, '🥑', true),
      item('dessert', 'Fruit Yoghurt Parfait', 'Greek yoghurt, granola and berries', 149, '🍓', true),
      item('drinks', 'Green Detox Juice', 'Spinach, apple, cucumber, mint', 129, '🥬', true, { sizes: SIZES.drink }),
      item('drinks', 'Watermelon Cooler', 'Fresh watermelon with mint', 99, '🍉', true, { sizes: SIZES.drink }),
    ],
  },
  {
    id: 'r7',
    name: 'Sweet Tooth Bakery',
    cuisines: ['Desserts', 'Bakery'],
    categories: ['dessert', 'drinks'],
    rating: 4.8, reviews: 2780, deliveryTime: 20, deliveryFee: 25, minOrder: 99, priceForTwo: 350,
    veg: true, promoted: true, offer: 'Buy 1 Get 1 on donuts', area: 'Begumpet',
    image: u('photo-1551024601-bec78aea704b'),
    menu: [
      item('dessert', 'Glazed Donut Box (4)', 'Fresh donuts with assorted glazes', 249, '🍩', true, { popular: true }),
      item('dessert', 'Red Velvet Pastry', 'Soft sponge with cream cheese frosting', 129, '🍰', true, { popular: true, addons: ADDONS.dessert }),
      item('dessert', 'Belgian Chocolate Truffle', 'Rich dark chocolate cake slice', 149, '🎂', true, { addons: ADDONS.dessert }),
      item('dessert', 'Blueberry Cheesecake', 'Baked cheesecake with blueberry compote', 179, '🍰', true),
      item('dessert', 'Cookies (6 pcs)', 'Chocolate chunk cookies, freshly baked', 199, '🍪', true),
      item('drinks', 'Hot Chocolate', 'Velvety hot chocolate with marshmallows', 139, '☕', true, { sizes: SIZES.drink }),
      item('drinks', 'Cappuccino', 'Espresso with steamed milk foam', 119, '☕', true, { sizes: SIZES.drink }),
    ],
  },
  {
    id: 'r8',
    name: 'Tandoori Tales',
    cuisines: ['North Indian', 'Kebabs'],
    categories: ['indian', 'biryani', 'drinks'],
    rating: 4.1, reviews: 870, deliveryTime: 38, deliveryFee: 30, minOrder: 249, priceForTwo: 650,
    veg: false, promoted: false, offer: '15% OFF above ₹499', area: 'Secunderabad',
    image: u('photo-1565557623262-b51c2513a641'),
    menu: [
      item('indian', 'Chicken Tikka', 'Charcoal grilled marinated chicken', 279, '🍢', false, { popular: true }),
      item('indian', 'Paneer Tikka', 'Smoky tandoori paneer cubes', 249, '🧀', true, { popular: true }),
      item('indian', 'Kadhai Chicken', 'Chicken with peppers in kadhai masala', 329, '🍗', false, { sizes: SIZES.portion, addons: ADDONS.indian }),
      item('indian', 'Veg Kolhapuri', 'Spicy mixed vegetable curry', 249, '🥘', true, { sizes: SIZES.portion, addons: ADDONS.indian }),
      item('indian', 'Tandoori Roti', 'Whole wheat tandoor bread', 25, '🫓', true),
      item('biryani', 'Chicken Biryani', 'Fragrant rice with spiced chicken', 259, '🍚', false, { sizes: SIZES.portion, addons: ADDONS.indian }),
      item('drinks', 'Jaljeera', 'Spiced cumin refresher', 59, '🥤', true),
    ],
  },
]

export const getRestaurant = (id) => restaurants.find((r) => r.id === id)

export const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

// Restaurant extras: accent colours, address, opening hours + enriched menu items
const extras = {
  r1: { accent: 'from-red-500 to-orange-400', address: 'Road No. 36, Jubilee Hills, Hyderabad', hours: '11:00 AM – 11:30 PM', phone: '+91 40 4000 1101', since: 2014 },
  r2: { accent: 'from-yellow-500 to-amber-400', address: 'Hitech City Main Rd, Madhapur, Hyderabad', hours: '10:00 AM – 12:00 AM', phone: '+91 40 4000 1102', since: 2017 },
  r3: { accent: 'from-orange-600 to-red-500', address: 'Road No. 12, Banjara Hills, Hyderabad', hours: '12:00 PM – 11:00 PM', phone: '+91 40 4000 1104', since: 2009 },
  r4: { accent: 'from-amber-500 to-yellow-400', address: 'KPHB Colony, Kukatpally, Hyderabad', hours: '11:00 AM – 12:00 AM', phone: '+91 40 4000 1103', since: 2012 },
  r5: { accent: 'from-rose-500 to-pink-400', address: 'Financial District, Gachibowli, Hyderabad', hours: '12:00 PM – 11:30 PM', phone: '+91 40 4000 1105', since: 2018 },
  r6: { accent: 'from-green-500 to-emerald-400', address: 'Madhapur Rd, Hitech City, Hyderabad', hours: '8:00 AM – 10:00 PM', phone: '+91 40 4000 1106', since: 2020 },
  r7: { accent: 'from-pink-500 to-fuchsia-500', address: 'Begumpet Main Rd, Hyderabad', hours: '9:00 AM – 11:00 PM', phone: '+91 40 4000 1107', since: 2015 },
  r8: { accent: 'from-red-600 to-orange-500', address: 'SD Road, Secunderabad', hours: '12:00 PM – 11:00 PM', phone: '+91 40 4000 1108', since: 2011 },
}
restaurants.forEach((r) => {
  Object.assign(r, extras[r.id])
  r.menu = r.menu.map(enrichItem)
})
