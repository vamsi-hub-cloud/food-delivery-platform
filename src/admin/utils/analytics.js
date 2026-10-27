const DAY = 86400000
export const startOfDay = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime() }

export const isRevenue = (o) => o.status !== 'cancelled'

export function lastDays(n, now = Date.now()) {
  const today = startOfDay(now)
  return Array.from({ length: n }, (_, i) => {
    const start = today - (n - 1 - i) * DAY
    return { start, end: start + DAY, label: new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
  })
}

export function dailySeries(orders, n) {
  return lastDays(n).map((d) => {
    const os = orders.filter((o) => o.placedAt >= d.start && o.placedAt < d.end)
    const rev = os.filter(isRevenue)
    return { label: d.label, orders: os.length, revenue: rev.reduce((s, o) => s + o.total, 0), commission: rev.reduce((s, o) => s + o.commission, 0), cancelled: os.filter((o) => o.status === 'cancelled').length }
  })
}

export const within = (orders, days) => { const from = startOfDay(Date.now()) - (days - 1) * DAY; return orders.filter((o) => o.placedAt >= from) }
export const previous = (orders, days) => { const to = startOfDay(Date.now()) - (days - 1) * DAY; return orders.filter((o) => o.placedAt >= to - days * DAY && o.placedAt < to) }
export const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0)
export const growth = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : cur ? 100 : 0)

export const hourDistribution = (orders) => {
  const h = Array.from({ length: 24 }, (_, i) => ({ label: `${i % 12 === 0 ? 12 : i % 12}${i < 12 ? 'a' : 'p'}`, hour: i, value: 0 }))
  orders.forEach((o) => { h[new Date(o.placedAt).getHours()].value++ })
  return h
}

export const heatmap = (orders) => {
  const m = Array.from({ length: 7 }, () => Array(24).fill(0))
  orders.forEach((o) => { const d = new Date(o.placedAt); m[(d.getDay() + 6) % 7][d.getHours()]++ })
  return m
}

export function groupSum(orders, keyFn, valFn = () => 1) {
  const map = new Map()
  orders.forEach((o) => { const k = keyFn(o); map.set(k, (map.get(k) || 0) + valFn(o)) })
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

export function itemSales(orders) {
  const map = new Map()
  orders.filter(isRevenue).forEach((o) => o.items.forEach((i) => { const cur = map.get(i.name) || { label: i.name, value: 0, revenue: 0, category: i.category }; cur.value += i.qty; cur.revenue += i.qty * i.price; map.set(i.name, cur) }))
  return [...map.values()].sort((a, b) => b.value - a.value)
}

export function partnerStats(partner, orders) {
  const mine = orders.filter((o) => o.partnerId === partner.id)
  const done = mine.filter((o) => o.status === 'delivered')
  return { total: mine.length, delivered: done.length, active: mine.filter((o) => ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length, earnings: sum(done, (o) => o.partnerEarning), distance: Math.round(sum(done, (o) => o.distanceKm)), orders: mine, done }
}

export function customerStats(customer, orders) {
  const mine = orders.filter((o) => o.customerId === customer.id)
  const real = mine.filter(isRevenue)
  return { orders: mine, count: mine.length, spent: sum(real, (o) => o.total), lastOrder: mine[0]?.placedAt || null, aov: real.length ? Math.round(sum(real, (o) => o.total) / real.length) : 0 }
}

export function downloadCSV(filename, rows) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export const timeAgo = (ts) => {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60); if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60); if (h < 24) return `${h} hr ago`
  const d = Math.round(h / 24); return `${d} day${d > 1 ? 's' : ''} ago`
}
export const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDateTime = (ts) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
export const compact = (n) => (n >= 10000000 ? `${(n / 10000000).toFixed(1)}Cr` : n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n)))
