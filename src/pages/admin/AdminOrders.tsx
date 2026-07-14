import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { useAuthStore } from '@/store/useAuthStore'
import {
  deleteOrder,
  restoreOrder,
  softDeleteOrder,
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

function formatOrderDate(createdAt: Order['createdAt']) {
  if (!createdAt) return ''
  return createdAt.toDate().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface OrderCardProps {
  order: Order
  trashed?: boolean
  onAdvance: (order: Order) => void
  onCancel: (order: Order) => void
  onDelete: (order: Order) => void
  onRestore: (order: Order) => void
  onPermanentDelete: (order: Order) => void
  onPriorityChange: (order: Order, priority: number) => void
}

function OrderCard({
  order,
  trashed = false,
  onAdvance,
  onCancel,
  onDelete,
  onRestore,
  onPermanentDelete,
  onPriorityChange,
}: OrderCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-5 shadow-sm',
        order.flagged && !trashed && 'border-destructive bg-destructive/5',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{order.orderNumber || order.id}</p>
            <OrderStatusBadge status={order.status} />
            {order.flagged && !trashed && (
              <span className="text-xs font-medium text-destructive">
                Stock conflict — review
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
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

      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((item, i) => (
            <div
              key={item.productId}
              className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted"
              style={{ zIndex: 4 - i }}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
              +{order.items.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-0.5 text-sm">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{formatPrice(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      {trashed ? (
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onRestore(order)}>
            <RotateCcw className="size-3.5" />
            Restore
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            onClick={() => onPermanentDelete(order)}
          >
            <Trash2 className="size-3.5" />
            Delete permanently
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <label className="text-xs text-muted-foreground" htmlFor={`priority-${order.id}`}>
            Priority
          </label>
          <Input
            id={`priority-${order.id}`}
            type="number"
            className="h-7 w-16"
            value={order.priority}
            onChange={(e) => onPriorityChange(order, Number(e.target.value))}
          />

          <div className="ml-auto flex flex-wrap gap-2">
            {NEXT_STATUS[order.status] && (
              <Button size="sm" onClick={() => onAdvance(order)}>
                Mark as {NEXT_STATUS[order.status]}
              </Button>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Button size="sm" variant="outline" onClick={() => onCancel(order)}>
                Cancel
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(order)}
              aria-label="Move to trash"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [showDelivered, setShowDelivered] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => subscribeToAllOrders(setOrders), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(q) ||
        order.buyer.name.toLowerCase().includes(q) ||
        order.buyer.phone.toLowerCase().includes(q),
    )
  }, [orders, search])

  const active = useMemo(
    () =>
      filtered
        .filter((order) => !order.deleted && order.status !== 'delivered')
        .sort((a, b) => {
          if (a.flagged !== b.flagged) return a.flagged ? -1 : 1
          if (a.priority !== b.priority) return b.priority - a.priority
          return (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
        }),
    [filtered],
  )

  const delivered = useMemo(
    () =>
      filtered
        .filter((order) => !order.deleted && order.status === 'delivered')
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)),
    [filtered],
  )

  const trashed = useMemo(
    () =>
      filtered
        .filter((order) => order.deleted)
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)),
    [filtered],
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

  async function handleDelete(order: Order) {
    if (!confirm(`Move order ${order.orderNumber || order.id} to trash?`)) return
    try {
      await softDeleteOrder(order.id)
      toast.success('Order moved to trash')
    } catch {
      toast.error('Failed to delete order')
    }
  }

  async function handleRestore(order: Order) {
    try {
      await restoreOrder(order.id)
      toast.success('Order restored')
    } catch {
      toast.error('Failed to restore order')
    }
  }

  async function handlePermanentDelete(order: Order) {
    if (
      !confirm(
        `Permanently delete order ${order.orderNumber || order.id}? This cannot be undone.`,
      )
    )
      return
    try {
      await deleteOrder(order.id)
      toast.success('Order permanently deleted')
    } catch {
      toast.error('Failed to delete order')
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
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium">Orders</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search order #, name, or phone"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {active.length === 0 && (
        <p className="text-muted-foreground">
          {orders.length === 0 ? 'No orders yet.' : 'No active orders match your search.'}
        </p>
      )}

      <div className="space-y-4">
        {active.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onAdvance={handleAdvance}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onPriorityChange={handlePriorityChange}
          />
        ))}
      </div>

      {delivered.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowDelivered((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={cn('size-4 transition-transform', showDelivered && 'rotate-180')}
            />
            Delivered orders ({delivered.length})
          </button>

          {showDelivered && (
            <div className="mt-4 space-y-4">
              {delivered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAdvance={handleAdvance}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {trashed.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowTrash((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn('size-4 transition-transform', showTrash && 'rotate-180')} />
            Trash ({trashed.length})
          </button>

          {showTrash && (
            <div className="mt-4 space-y-4">
              {trashed.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  trashed
                  onAdvance={handleAdvance}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
