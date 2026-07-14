import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Banknote, MessageCircle, Menu, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { auth } from '@/services/firebase'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import logo from '@/assets/logo.jpeg'

const ANNOUNCEMENTS = [
  { icon: MessageCircle, label: 'Confirm your order instantly via WhatsApp' },
  { icon: Banknote, label: 'Cash on delivery available' },
  { icon: Truck, label: 'Fast local delivery' },
  { icon: ShieldCheck, label: 'Quality-checked products' },
]

export function SiteHeader() {
  const navigate = useNavigate()
  const itemCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.qty, 0))
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const [announcementIndex, setAnnouncementIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((i) => (i + 1) % ANNOUNCEMENTS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  const Announcement = ANNOUNCEMENTS[announcementIndex].icon

  return (
    <div className="sticky top-0 z-10">
      <div className="hidden bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-foreground sm:block">
        <span
          key={announcementIndex}
          className="inline-flex animate-in fade-in items-center gap-1.5 duration-500"
        >
          <Announcement className="size-3.5" />
          {ANNOUNCEMENTS[announcementIndex].label}
        </span>
      </div>

      <header className="border-b border-primary-foreground/10 bg-primary/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-medium text-primary-foreground">
            <img
              src={logo}
              alt="Pet World"
              className="size-9 rounded-full object-cover ring-2 ring-primary-foreground/20"
            />
            <span className="text-lg">Pet World</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 text-sm text-primary-foreground/80 sm:flex">
            <Link to="/track-order" className="hover:text-accent">
              Track order
            </Link>
            {role === 'admin' && (
              <Link to="/admin" className="hover:text-accent">
                Admin panel
              </Link>
            )}
            <Link to={user ? '/my-orders' : '/login'} className="hover:text-accent">
              {user ? 'My orders' : 'Sign in'}
            </Link>
            {user && (
              <button type="button" onClick={handleSignOut} className="hover:text-accent">
                Sign out
              </button>
            )}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              <ShoppingCart className="size-4.5" />
              {itemCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile nav: cart always visible, everything else in a drawer */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/cart"
              className="flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-primary-foreground"
            >
              <ShoppingCart className="size-4.5" />
              {itemCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  />
                }
              >
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
                    render={<Link to="/track-order" className="rounded-md px-2 py-2 hover:bg-muted" />}
                  >
                    Track order
                  </SheetClose>
                  {role === 'admin' && (
                    <SheetClose
                      nativeButton={false}
                      render={<Link to="/admin" className="rounded-md px-2 py-2 hover:bg-muted" />}
                    >
                      Admin panel
                    </SheetClose>
                  )}
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        to={user ? '/my-orders' : '/login'}
                        className="rounded-md px-2 py-2 hover:bg-muted"
                      />
                    }
                  >
                    {user ? 'My orders' : 'Sign in'}
                  </SheetClose>
                  {user && (
                    <SheetClose
                      render={
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="rounded-md px-2 py-2 text-left hover:bg-muted"
                        />
                      }
                    >
                      Sign out
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  )
}
