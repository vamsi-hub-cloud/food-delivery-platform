import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminProvider, useAdmin } from './context/AdminContext'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Restaurants from './pages/Restaurants'
import RestaurantDetail from './pages/RestaurantDetail'
import Partners from './pages/Partners'
import PartnerDetail from './pages/PartnerDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Payments from './pages/Payments'
import Offers from './pages/Offers'
import Support from './pages/Support'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Zones from './pages/Zones'
import Pricing from './pages/Pricing'
import Roles from './pages/Roles'
import Settings from './pages/Settings'
import Audit from './pages/Audit'

function Guard({ module, children }) {
  const { can } = useAdmin()
  if (!can(module)) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-3xl bg-white p-10 text-center shadow-card">
        <div className="text-6xl">🔒</div>
        <h2 className="mt-3 text-xl font-bold">Access restricted</h2>
        <p className="mt-1 text-sm text-gray-500">Your role does not have permission to view this module. Ask a Super Admin to update your permissions.</p>
      </div>
    )
  }
  return children
}

function Protected() {
  const { user } = useAdmin()
  if (!user) return <Navigate to="/admin/login" replace />
  return <AdminLayout />
}

const g = (module, el) => <Guard module={module}>{el}</Guard>

export default function AdminApp() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<Protected />}>
          <Route index element={g('dashboard', <Dashboard />)} />
          <Route path="analytics" element={g('dashboard', <Analytics />)} />
          <Route path="orders" element={g('orders', <Orders />)} />
          <Route path="orders/:id" element={g('orders', <OrderDetail />)} />
          <Route path="restaurants" element={g('restaurants', <Restaurants />)} />
          <Route path="restaurants/:id" element={g('restaurants', <RestaurantDetail />)} />
          <Route path="partners" element={g('partners', <Partners />)} />
          <Route path="partners/:id" element={g('partners', <PartnerDetail />)} />
          <Route path="customers" element={g('customers', <Customers />)} />
          <Route path="customers/:id" element={g('customers', <CustomerDetail />)} />
          <Route path="payments" element={g('payments', <Payments />)} />
          <Route path="offers" element={g('offers', <Offers />)} />
          <Route path="support" element={g('support', <Support />)} />
          <Route path="notifications" element={g('support', <Notifications />)} />
          <Route path="reports" element={g('reports', <Reports />)} />
          <Route path="zones" element={g('settings', <Zones />)} />
          <Route path="pricing" element={g('settings', <Pricing />)} />
          <Route path="roles" element={g('settings', <Roles />)} />
          <Route path="settings" element={g('settings', <Settings />)} />
          <Route path="audit" element={g('settings', <Audit />)} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminProvider>
  )
}
