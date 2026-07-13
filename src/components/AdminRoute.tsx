import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { role, loading } = useAuthStore()

  if (loading) return null
  if (role !== 'admin') return <Navigate to="/admin/login" replace />

  return children
}
