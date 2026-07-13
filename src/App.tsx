import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AdminRoute } from '@/components/AdminRoute'
import { SiteLayout } from '@/components/SiteLayout'
import { Home } from '@/pages/Home'
import { Catalog } from '@/pages/Catalog'
import { ProductDetail } from '@/pages/ProductDetail'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { OrderTrack } from '@/pages/OrderTrack'
import { MyOrders } from '@/pages/MyOrders'
import { Login } from '@/pages/Login'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminInventory } from '@/pages/admin/AdminInventory'
import { AdminOrders } from '@/pages/admin/AdminOrders'
import { AdminProducts } from '@/pages/admin/AdminProducts'

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/track-order" element={<OrderTrack />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
