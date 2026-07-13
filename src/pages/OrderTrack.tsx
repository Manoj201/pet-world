import { useState, type FormEvent } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/store/useCartStore'

interface OrderStatusResult {
  orderNumber: string
  status: string
  statusHistory: { status: string; timestamp: number | null; updatedBy: string }[]
  items: CartItem[]
  total: number
  createdAt: number | null
}

const getOrderStatus = httpsCallable<{ orderNumber: string; phone: string }, OrderStatusResult>(
  functions,
  'getOrderStatus',
)

export function OrderTrack() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<OrderStatusResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const response = await getOrderStatus({ orderNumber, phone })
      setResult(response.data)
    } catch {
      setError('No matching order found. Double check your order number and phone.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-xl font-medium">Track your order</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            required
            placeholder="PS-2026-0042"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone used at checkout</Label>
          <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Searching…' : 'Track order'}
        </Button>
      </form>

      {result && (
        <div className="mt-6 space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{result.orderNumber}</p>
            <OrderStatusBadge status={result.status} />
          </div>

          <div className="space-y-1 text-sm">
            {result.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-1 font-medium">
              <span>Total</span>
              <span>{formatPrice(result.total)}</span>
            </div>
          </div>

          {result.statusHistory.length > 0 && (
            <div className="space-y-1 border-t pt-2 text-xs text-muted-foreground">
              {result.statusHistory.map((event, i) => (
                <div key={i} className="flex justify-between">
                  <span className="capitalize">{event.status}</span>
                  <span>{event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
