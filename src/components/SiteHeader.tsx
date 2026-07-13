import { Link } from 'react-router-dom'
import { MessageCircle, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import logo from '@/assets/logo.jpeg'

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.qty, 0))
  const user = useAuthStore((state) => state.user)

  return (
    <div className="sticky top-0 z-10">
      <div className="hidden bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-foreground sm:block">
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-3.5" />
          Confirm your order instantly via WhatsApp · Cash on delivery available
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
          <nav className="flex items-center gap-5 text-sm text-primary-foreground/80">
            <Link to="/track-order" className="hidden hover:text-accent sm:inline">
              Track order
            </Link>
            <Link to={user ? '/my-orders' : '/login'} className="hover:text-accent">
              {user ? 'My orders' : 'Sign in'}
            </Link>
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
        </div>
      </header>
    </div>
  )
}
