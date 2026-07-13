import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'

export function SiteLayout() {
  return (
    <div className="min-h-svh">
      <SiteHeader />
      <Outlet />
    </div>
  )
}
