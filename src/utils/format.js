export const currency = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

export const formatDate = (ts) =>
  new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export const makeItemKey = (id, size, addons, notes) =>
  [id, size || '', [...(addons || [])].sort().join(','), (notes || '').trim().toLowerCase()].join('|')
