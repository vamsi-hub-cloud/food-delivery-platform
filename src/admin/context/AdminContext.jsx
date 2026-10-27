import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { createSeed } from '../data/seed'
import { useOrders } from '../../context/OrderContext'
import { ORDER_STAGES, STAGE_MS, getStageIndex } from '../../utils/orderStatus'

const AdminContext = createContext(null)
const KEY = 'foodigo_admin_v1'
const SESSION = 'foodigo_admin_session'
const STATUS_SEQ = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && s.version === 1) return s
    }
  } catch { /* ignore */ }
  return createSeed()
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE': return { ...state, [action.key]: action.fn(state[action.key]) }
    case 'MULTI': return action.fn(state)
    case 'RESET': return createSeed()
    default: return state
  }
}

// map a customer-site order (from OrderContext) to the admin order shape
function mapLive(o) {
  const stage = getStageIndex(o.placedAt)
  const status = STATUS_SEQ[Math.min(stage, 4)]
  return {
    id: o.id, source: 'live', customerId: null, customerName: o.customer?.name || 'Guest', phone: o.customer?.phone || '', restaurantId: o.restaurant.id, restaurantName: o.restaurant.name,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, category: i.size || 'Menu' })), subtotal: o.totals.subtotal, discount: o.totals.discount, taxes: o.totals.taxes,
    deliveryFee: o.totals.deliveryFee, total: o.totals.total, commission: Math.round(o.totals.subtotal * 0.18), partnerEarning: 40,
    payment: { method: o.payment, status: o.payment === 'cod' ? 'cod' : 'paid' }, status, placedAt: o.placedAt, address: o.address, zone: 'Hyderabad', distanceKm: 4,
    partnerId: null, cancelReason: '', coupon: o.coupon || null,
    history: ORDER_STAGES.slice(0, stage + 1).map((s, i) => ({ status: STATUS_SEQ[i], at: o.placedAt + i * STAGE_MS })),
  }
}

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const { orders: liveOrders } = useOrders()
  const [sessionId, setSessionId] = useReducerSession()

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const roleOf = useCallback((u) => state.roles.find((r) => r.id === u?.roleId), [state.roles])
  const user = state.adminUsers.find((u) => u.id === sessionId && u.status === 'active') || null
  const role = roleOf(user)

  // merged orders (customer-site orders + seeded orders, with overrides applied to live ones)
  const orders = useMemo(() => {
    const live = liveOrders.map((o) => {
      const base = mapLive(o)
      const ov = state.overrides[o.id]
      if (!ov) return base
      return { ...base, ...ov, payment: { ...base.payment, ...(ov.payment || {}) }, history: [...base.history, ...(ov.history || [])] }
    })
    return [...live, ...state.orders].sort((a, b) => b.placedAt - a.placedAt)
  }, [liveOrders, state.orders, state.overrides])

  const can = useCallback((module, action = 'view') => !!role?.permissions?.[module]?.[action], [role])

  const log = useCallback((action, module, target = '', details = '') => {
    dispatch({ type: 'UPDATE', key: 'audit', fn: (a) => [{ id: `au${Date.now()}${Math.random().toString(36).slice(2, 5)}`, at: Date.now(), admin: user?.name || 'System', role: role?.name || '', action, module, target, details }, ...a].slice(0, 400) })
  }, [user, role])

  // generic mutate with optional audit entry {action, module, target, details}
  const update = useCallback((key, fn, a) => {
    dispatch({ type: 'UPDATE', key, fn })
    if (a) log(a.action, a.module, a.target, a.details)
  }, [log])

  const patchOrder = useCallback((id, patch, historyEntry) => {
    const entry = historyEntry ? { ...historyEntry, at: Date.now() } : null
    dispatch({
      type: 'MULTI',
      fn: (s) => {
        if (s.orders.some((o) => o.id === id)) {
          return { ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch, payment: patch.payment ? { ...o.payment, ...patch.payment } : o.payment, history: entry ? [...o.history, entry] : o.history } : o)) }
        }
        const prev = s.overrides[id] || {}
        return { ...s, overrides: { ...s.overrides, [id]: { ...prev, ...patch, payment: patch.payment ? { ...(prev.payment || {}), ...patch.payment } : prev.payment, history: entry ? [...(prev.history || []), entry] : prev.history } } }
      },
    })
  }, [])

  const setOrderStatus = useCallback((id, status, note = '') => {
    patchOrder(id, { status }, { status, note })
    log(`Order → ${status.replace(/_/g, ' ')}`, 'Orders', id, note)
  }, [patchOrder, log])

  const assignPartner = useCallback((orderId, partnerId) => {
    patchOrder(orderId, { partnerId: partnerId || null })
    log(partnerId ? 'Assigned delivery partner' : 'Unassigned delivery partner', 'Orders', orderId, partnerId || '')
  }, [patchOrder, log])

  const cancelOrder = useCallback((order, reason, refund) => {
    patchOrder(order.id, { status: 'cancelled', cancelReason: reason, ...(refund && order.payment.status === 'paid' ? { payment: { status: 'refunded' } } : {}) }, { status: 'cancelled', note: reason })
    if (refund && order.payment.status === 'paid') {
      dispatch({ type: 'UPDATE', key: 'refunds', fn: (r) => [{ id: `RF${5000 + r.length + 1}`, orderId: order.id, customerId: order.customerId, customerName: order.customerName, amount: order.total, reason, status: 'approved', requestedAt: Date.now(), decidedAt: Date.now(), note: 'Auto-refund on cancellation' }, ...r] })
      dispatch({ type: 'UPDATE', key: 'transactions', fn: (t) => t.map((x) => (x.orderId === order.id ? { ...x, status: 'refunded' } : x)) })
    }
    log('Cancelled order', 'Orders', order.id, reason)
  }, [patchOrder, log])

  const createRefund = useCallback((order, amount, reason) => {
    dispatch({ type: 'UPDATE', key: 'refunds', fn: (r) => [{ id: `RF${5000 + r.length + 1}`, orderId: order.id, customerId: order.customerId, customerName: order.customerName, amount, reason, status: 'pending', requestedAt: Date.now(), decidedAt: null, note: '' }, ...r] })
    log('Created refund request', 'Payments', order.id, `₹${amount} — ${reason}`)
  }, [log])

  const decideRefund = useCallback((refund, decision, note = '') => {
    dispatch({ type: 'UPDATE', key: 'refunds', fn: (r) => r.map((x) => (x.id === refund.id ? { ...x, status: decision, decidedAt: Date.now(), note } : x)) })
    if (decision === 'approved') {
      patchOrder(refund.orderId, { payment: { status: 'refunded' } })
      dispatch({ type: 'UPDATE', key: 'transactions', fn: (t) => t.map((x) => (x.orderId === refund.orderId ? { ...x, status: 'refunded' } : x)) })
    }
    log(decision === 'approved' ? 'Approved refund' : 'Rejected refund', 'Payments', refund.id, note)
  }, [patchOrder, log])

  const login = (email, password) => {
    const u = state.adminUsers.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u || u.password !== password) return { ok: false, message: 'Invalid email or password' }
    if (u.status !== 'active') return { ok: false, message: 'This account is inactive' }
    localStorage.setItem(SESSION, u.id)
    setSessionId(u.id)
    dispatch({ type: 'UPDATE', key: 'adminUsers', fn: (a) => a.map((x) => (x.id === u.id ? { ...x, lastLogin: Date.now() } : x)) })
    return { ok: true }
  }
  const logout = () => { localStorage.removeItem(SESSION); setSessionId(null) }
  const resetData = () => { dispatch({ type: 'RESET' }) }

  const counts = useMemo(() => ({
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    pendingRefunds: state.refunds.filter((r) => r.status === 'pending').length,
    pendingRestaurants: state.restaurants.filter((r) => r.status === 'pending').length,
    pendingPartners: state.partners.filter((p) => p.status === 'pending').length,
    openTickets: state.tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    failedPayments: state.transactions.filter((t) => t.status === 'failed' && !t.resolved).length,
  }), [orders, state.refunds, state.restaurants, state.partners, state.tickets, state.transactions])

  const value = { ...state, orders, user, role, can, counts, update, log, patchOrder, setOrderStatus, assignPartner, cancelOrder, createRefund, decideRefund, login, logout, resetData }
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

// tiny session hook (kept local so the provider stays readable)
function useReducerSession() {
  return useState(() => localStorage.getItem(SESSION))
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
