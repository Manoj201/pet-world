import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Home, Menu } from 'lucide-react'
import { auth } from '@/services/firebase'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Inventory', to: '/admin/inventory' },
  { label: 'Reviews', to: '/admin/reviews' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-md px-3 py-1.5 text-sm hover:bg-muted', isActive && 'bg-muted font-medium')

export function AdminDashboard() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col sm:flex-row">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b p-3 sm:hidden">
        <p className="font-medium">Pet World Admin</p>
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              <SheetClose
                nativeButton={false}
                render={<Link to="/" className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" />}
              >
                <Home className="size-4" />
                Home
              </SheetClose>
              {navItems.map((item) => (
                <SheetClose
                  key={item.to}
                  nativeButton={false}
                  render={<NavLink to={item.to} className={navLinkClass} />}
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto px-4 pb-4">
              <SheetClose
                render={
                  <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut} />
                }
              >
                Sign out
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden w-48 shrink-0 flex-col border-r p-4 sm:flex">
        <p className="mb-4 font-medium">Pet World Admin</p>
        <nav className="flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted">
            <Home className="size-4" />
            Home
          </Link>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button variant="outline" size="sm" className="mt-auto" onClick={handleSignOut}>
          Sign out
        </Button>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
