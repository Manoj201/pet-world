import { useRef, type MouseEvent, type TouchEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/useCartStore'
import type { Product } from '@/services/products'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

const TAP_MOVE_THRESHOLD = 10

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const navigate = useNavigate()
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const outOfStock = product.stock <= 0

  function handleQuickAdd(event: MouseEvent) {
    event.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
    // A fixed-position toast is the fix here — the header cart badge alone
    // is easy to miss if the shopper has scrolled down the product grid.
    toast.success(`Added ${product.name} to cart`, {
      action: { label: 'View cart', onClick: () => navigate('/cart') },
    })
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  // Distinguishes a genuine tap from a scroll/swipe gesture that happens to
  // pass over the button — without this, flicking through the grid on
  // mobile can register as a tap and silently add items to the cart.
  function handleTouchEnd(event: TouchEvent) {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const moved =
      Math.abs(touch.clientX - start.x) > TAP_MOVE_THRESHOLD ||
      Math.abs(touch.clientY - start.y) > TAP_MOVE_THRESHOLD
    if (moved) event.preventDefault()
  }

  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block">
          <div className="aspect-square w-full overflow-hidden bg-muted">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={cn(
                  'h-full w-full object-cover transition-transform duration-300 group-hover:scale-110',
                  outOfStock && 'opacity-50 grayscale',
                )}
              />
            )}
          </div>
        </Link>

        {outOfStock && (
          <span className="absolute top-2 left-2 rounded-full bg-foreground/90 px-2.5 py-1 text-xs font-semibold text-background">
            Out of stock
          </span>
        )}

        {!outOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="absolute -bottom-4 right-3 flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md ring-4 ring-card transition-transform hover:scale-110"
            aria-label="Quick add to cart"
          >
            <Plus className="size-4.5" />
          </button>
        )}
      </div>

      <Link to={`/products/${product.id}`} className="block px-3 pt-5">
        <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
        <p className="truncate text-sm font-medium">{product.name}</p>
      </Link>
      <p className="px-3 pt-1 pb-3 text-base font-semibold text-primary">
        {formatPrice(product.price)}
      </p>
    </div>
  )
}
