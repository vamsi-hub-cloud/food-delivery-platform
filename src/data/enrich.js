// Adds rich product details (nutrition, ingredients, spice, prep time…) to every menu item.
// This is mock/demo data generated deterministically from each item.
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

const BASE = {
  pizza: { cal: 250, prep: 20, serves: '1–2', macro: [16, 52, 32], ing: ['Hand-stretched dough', 'Tomato basil sauce', 'Mozzarella cheese', 'Olive oil'], allergens: ['Gluten', 'Dairy'] },
  burger: { cal: 380, prep: 15, serves: '1', macro: [18, 45, 37], ing: ['Brioche bun', 'Lettuce & tomato', 'Signature sauce', 'Pickles'], allergens: ['Gluten', 'Egg', 'Dairy'] },
  indian: { cal: 320, prep: 25, serves: '1–2', macro: [17, 33, 50], ing: ['Onion-tomato masala', 'Ginger-garlic paste', 'Whole spices', 'Fresh coriander'], allergens: ['Dairy'] },
  biryani: { cal: 520, prep: 30, serves: '1–2', macro: [14, 58, 28], ing: ['Aged basmati rice', 'Saffron & whole spices', 'Fried onions', 'Mint & coriander', 'Ghee'], allergens: ['Dairy'] },
  asian: { cal: 360, prep: 18, serves: '1', macro: [13, 60, 27], ing: ['Soy sauce', 'Garlic & spring onion', 'Crunchy vegetables', 'Sesame oil'], allergens: ['Gluten', 'Soy'] },
  healthy: { cal: 210, prep: 12, serves: '1', macro: [22, 50, 28], ing: ['Fresh greens', 'Cherry tomatoes', 'Cucumber', 'Lemon dressing'], allergens: ['Dairy'] },
  dessert: { cal: 300, prep: 10, serves: '1', macro: [6, 56, 38], ing: ['Fresh cream', 'Sugar', 'Butter', 'Vanilla'], allergens: ['Gluten', 'Dairy', 'Egg'] },
  drinks: { cal: 120, prep: 6, serves: '1', macro: [4, 80, 16], ing: ['Chilled water/milk', 'Natural flavouring', 'Ice'], allergens: [] },
}

const SPICY = /spicy|chilli|schezwan|peri|65|kadhai|kolhapuri|pepperoni|manchurian|tikka|zinger|masala|biryani/i

export function enrichItem(item) {
  const b = BASE[item.category] || BASE.indian
  const h = hash(item.id + item.name)
  const calories = Math.round(b.cal + item.price * 0.9 + (h % 60))
  const [p, c, f] = b.macro
  const protein = Math.round((calories * p) / 100 / 4)
  const carbs = Math.round((calories * c) / 100 / 4)
  const fat = Math.round((calories * f) / 100 / 9)

  const n = item.name
  const ingredients = [...b.ing]
  if (/chicken|zinger|65|tikka masala|butter chicken/i.test(n) && item.veg === false) ingredients.unshift('Farm chicken')
  if (/mutton/i.test(n)) ingredients.unshift('Tender mutton')
  if (/egg/i.test(n)) ingredients.unshift('Boiled eggs')
  if (/paneer/i.test(n)) ingredients.unshift('Fresh paneer')
  if (/cheese|smash/i.test(n)) ingredients.push('Cheddar cheese')
  if (/choco|brownie|truffle|lava|cookie/i.test(n)) ingredients.push('Belgian chocolate')
  if (/veg|farmhouse|greek|quinoa/i.test(n)) ingredients.unshift('Seasonal vegetables')
  if (/mushroom|farmhouse/i.test(n)) ingredients.push('Mushrooms')
  if (/avocado/i.test(n)) ingredients.unshift('Ripe avocado')

  const allergens = [...b.allergens]
  if (/nuts|truffle|cookie|brownie/i.test(n)) allergens.push('Nuts')
  if (/egg/i.test(n) && !allergens.includes('Egg')) allergens.push('Egg')

  let spice = 0
  if (item.category === 'dessert' || item.category === 'drinks' || item.category === 'healthy') spice = 0
  else if (SPICY.test(n)) spice = item.category === 'asian' || /chilli|schezwan|65|pepperoni/i.test(n) ? 3 : 2
  else spice = 1

  return {
    ...item,
    calories,
    protein,
    carbs,
    fat,
    prepTime: b.prep + (h % 8),
    serves: b.serves,
    spice,
    rating: Math.round((3.9 + (h % 10) / 11) * 10) / 10,
    ratingCount: 40 + (h % 900),
    ingredients: [...new Set(ingredients)],
    allergens: [...new Set(allergens)],
    tags: [
      item.veg ? '100% Veg' : 'Non-Veg',
      ...(item.popular ? ['Bestseller'] : []),
      ...(calories < 250 ? ['Light'] : []),
      ...(protein >= 25 ? ['High protein'] : []),
      ...(item.price < 100 ? ['Under ₹100'] : []),
    ],
  }
}
