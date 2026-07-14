import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCartStore, cartSubtotal } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { createOrder, waitForOrderNumber, type PaymentMethod } from '@/services/orders'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DELIVERY_FEE } from '@/pages/Cart'
import { buildOrderWhatsAppUrl } from '@/utils/whatsapp'

export function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clear)
  const user = useAuthStore((state) => state.user)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [submitting, setSubmitting] = useState(false)

  const subtotal = cartSubtotal(items)
  const total = subtotal + DELIVERY_FEE

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const buyer = { name, phone, address, email }
      const result = await createOrder({
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        paymentMethod,
        buyer,
        userId: user?.uid ?? null,
      })
      const orderNumber = await waitForOrderNumber(result.orderId)
      clearCart()
      navigate(`/order-confirmation/${result.orderId}`, {
        state: { items: result.items, total: result.total, buyer, orderNumber },
      })
      window.location.assign(
        buildOrderWhatsAppUrl({
          orderId: orderNumber || result.orderId,
          items: result.items,
          subtotal: result.subtotal,
          deliveryFee: result.deliveryFee,
          total: result.total,
          paymentMethod,
          buyer,
        }),
      )
    } catch {
      toast.error('Could not place your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Your cart is empty — nothing to check out.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-xl font-medium">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="address">Delivery address</Label>
          <Input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Payment method</Label>
          <div className="flex gap-2">
            {(['cod', 'transfer'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  'flex-1 rounded-md border px-3 py-2 text-sm',
                  paymentMethod === method ? 'border-primary bg-muted font-medium' : 'border-input',
                )}
              >
                {method === 'cod' ? 'Cash on delivery' : 'Bank transfer'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 border-t pt-4 text-sm">
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

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place order'}
        </Button>
      </form>
    </div>
  )
}
