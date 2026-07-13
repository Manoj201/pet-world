import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [{ label: 'Products', to: '/admin/products' }]

export function AdminDashboard() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-48 shrink-0 flex-col border-r p-4">
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
        <Button variant="outline" size="sm" className="mt-auto" onClick={handleSignOut}>
          Sign out
        </Button>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
