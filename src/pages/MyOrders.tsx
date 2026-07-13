import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { subscribeToUserOrders, type Order } from '@/services/orders'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { formatPrice } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
      <div className="p-8 text-center text-muted-foreground">
        <p>Sign in to see your order history.</p>
        <Link to="/login" className={cn(buttonVariants(), 'mt-4')}>
          Sign in
        </Link>
      </div>
    )
  }

  if (orders === null) {
    return <p className="p-8 text-center text-muted-foreground">Loading your orders…</p>
  }

  if (orders.length === 0) {
    return <p className="p-8 text-center text-muted-foreground">You haven't placed any orders yet.</p>
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-medium">My orders</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{order.orderNumber || 'Processing…'}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
              {formatPrice(order.total)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
