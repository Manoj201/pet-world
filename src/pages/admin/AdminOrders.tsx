import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { useAuthStore } from '@/store/useAuthStore'
import {
  subscribeToAllOrders,
  updateOrderPriority,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from '@/services/orders'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const user = useAuthStore((state) => state.user)

  useEffect(() => subscribeToAllOrders(setOrders), [])

  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) => {
        if (a.flagged !== b.flagged) return a.flagged ? -1 : 1
        if (a.priority !== b.priority) return b.priority - a.priority
        return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0)
      }),
    [orders],
  )

  async function handleAdvance(order: Order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    try {
      await updateOrderStatus(order.id, next, user?.email ?? 'admin')
    } catch {
      toast.error('Failed to update order status')
    }
  }

  async function handleCancel(order: Order) {
    if (!confirm(`Cancel order ${order.orderNumber || order.id}?`)) return
    try {
      await updateOrderStatus(order.id, 'cancelled', user?.email ?? 'admin')
    } catch {
      toast.error('Failed to cancel order')
    }
  }

  async function handlePriorityChange(order: Order, priority: number) {
    try {
      await updateOrderPriority(order.id, priority)
    } catch {
      toast.error('Failed to update priority')
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-medium">Orders</h1>

      {sorted.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}

      <div className="space-y-3">
        {sorted.map((order) => (
          <div
            key={order.id}
            className={cn(
              'rounded-lg border p-4',
              order.flagged && 'border-destructive bg-destructive/5',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.orderNumber || order.id}</p>
                  <OrderStatusBadge status={order.status} />
                  {order.flagged && (
                    <span className="text-xs font-medium text-destructive">
                      Stock conflict — review
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.buyer.name} · {order.buyer.phone}
                </p>
                <p className="text-sm text-muted-foreground">{order.buyer.address}</p>
              </div>

              <div className="text-right">
                <p className="font-medium">{formatPrice(order.total)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Bank transfer'}
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-0.5 text-sm">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-muted-foreground" htmlFor={`priority-${order.id}`}>
                Priority
              </label>
              <Input
                id={`priority-${order.id}`}
                type="number"
                className="h-7 w-16"
                value={order.priority}
                onChange={(e) => handlePriorityChange(order, Number(e.target.value))}
              />

              <div className="ml-auto flex gap-2">
                {NEXT_STATUS[order.status] && (
                  <Button size="sm" onClick={() => handleAdvance(order)}>
                    Mark as {NEXT_STATUS[order.status]}
                  </Button>
                )}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <Button size="sm" variant="outline" onClick={() => handleCancel(order)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
