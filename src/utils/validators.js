export const validateCheckout = (f) => {
  const e = {}
  if (!f.name.trim()) e.name = 'Full name is required'
  else if (f.name.trim().length < 3) e.name = 'Name must be at least 3 characters'

  if (!f.phone.trim()) e.phone = 'Phone number is required'
  else if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'

  if (!f.email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address'

  if (!f.address.trim()) e.address = 'Delivery address is required'
  else if (f.address.trim().length < 10) e.address = 'Please enter a complete address'

  if (!f.city.trim()) e.city = 'City is required'
  if (!f.pincode.trim()) e.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode'

  if (f.payment === 'card') {
    const digits = f.cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(digits)) e.cardNumber = 'Enter a valid 16-digit card number'
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.expiry)) e.expiry = 'Use MM/YY format'
    else {
      const [m, y] = f.expiry.split('/').map(Number)
      const end = new Date(2000 + y, m, 0, 23, 59, 59)
      if (end < new Date()) e.expiry = 'Card has expired'
    }
    if (!/^\d{3}$/.test(f.cvv)) e.cvv = 'CVV must be 3 digits'
  }
  if (f.payment === 'upi') {
    if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.upi.trim())) e.upi = 'Enter a valid UPI ID (e.g. name@bank)'
  }
  return e
}
