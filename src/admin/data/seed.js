import { restaurants as baseRestaurants, categoryMap } from '../../data/restaurants'

const MIN = 60000
const HOUR = 3600000
const DAY = 86400000

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const MODULES = ['dashboard', 'orders', 'restaurants', 'partners', 'customers', 'payments', 'offers', 'support', 'reports', 'settings']
const fullPerm = () => Object.fromEntries(MODULES.map((m) => [m, { view: true, create: true, edit: true, delete: true }]))
const perm = (list, rw = 'view') => Object.fromEntries(MODULES.map((m) => [m, list.includes(m) ? { view: true, create: rw === 'full', edit: rw === 'full' || rw === 'edit', delete: rw === 'full' } : { view: false, create: false, edit: false, delete: false }]))

export function createSeed(now = Date.now()) {
  const rnd = mulberry32(20261025)
  const int = (a, b) => Math.floor(rnd() * (b - a + 1)) + a
  const pick = (a) => a[int(0, a.length - 1)]
  const chance = (p) => rnd() < p
  const FIRST = ['Aarav', 'Ananya', 'Vikram', 'Sneha', 'Rohit', 'Priya', 'Karthik', 'Meera', 'Arjun', 'Divya', 'Ishaan', 'Kavya', 'Rahul', 'Pooja', 'Siddharth', 'Neha', 'Manoj', 'Lakshmi', 'Varun', 'Anjali']
  const LAST = ['Sharma', 'Reddy', 'Iyer', 'Patel', 'Nair', 'Gupta', 'Rao', 'Verma', 'Khan', 'Das', 'Naidu', 'Menon']
  const name = () => `${pick(FIRST)} ${pick(LAST)}`
  const phone = () => `${pick([6, 7, 8, 9])}${String(int(100000000, 999999999))}`
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')

  /* ---------- restaurants ---------- */
  const hours = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, open: '11:00', close: day === 'Fri' || day === 'Sat' ? '23:59' : '23:00', closed: false }))
  const commissions = [15, 18, 20, 16, 14, 12, 17, 19]
  const OWNERS = ['Ramesh Babu', 'Sunita Rao', 'Imran Qureshi', 'Deepak Jain', 'Lata Menon', 'Vijay Kumar', 'Farah Sheikh', 'Anil Reddy']
  const restaurants = baseRestaurants.map((r, i) => ({
    id: r.id, name: r.name, owner: OWNERS[i], email: `hello@${slug(r.name)}.com`, phone: r.phone, area: r.area, city: 'Hyderabad', address: r.address,
    cuisines: r.cuisines, status: 'approved', verification: { fssai: 'verified', gst: 'verified', pan: 'verified', bank: i === 7 ? 'pending' : 'verified' },
    commission: commissions[i], rating: r.rating, reviewsCount: r.reviews, isOpen: i !== 4, acceptingOrders: true, hours: hours(), image: r.image,
    joinedAt: now - int(200, 900) * DAY, minOrder: r.minOrder, prepTime: Math.max(10, r.deliveryTime - 10), deliveryFee: r.deliveryFee,
    categories: [...new Set(r.menu.map((m) => categoryMap[m.category].label))],
    menu: r.menu.map((m) => ({ id: m.id, name: m.name, category: categoryMap[m.category].label, price: m.price, veg: m.veg, available: true, desc: m.desc, emoji: m.emoji })),
  }))
  const pendingNames = [
    ['Dosa Corner', 'South Indian', 'pending', { fssai: 'verified', gst: 'pending', pan: 'verified', bank: 'pending' }],
    ['Pizza Palace', 'Pizza', 'pending', { fssai: 'pending', gst: 'pending', pan: 'pending', bank: 'pending' }],
    ['Sushi Zen', 'Japanese', 'pending', { fssai: 'verified', gst: 'verified', pan: 'verified', bank: 'verified' }],
    ['Chaat Bazaar', 'Street Food', 'rejected', { fssai: 'rejected', gst: 'verified', pan: 'verified', bank: 'pending' }],
    ['Kebab Kingdom', 'Mughlai', 'suspended', { fssai: 'verified', gst: 'verified', pan: 'verified', bank: 'verified' }],
  ]
  pendingNames.forEach(([n, cuisine, status, verification], i) => {
    restaurants.push({
      id: `r${9 + i}`, name: n, owner: name(), email: `info@${slug(n)}.com`, phone: `+91 98${int(10000000, 99999999)}`, area: pick(['Kondapur', 'Ameerpet', 'Miyapur', 'Tarnaka', 'Manikonda']), city: 'Hyderabad',
      address: `${int(1, 99)}-${int(1, 99)}/A, ${pick(['Main Road', 'Cross Road', 'Lane 4'])}, Hyderabad`, cuisines: [cuisine], status, verification, commission: 18, rating: 0, reviewsCount: 0,
      isOpen: false, acceptingOrders: false, hours: hours(), image: null, joinedAt: now - int(1, 12) * DAY, minOrder: 149, prepTime: 25, deliveryFee: 30, categories: ['Starters', 'Mains'],
      menu: [
        { id: `m9${i}1`, name: 'Signature Starter', category: 'Starters', price: 149, veg: true, available: true, desc: 'Chef special', emoji: '🥟' },
        { id: `m9${i}2`, name: 'House Special Main', category: 'Mains', price: 249, veg: false, available: true, desc: 'Popular main course', emoji: '🍛' },
      ],
      rejectionReason: status === 'rejected' ? 'FSSAI licence is invalid' : status === 'suspended' ? 'Repeated hygiene complaints' : '',
    })
  })

  /* ---------- partners ---------- */
  const partners = Array.from({ length: 14 }, (_, i) => {
    const status = i < 10 ? 'approved' : i < 13 ? 'pending' : 'rejected'
    const d = status === 'approved' ? () => 'verified' : status === 'rejected' ? () => pick(['rejected', 'verified']) : () => (chance(0.4) ? 'verified' : 'pending')
    return {
      id: `p${i + 1}`, name: name(), phone: phone(), email: `rider${i + 1}@foodigo.demo`, vehicle: pick(['Bike', 'Scooter', 'EV Bike']), plate: `TS${int(7, 9)}${pick(['A', 'B', 'C'])}${pick(['X', 'Y', 'Z'])}${int(1000, 9999)}`,
      zone: pick(['Jubilee Hills', 'Madhapur', 'Banjara Hills', 'Kukatpally', 'Gachibowli', 'Secunderabad']), status,
      docs: { license: d(), aadhaar: d(), rc: d(), insurance: d() }, online: status === 'approved' && i < 7, rating: Math.round((4 + rnd()) * 10) / 10,
      acceptance: int(78, 98), onTime: int(80, 99), joinedAt: now - int(20, 400) * DAY, bank: `XXXX${int(1000, 9999)}`,
    }
  })
  const approvedPartners = partners.filter((p) => p.status === 'approved')

  /* ---------- customers ---------- */
  const STREETS = ['Road No. 12, Banjara Hills', 'Plot 45, Madhapur', 'Flat 301, Kukatpally', 'Lane 5, Gachibowli', 'Street 9, Begumpet', 'Sector 2, Secunderabad']
  const customers = Array.from({ length: 36 }, (_, i) => {
    const n = name()
    return {
      id: `c${i + 1}`, name: n, email: `${slug(n)}${i}@mail.com`, phone: phone(), city: 'Hyderabad',
      status: i === 33 ? 'blocked' : i === 34 ? 'suspended' : 'active', statusReason: i === 33 ? 'Multiple fraudulent refund claims' : i === 34 ? 'Under review for abusive behaviour' : '',
      joinedAt: now - int(5, 500) * DAY, addresses: [{ id: `a${i}1`, label: 'Home', line: pick(STREETS) }, ...(chance(0.5) ? [{ id: `a${i}2`, label: 'Work', line: pick(STREETS) }] : [])],
    }
  })
  const okCustomers = customers.filter((c) => c.status === 'active')

  /* ---------- orders ---------- */
  const approved = restaurants.filter((r) => r.status === 'approved')
  const SEQ = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
  const OFFSETS = [0, 2, 8, 18, 38]
  const hourWeights = [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 7, 10, 9, 5, 3, 3, 5, 8, 11, 12, 9, 5, 2]
  const pickHour = () => { const total = hourWeights.reduce((a, b) => a + b, 0); let x = rnd() * total; for (let h = 0; h < 24; h++) { x -= hourWeights[h]; if (x <= 0) return h } return 20 }
  const CANCEL_REASONS = ['Customer changed mind', 'Restaurant too busy', 'Item unavailable', 'Payment issue', 'Delivery delay']
  const orders = []
  const activeStatuses = ['pending', 'pending', 'confirmed', 'confirmed', 'preparing', 'preparing', 'out_for_delivery', 'out_for_delivery', 'out_for_delivery']
  const activeAgo = [3, 8, 14, 22, 30, 36, 44, 52, 70]
  for (let i = 0; i < 130; i++) {
    const r = pick(approved)
    const isActive = i < activeStatuses.length
    const lines = []
    const n = int(1, 4)
    for (let k = 0; k < n; k++) { const m = pick(r.menu); if (!lines.find((l) => l.name === m.name)) lines.push({ name: m.name, qty: int(1, 3), price: m.price, category: m.category }) }
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0)
    const discount = chance(0.3) ? int(20, 100) : 0
    const taxes = Math.round((subtotal - discount) * 0.05)
    const deliveryFee = r.deliveryFee
    const total = subtotal - discount + taxes + deliveryFee
    let placedAt
    if (isActive) placedAt = now - activeAgo[i] * MIN
    else {
      const daysAgo = int(0, 29)
      const d = new Date(now - daysAgo * DAY); d.setHours(pickHour(), int(0, 59), 0, 0)
      placedAt = Math.min(d.getTime(), now - 2.5 * HOUR)
    }
    const status = isActive ? activeStatuses[i] : chance(0.86) ? 'delivered' : 'cancelled'
    const method = pick(['upi', 'upi', 'card', 'cod'])
    const cust = pick(okCustomers)
    const distanceKm = Math.round((1.5 + rnd() * 7.5) * 10) / 10
    const idx = SEQ.indexOf(status)
    let history
    let cancelReason = ''
    if (status === 'cancelled') { cancelReason = pick(CANCEL_REASONS); history = [{ status: 'pending', at: placedAt }, { status: 'cancelled', at: placedAt + int(3, 14) * MIN, note: cancelReason }] }
    else history = SEQ.slice(0, idx + 1).map((s, k) => ({ status: s, at: placedAt + OFFSETS[k] * MIN + (k === 4 ? int(0, 12) * MIN : 0) }))
    const needsPartner = ['out_for_delivery', 'delivered'].includes(status) || (status === 'preparing' && chance(0.4)) || (status === 'confirmed' && chance(0.3))
    let payStatus = method === 'cod' ? 'cod' : 'paid'
    if (status === 'cancelled' && method !== 'cod') payStatus = chance(0.7) ? 'refunded' : 'paid'
    orders.push({
      id: `FG${10000100 + i}`, source: 'seed', customerId: cust.id, customerName: cust.name, phone: cust.phone, restaurantId: r.id, restaurantName: r.name, items: lines,
      subtotal, discount, taxes, deliveryFee, total, commission: Math.round((subtotal * r.commission) / 100), partnerEarning: 25 + Math.round(distanceKm * 7),
      payment: { method, status: payStatus }, status, placedAt, address: cust.addresses[0].line, zone: r.area, distanceKm,
      partnerId: needsPartner ? pick(approvedPartners).id : null, cancelReason, history, coupon: discount ? pick(['WELCOME50', 'FLAT100', 'WEEKEND20']) : null,
    })
  }
  orders.sort((a, b) => b.placedAt - a.placedAt)

  /* ---------- refunds ---------- */
  const refunds = []
  const refundable = orders.filter((o) => o.payment.method !== 'cod' && ['delivered', 'cancelled'].includes(o.status)).slice(0, 14)
  const RR = ['Food was cold', 'Wrong item delivered', 'Item missing from order', 'Order cancelled by restaurant', 'Quality not as expected', 'Late delivery']
  refundable.slice(0, 9).forEach((o, i) => {
    const status = i < 4 ? 'pending' : i < 8 ? 'approved' : 'rejected'
    refunds.push({ id: `RF${5001 + i}`, orderId: o.id, customerId: o.customerId, customerName: o.customerName, amount: Math.round(o.total * (chance(0.5) ? 1 : 0.5)), reason: o.status === 'cancelled' ? 'Order cancelled by restaurant' : pick(RR), status, requestedAt: o.placedAt + int(30, 300) * MIN, decidedAt: status === 'pending' ? null : o.placedAt + int(400, 900) * MIN, note: status === 'rejected' ? 'Photo evidence did not match complaint' : '' })
    if (status === 'approved') o.payment.status = 'refunded'
  })

  /* ---------- transactions ---------- */
  const transactions = orders.filter((o) => o.status !== 'cancelled' || o.payment.method !== 'cod').map((o, i) => ({
    id: `TXN${900100 + i}`, orderId: o.id, customerName: o.customerName, method: o.payment.method, amount: o.total,
    status: o.payment.status === 'refunded' ? 'refunded' : o.payment.method === 'cod' ? (o.status === 'delivered' ? 'success' : 'pending') : 'success', gateway: o.payment.method === 'cod' ? 'Cash' : pick(['Razorpay', 'PayU', 'Cashfree']), at: o.placedAt + MIN, failReason: '',
  }))
  const FAIL = ['Bank declined the transaction', 'UPI request timed out', 'Insufficient funds', 'Card expired', 'Network error at gateway', 'OTP verification failed']
  for (let i = 0; i < 14; i++) {
    const c = pick(customers)
    transactions.push({ id: `TXN${901000 + i}`, orderId: null, customerName: c.name, method: pick(['upi', 'card']), amount: int(180, 900), status: 'failed', gateway: pick(['Razorpay', 'PayU', 'Cashfree']), at: now - int(5, 28 * 24 * 60) * MIN, failReason: pick(FAIL), resolved: false })
  }
  transactions.sort((a, b) => b.at - a.at)

  /* ---------- settlements & payouts (4 weekly periods) ---------- */
  const weeks = [0, 1, 2, 3].map((w) => ({ w, start: now - (w + 1) * 7 * DAY, end: now - w * 7 * DAY, label: `Week of ${new Date(now - (w + 1) * 7 * DAY).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` }))
  const settlements = []
  const payouts = []
  let sid = 7001
  let pid = 8001
  weeks.forEach((wk) => {
    approved.forEach((r) => {
      const os = orders.filter((o) => o.restaurantId === r.id && o.status === 'delivered' && o.placedAt >= wk.start && o.placedAt < wk.end)
      if (!os.length) return
      const gross = os.reduce((s, o) => s + o.subtotal, 0)
      const commission = os.reduce((s, o) => s + o.commission, 0)
      const gst = Math.round(commission * 0.18)
      settlements.push({ id: `ST${sid++}`, restaurantId: r.id, restaurantName: r.name, period: wk.label, orders: os.length, gross, commission, gst, net: gross - commission - gst, status: wk.w === 0 ? 'pending' : wk.w === 1 ? 'processing' : 'paid' })
    })
    approvedPartners.forEach((p) => {
      const os = orders.filter((o) => o.partnerId === p.id && o.status === 'delivered' && o.placedAt >= wk.start && o.placedAt < wk.end)
      if (!os.length) return
      const earnings = os.reduce((s, o) => s + o.partnerEarning, 0)
      const incentives = os.length >= 5 ? 150 : 0
      payouts.push({ id: `PO${pid++}`, partnerId: p.id, partnerName: p.name, period: wk.label, deliveries: os.length, earnings, incentives, deductions: 0, net: earnings + incentives, status: wk.w === 0 ? 'pending' : wk.w === 1 ? 'processing' : 'paid' })
    })
  })

  /* ---------- reviews ---------- */
  const RT = ['Loved the food, arrived hot!', 'Portion size was great.', 'Delivery was slow but the taste made up for it.', 'Packaging could be better.', 'Absolutely delicious, will order again.', 'Average experience.', 'Item was missing from my order.', 'Fresh and tasty!']
  const reviews = Array.from({ length: 50 }, (_, i) => {
    const c = pick(customers); const r = pick(approved)
    return { id: `rv${i + 1}`, customerId: c.id, customerName: c.name, restaurantId: r.id, restaurantName: r.name, rating: pick([5, 5, 5, 4, 4, 3, 2, 1]), text: pick(RT), at: now - int(1, 60) * DAY, hidden: false }
  })

  /* ---------- offers ---------- */
  const coupons = [
    { code: 'WELCOME50', type: 'percent', value: 50, maxDiscount: 100, minOrder: 199, usageLimit: 5000, perUser: 1, used: 3120, startsAt: now - 90 * DAY, expiresAt: now + 60 * DAY, status: 'active', scope: 'All restaurants', description: 'First order special' },
    { code: 'FREEDEL', type: 'freedelivery', value: 0, maxDiscount: 0, minOrder: 299, usageLimit: 10000, perUser: 5, used: 4410, startsAt: now - 60 * DAY, expiresAt: now + 30 * DAY, status: 'active', scope: 'All restaurants', description: 'Free delivery above ₹299' },
    { code: 'FLAT100', type: 'flat', value: 100, maxDiscount: 100, minOrder: 599, usageLimit: 2000, perUser: 2, used: 1190, startsAt: now - 45 * DAY, expiresAt: now + 15 * DAY, status: 'active', scope: 'All restaurants', description: 'Flat ₹100 off big orders' },
    { code: 'WEEKEND20', type: 'percent', value: 20, maxDiscount: 150, minOrder: 349, usageLimit: 3000, perUser: 4, used: 2870, startsAt: now - 30 * DAY, expiresAt: now + 10 * DAY, status: 'paused', scope: 'All restaurants', description: 'Weekend treat' },
    { code: 'DIWALI25', type: 'percent', value: 25, maxDiscount: 200, minOrder: 399, usageLimit: 1500, perUser: 2, used: 1500, startsAt: now - 40 * DAY, expiresAt: now - 5 * DAY, status: 'expired', scope: 'All restaurants', description: 'Festival offer' },
    { code: 'BIRYANI30', type: 'percent', value: 30, maxDiscount: 120, minOrder: 249, usageLimit: 800, perUser: 1, used: 210, startsAt: now - 5 * DAY, expiresAt: now + 25 * DAY, status: 'active', scope: 'Biryani Junction', description: 'Biryani lovers' },
  ]
  const campaigns = [
    { id: 'cp1', name: 'Diwali Dhamaka', type: 'Festival', coupon: 'DIWALI25', budget: 150000, spent: 148200, startDate: now - 40 * DAY, endDate: now - 5 * DAY, status: 'ended', reach: 52000, orders: 1500, revenue: 612000 },
    { id: 'cp2', name: 'New User Onboarding', type: 'Acquisition', coupon: 'WELCOME50', budget: 300000, spent: 212000, startDate: now - 90 * DAY, endDate: now + 60 * DAY, status: 'active', reach: 98000, orders: 3120, revenue: 1190000 },
    { id: 'cp3', name: 'Free Delivery Fridays', type: 'Retention', coupon: 'FREEDEL', budget: 80000, spent: 61000, startDate: now - 60 * DAY, endDate: now + 30 * DAY, status: 'active', reach: 41000, orders: 4410, revenue: 1840000 },
    { id: 'cp4', name: 'Biryani Week', type: 'Restaurant', coupon: 'BIRYANI30', budget: 40000, spent: 9800, startDate: now - 5 * DAY, endDate: now + 25 * DAY, status: 'active', reach: 12000, orders: 210, revenue: 88000 },
    { id: 'cp5', name: 'Monsoon Munchies', type: 'Seasonal', coupon: '', budget: 60000, spent: 0, startDate: now + 12 * DAY, endDate: now + 40 * DAY, status: 'scheduled', reach: 0, orders: 0, revenue: 0 },
  ]
  const referral = { enabled: true, referrerReward: 75, refereeReward: 50, minOrder: 199, maxReferrals: 20, expiryDays: 30, totalReferrals: 1840, successful: 1262, rewardsPaid: 158250 }
  const referrals = Array.from({ length: 10 }, (_, i) => ({ id: `rf${i}`, referrer: name(), referee: name(), status: pick(['completed', 'completed', 'pending', 'expired']), reward: 75, at: now - int(1, 30) * DAY }))

  /* ---------- tickets ---------- */
  const SUBJECTS = [['Order issue', 'Food arrived cold'], ['Order issue', 'Items missing from my order'], ['Payment', 'Amount deducted but order failed'], ['Delivery', 'Delivery partner was rude'], ['Refund', 'Refund not received yet'], ['Account', 'Unable to update phone number'], ['Food quality', 'Found hair in food'], ['Delivery', 'Order delivered to wrong address'], ['Payment', 'Coupon not applied at checkout']]
  const tickets = Array.from({ length: 18 }, (_, i) => {
    const c = pick(customers); const [category, subject] = SUBJECTS[i % SUBJECTS.length]
    const o = pick(orders.filter((x) => x.customerId === c.id).concat(orders.slice(0, 5)))
    const status = pick(['open', 'open', 'in_progress', 'in_progress', 'resolved', 'closed'])
    const createdAt = now - int(10, 12 * 24 * 60) * MIN
    const isDispute = i % 3 === 0
    const msgs = [{ from: 'customer', text: `${subject}. Please help with order ${o.id}.`, at: createdAt }]
    if (status !== 'open') msgs.push({ from: 'admin', text: 'Thanks for reaching out. We are looking into this right away.', at: createdAt + 25 * MIN })
    return { id: `TK${3001 + i}`, customerId: c.id, customerName: c.name, orderId: o.id, subject, category, priority: pick(['low', 'medium', 'medium', 'high', 'urgent']), status, createdAt, assignee: status === 'open' ? '' : pick(['Support Agent', 'Operations Manager']), messages: msgs, isDispute, disputeParty: isDispute ? pick(['Customer vs Restaurant', 'Customer vs Delivery Partner']) : '', resolution: status === 'resolved' || status === 'closed' ? 'Resolved with apology & credit' : '' }
  })

  /* ---------- zones / pricing ---------- */
  const ZN = [['Jubilee Hills', 5, 30, 7, 199, 28], ['Madhapur & Hitech City', 6, 25, 7, 149, 24], ['Banjara Hills', 4, 30, 8, 199, 30], ['Kukatpally', 7, 20, 6, 149, 34], ['Gachibowli', 6, 30, 7, 199, 27], ['Secunderabad', 8, 25, 6, 149, 36]]
  const zones = ZN.map(([n, radius, base, perKm, minOrder, avg], i) => ({ id: `z${i + 1}`, name: n, city: 'Hyderabad', radiusKm: radius, baseFee: base, perKmFee: perKm, minOrder, surge: i === 1, surgeMultiplier: 1.2, active: i !== 5, avgDeliveryMin: avg }))
  const pricing = {
    baseDeliveryFee: 30, perKmFee: 7, freeDeliveryAbove: 499, platformFee: 5, packagingCharge: 10, gstFood: 5, gstDelivery: 18, gstPlatform: 18, defaultCommission: 18, minOrderValue: 99, tipOptions: '10,20,30,50',
    surgeRules: [{ id: 's1', label: 'Lunch rush', from: '12:00', to: '14:00', multiplier: 1.2, enabled: true }, { id: 's2', label: 'Dinner rush', from: '19:00', to: '22:00', multiplier: 1.3, enabled: true }, { id: 's3', label: 'Heavy rain', from: '00:00', to: '23:59', multiplier: 1.5, enabled: false }],
  }

  /* ---------- roles / admins / settings ---------- */
  const roles = [
    { id: 'role1', name: 'Super Admin', description: 'Full access to every module', permissions: fullPerm(), system: true },
    { id: 'role2', name: 'Operations Manager', description: 'Orders, restaurants, partners and customers', permissions: perm(['dashboard', 'orders', 'restaurants', 'partners', 'customers', 'support'], 'edit') },
    { id: 'role3', name: 'Finance Manager', description: 'Payments, offers and reports', permissions: perm(['dashboard', 'payments', 'offers', 'reports'], 'edit') },
    { id: 'role4', name: 'Support Agent', description: 'Tickets, customers and order lookup', permissions: perm(['orders', 'customers', 'support'], 'edit') },
  ]
  const adminUsers = [
    { id: 'u1', name: 'Aditi Kapoor', email: 'admin@foodigo.com', password: 'admin123', roleId: 'role1', status: 'active', lastLogin: now - 2 * HOUR },
    { id: 'u2', name: 'Rohan Mehta', email: 'ops@foodigo.com', password: 'ops123', roleId: 'role2', status: 'active', lastLogin: now - 1 * DAY },
    { id: 'u3', name: 'Neha Singh', email: 'finance@foodigo.com', password: 'finance123', roleId: 'role3', status: 'active', lastLogin: now - 3 * DAY },
    { id: 'u4', name: 'Sameer Ali', email: 'support@foodigo.com', password: 'support123', roleId: 'role4', status: 'inactive', lastLogin: now - 20 * DAY },
  ]
  const settings = {
    platformName: 'FoodiGo', supportEmail: 'support@foodigo.demo', supportPhone: '1800-123-4567', currency: 'INR (₹)', timezone: 'Asia/Kolkata (IST)', language: 'English',
    maintenanceMode: false, autoCancelMinutes: 10, autoAssignPartners: true, allowCOD: true, allowUPI: true, allowCards: true, allowWallet: false,
    emailAlerts: true, smsAlerts: true, pushAlerts: true, requireRestaurantApproval: true, requirePartnerKyc: true, maxOrderValueCOD: 2000,
  }
  const notificationsSent = [
    { id: 'n1', title: 'Weekend Feast: 20% off', message: 'Use WEEKEND20 on all orders above ₹349.', audience: 'All customers', channels: ['push', 'email'], sentAt: now - 2 * DAY, status: 'sent', reach: 11840 },
    { id: 'n2', title: 'New payout schedule', message: 'Weekly payouts now processed every Monday.', audience: 'Delivery partners', channels: ['push', 'sms'], sentAt: now - 6 * DAY, status: 'sent', reach: 10 },
    { id: 'n3', title: 'Menu update reminder', message: 'Please update your menu availability before the weekend.', audience: 'Restaurants', channels: ['email'], sentAt: now - 9 * DAY, status: 'sent', reach: 8 },
  ]
  const audit = [
    ['Approved restaurant', 'Restaurants', 'Spice Route'], ['Created coupon', 'Offers', 'BIRYANI30'], ['Marked settlement paid', 'Payments', 'ST7012'], ['Verified partner documents', 'Partners', 'Rider 4'],
    ['Updated commission to 18%', 'Restaurants', 'Biryani Junction'], ['Blocked customer', 'Customers', 'Customer 34'], ['Approved refund', 'Payments', 'RF5006'], ['Updated pricing settings', 'Settings', 'Delivery fee'],
    ['Resolved ticket', 'Support', 'TK3004'], ['Created delivery zone', 'Settings', 'Gachibowli'],
  ].map(([action, module, target], i) => ({ id: `au${i}`, at: now - (i + 1) * 5 * HOUR - int(0, 3) * HOUR, admin: pick(adminUsers.slice(0, 3)).name, role: 'Admin', action, module, target, details: '' }))

  return { version: 1, createdAt: now, orders, overrides: {}, refunds, restaurants, partners, customers, reviews, transactions, settlements, payouts, coupons, campaigns, referral, referrals, tickets, notificationsSent, zones, pricing, roles, adminUsers, settings, audit }
}
