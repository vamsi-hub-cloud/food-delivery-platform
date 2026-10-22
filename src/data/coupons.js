// type: 'percent' | 'flat' | 'freedelivery'
export const coupons = [
  { code: 'WELCOME50', type: 'percent', value: 50, max: 100, min: 199, desc: '50% off up to ₹100 on orders above ₹199' },
  { code: 'FREEDEL', type: 'freedelivery', value: 0, min: 299, desc: 'Free delivery on orders above ₹299' },
  { code: 'FLAT100', type: 'flat', value: 100, min: 599, desc: 'Flat ₹100 off on orders above ₹599' },
  { code: 'WEEKEND20', type: 'percent', value: 20, max: 150, min: 349, desc: '20% off up to ₹150 on orders above ₹349' },
]
export const findCoupon = (code) => coupons.find((c) => c.code === code.trim().toUpperCase())
