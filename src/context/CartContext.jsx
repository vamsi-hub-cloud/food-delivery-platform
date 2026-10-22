import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react'
import { getRestaurant } from '../data/restaurants'
import { calcTotals } from '../utils/pricing'

const CartContext = createContext(null)
const STORAGE_KEY = 'foodigo_cart_v1'

const initialState = { restaurantId: null, items: [], coupon: null }

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
  } catch {
    return initialState
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action
      const existing = state.items.find((i) => i.key === item.key)
      const items = existing
        ? state.items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i))
        : [...state.items, item]
      return { ...state, restaurantId: item.restaurantId, items }
    }
    case 'REPLACE':
      return { restaurantId: action.item.restaurantId, items: [action.item], coupon: null }
    case 'INC':
      return { ...state, items: state.items.map((i) => (i.key === action.key ? { ...i, qty: i.qty + 1 } : i)) }
    case 'DEC': {
      const items = state.items
        .map((i) => (i.key === action.key ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
      return { ...state, items, restaurantId: items.length ? state.restaurantId : null, coupon: items.length ? state.coupon : null }
    }
    case 'REMOVE': {
      const items = state.items.filter((i) => i.key !== action.key)
      return { ...state, items, restaurantId: items.length ? state.restaurantId : null, coupon: items.length ? state.coupon : null }
    }
    case 'COUPON':
      return { ...state, coupon: action.code }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [pending, setPending] = useState(null) // item waiting for "replace cart?" confirmation

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const restaurant = state.restaurantId ? getRestaurant(state.restaurantId) : null

  const addItem = useCallback(
    (item) => {
      if (state.restaurantId && state.restaurantId !== item.restaurantId && state.items.length) {
        setPending(item)
        return false
      }
      dispatch({ type: 'ADD', item })
      return true
    },
    [state.restaurantId, state.items.length]
  )

  const confirmReplace = () => {
    if (pending) dispatch({ type: 'REPLACE', item: pending })
    setPending(null)
  }
  const cancelReplace = () => setPending(null)

  const totals = useMemo(
    () => calcTotals(state.items, restaurant?.deliveryFee ?? 0, state.coupon),
    [state.items, state.coupon, restaurant]
  )
  const count = state.items.reduce((s, i) => s + i.qty, 0)

  const value = {
    items: state.items,
    coupon: state.coupon,
    restaurant,
    totals,
    count,
    pending,
    addItem,
    confirmReplace,
    cancelReplace,
    increase: (key) => dispatch({ type: 'INC', key }),
    decrease: (key) => dispatch({ type: 'DEC', key }),
    remove: (key) => dispatch({ type: 'REMOVE', key }),
    applyCoupon: (code) => dispatch({ type: 'COUPON', code }),
    removeCoupon: () => dispatch({ type: 'COUPON', code: null }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
