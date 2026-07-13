import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [{ label: 'Products', to: '/admin/products' }]

export function AdminDashboard() {
  return (
    <div className="flex min-h-svh">
      <aside className="w-48 shrink-0 border-r p-4">
        <p className="mb-4 font-medium">Pet World Admin</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm hover:bg-muted',
                  isActive && 'bg-muted font-medium',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
