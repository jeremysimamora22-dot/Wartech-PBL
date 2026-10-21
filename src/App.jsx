import { MotionConfig } from 'framer-motion'
import { Navigate, Route, Routes } from 'react-router-dom'
import RequireStaff from './components/RequireStaff'
import AdminLayout from './layouts/AdminLayout'
import CustomerLayout from './layouts/CustomerLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import NotFound from './pages/NotFound'
import OrderPage from './pages/OrderPage'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/login" element={<LoginPage mode="login" />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        <Route element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders/:token" element={<OrderPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </MotionConfig>
  )
}
