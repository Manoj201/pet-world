import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/store/useCartStore'
import type { OrderBuyer } from '@/services/orders'

interface ConfirmationState {
  items: CartItem[]
  total: number
  buyer: OrderBuyer
  orderNumber: string
}

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = location.state as ConfirmationState | null

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
        <CheckCircle2 className="size-8 text-green-700 dark:text-green-300" />
      </div>

      <h1 className="mt-4 text-2xl font-semibold">
        Thanks{state ? `, ${state.buyer.name}` : ''}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your order has been received. We'll be in touch shortly to confirm.
      </p>
      <p className="mt-1 text-sm font-medium text-primary">
        Reference: {state?.orderNumber || id}
      </p>

      {state && (
        <div className="mt-6 rounded-2xl border bg-card p-5 text-left shadow-sm">
          <div className="space-y-1.5 text-sm">
            {state.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.name} × {item.qty}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(state.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" />
        Order details sent to WhatsApp for confirmation
      </div>

      <Link to="/shop" className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}>
        Continue shopping
      </Link>
    </div>
  )
}
