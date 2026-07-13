import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AdminRoute } from '@/components/AdminRoute'
import { Catalog } from '@/pages/Catalog'
import { ProductDetail } from '@/pages/ProductDetail'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminProducts } from '@/pages/admin/AdminProducts'

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
