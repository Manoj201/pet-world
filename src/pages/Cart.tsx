import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react'
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
      <div className="flex min-h-[60svh] flex-col items-center justify-center p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Looks like you haven't added anything yet.
        </p>
        <Link to="/shop" className={cn(buttonVariants(), 'mt-6')}>
          Browse products
        </Link>
      </div>
    )
  }

  const subtotal = cartSubtotal(items)
  const total = subtotal + DELIVERY_FEE
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div className="mx-auto max-w-5xl p-6 pb-28 lg:pb-6">
      <h1 className="mb-6 text-2xl font-semibold">
        Your cart{' '}
        <span className="font-normal text-muted-foreground">
          ({itemCount} item{itemCount === 1 ? '' : 's'})
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatPrice(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className={cn(buttonVariants({ size: 'lg' }), 'mt-5 hidden w-full gap-2 lg:flex')}
            >
              Proceed to checkout
              <ArrowRight className="size-4" />
            </Link>

            <p className="mt-4 hidden items-center justify-center gap-1.5 text-xs text-muted-foreground lg:flex">
              <ShieldCheck className="size-3.5" />
              Secure checkout · Cash on delivery available
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: total + checkout stay reachable without scrolling past the whole list */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 border-t bg-card p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold text-primary">{formatPrice(total)}</p>
        </div>
        <Link to="/checkout" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
          Checkout
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
