import { Link, useLocation, useParams } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/store/useCartStore'
import type { OrderBuyer } from '@/services/orders'

interface ConfirmationState {
  items: CartItem[]
  total: number
  buyer: OrderBuyer
}

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = location.state as ConfirmationState | null

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-xl font-medium">Thanks{state ? `, ${state.buyer.name}` : ''}!</h1>
      <p className="mt-2 text-muted-foreground">
        Your order has been received. We'll be in touch shortly to confirm.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Reference: {id}</p>

      {state && (
        <div className="mt-6 space-y-1 rounded-lg border p-4 text-left text-sm">
          {state.items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.qty}
              </span>
              <span>{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-1 font-medium">
            <span>Total</span>
            <span>{formatPrice(state.total)}</span>
          </div>
        </div>
      )}

      <Link to="/shop" className={cn(buttonVariants(), 'mt-6')}>
        Continue shopping
      </Link>
    </div>
  )
}
