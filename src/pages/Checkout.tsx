import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Banknote, Building2, ShieldCheck } from 'lucide-react'
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

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cod', label: 'Cash on delivery', icon: Banknote },
  { value: 'transfer', label: 'Bank transfer', icon: Building2 },
]

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
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold">Delivery details</h2>

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

          <div className="grid gap-1.5 border-t pt-4">
            <Label>Payment method</Label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors',
                    paymentMethod === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-6',
                      paymentMethod === value ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Order summary</h2>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {item.name} × {item.qty}
                  </span>
                  <span className="shrink-0">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
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

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Secure checkout · Cash on delivery available
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
