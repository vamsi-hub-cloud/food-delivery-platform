export const ORDER_STAGES = [
  { key: 'placed', label: 'Order Placed', desc: 'We have received your order', emoji: '📝' },
  { key: 'confirmed', label: 'Restaurant Confirmed', desc: 'The restaurant accepted your order', emoji: '✅' },
  { key: 'preparing', label: 'Preparing Your Food', desc: 'Our chefs are cooking your meal', emoji: '👨‍🍳' },
  { key: 'out', label: 'Out for Delivery', desc: 'Your rider is on the way', emoji: '🛵' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!', emoji: '🎉' },
]

// Demo simulation: each stage lasts STAGE_MS after the order is placed.
export const STAGE_MS = 15000

export const getStageIndex = (placedAt, now = Date.now()) =>
  Math.min(ORDER_STAGES.length - 1, Math.floor((now - placedAt) / STAGE_MS))
