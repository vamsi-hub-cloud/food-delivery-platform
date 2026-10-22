// Reusable customization option sets for menu items.
export const SIZES = {
  pizza: [
    { name: 'Regular (7")', delta: 0 },
    { name: 'Medium (9")', delta: 90 },
    { name: 'Large (12")', delta: 190 },
  ],
  drink: [
    { name: 'Small', delta: 0 },
    { name: 'Medium', delta: 30 },
    { name: 'Large', delta: 60 },
  ],
  portion: [
    { name: 'Half', delta: -60 },
    { name: 'Full', delta: 0 },
  ],
}

export const ADDONS = {
  pizza: [
    { name: 'Extra Cheese', price: 40 },
    { name: 'Jalapeños', price: 25 },
    { name: 'Olives', price: 25 },
    { name: 'Mushrooms', price: 30 },
  ],
  burger: [
    { name: 'Extra Patty', price: 60 },
    { name: 'Cheese Slice', price: 20 },
    { name: 'Fries Combo', price: 70 },
    { name: 'Peri Peri Dip', price: 15 },
  ],
  indian: [
    { name: 'Extra Gravy', price: 30 },
    { name: 'Butter Naan', price: 35 },
    { name: 'Raita', price: 25 },
    { name: 'Papad', price: 15 },
  ],
  asian: [
    { name: 'Extra Noodles', price: 40 },
    { name: 'Spicy Chilli Oil', price: 15 },
    { name: 'Fried Egg', price: 25 },
  ],
  dessert: [
    { name: 'Vanilla Ice Cream', price: 40 },
    { name: 'Hot Fudge', price: 30 },
    { name: 'Nuts Topping', price: 25 },
  ],
  healthy: [
    { name: 'Grilled Chicken', price: 60 },
    { name: 'Avocado', price: 50 },
    { name: 'Extra Dressing', price: 10 },
  ],
}
