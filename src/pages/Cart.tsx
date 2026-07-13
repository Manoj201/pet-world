import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { CartItem } from '@/components/CartItem'
import { useCartStore, cartSubtotal } from '@/store/useCartStore'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export const DELIVERY_FEE = 5

export function Cart() {
  const items = useCartStore((state) => state.items)

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Your cart is empty.</p>
        <Link to="/shop" className={cn(buttonVariants(), 'mt-4')}>
          Browse products
        </Link>
      </div>
    )
  }

  const subtotal = cartSubtotal(items)
  const total = subtotal + DELIVERY_FEE

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-medium">Your cart</h1>

      <div>
        {items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>{formatPrice(DELIVERY_FEE)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link to="/checkout" className={cn(buttonVariants(), 'mt-4 w-full')}>
        Proceed to checkout
      </Link>
    </div>
  )
}
