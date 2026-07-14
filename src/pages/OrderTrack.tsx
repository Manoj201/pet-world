import { useState, type FormEvent } from 'react'
import { httpsCallable } from 'firebase/functions'
import {
  CheckCircle2,
  CircleX,
  Clock,
  MessageCircle,
  Package,
  PackageCheck,
  Search,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { functions } from '@/services/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
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

const STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'pending', label: 'Order placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
]

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER.replace(/\D/g, '')
const helpWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  'Hi! I need help finding my order number.',
)}`

function ProgressStepper({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
        <CircleX className="size-5" />
        This order was cancelled.
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status)

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const isComplete = i <= currentIndex
        const Icon = step.icon
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full',
                  isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-4" />
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1', isComplete ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
            <p
              className={cn(
                'mt-1.5 text-center text-xs',
                isComplete ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

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
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Search className="size-6 text-primary" />
        </div>
        <h1 className="mt-3 text-xl font-semibold">Track your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your order number and the phone number you used at checkout to see live status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
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
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Searching…' : 'Track order'}
        </Button>
      </form>

      {!result && (
        <div className="mt-6 space-y-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <Package className="mt-0.5 size-4 shrink-0" />
            Can't find your order number? Check the WhatsApp confirmation message we sent when
            you placed your order.
          </p>
          <a
            href={helpWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <MessageCircle className="size-4" />
            Need help? Message us on WhatsApp
          </a>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">{result.orderNumber}</p>
          </div>

          <ProgressStepper status={result.status} />

          <div className="space-y-1 border-t pt-4 text-sm">
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
        </div>
      )}
    </div>
  )
}
