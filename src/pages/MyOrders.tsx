import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { subscribeToUserOrders, type Order } from '@/services/orders'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { OrderProgressStepper } from '@/components/OrderProgressStepper'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatOrderDate(createdAt: Order['createdAt']) {
  if (!createdAt) return ''
  return createdAt.toDate().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function EmptyState({
  icon: Icon = Package,
  title,
  description,
  ctaLabel,
  ctaTo,
}: {
  icon?: typeof Package
  title: string
  description: string
  ctaLabel: string
  ctaTo: string
}) {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Link to={ctaTo} className={cn(buttonVariants(), 'mt-6')}>
        {ctaLabel}
      </Link>
    </div>
  )
}

export function MyOrders() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (!user) return
    return subscribeToUserOrders(user.uid, setOrders)
  }, [user])

  if (loading) return null

  if (!user) {
    return (
      <EmptyState
        title="Sign in to see your orders"
        description="Track your purchases and reorder your pet's favorites."
        ctaLabel="Sign in"
        ctaTo="/login"
      />
    )
  }

  if (orders === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it'll show up here."
        ctaLabel="Start shopping"
        ctaTo="/shop"
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">My orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{order.orderNumber || 'Processing…'}</p>
                <p className="text-xs text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-3">
                {order.items.slice(0, 4).map((item, i) => (
                  <div
                    key={item.productId}
                    className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted"
                    style={{ zIndex: 4 - i }}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="flex size-12 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
                <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
              </p>
            </div>

            <div className="mt-4 border-t pt-4">
              <OrderProgressStepper status={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
