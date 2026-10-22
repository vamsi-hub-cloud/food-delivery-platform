import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useLocalStorage('foodigo_orders_v1', [])

  const placeOrder = (order) => {
    const id = 'FG' + Date.now().toString().slice(-8)
    const full = { ...order, id, placedAt: Date.now() }
    setOrders((prev) => [full, ...prev])
    return id
  }
  const getOrder = (id) => orders.find((o) => o.id === id)
  const clearHistory = () => setOrders([])

  return <OrderContext.Provider value={{ orders, placeOrder, getOrder, clearHistory }}>{children}</OrderContext.Provider>
}

export const useOrders = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used inside OrderProvider')
  return ctx
}
