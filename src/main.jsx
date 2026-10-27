import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
