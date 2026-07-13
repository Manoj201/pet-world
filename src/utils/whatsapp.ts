import type { CartItem } from '@/store/useCartStore'
import type { OrderBuyer, PaymentMethod } from '@/services/orders'
import { formatPrice } from '@/lib/format'

interface OrderNotification {
  orderId: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  buyer: OrderBuyer
}

export function buildOrderWhatsAppUrl(order: OrderNotification): string {
  const lines = [
    'New order on Pet World',
    `Order ref: ${order.orderId}`,
    '',
    `Name: ${order.buyer.name}`,
    `Phone: ${order.buyer.phone}`,
    `Address: ${order.buyer.address}`,
    '',
    'Items:',
    ...order.items.map(
      (item) => `- ${item.name} x${item.qty} (${formatPrice(item.price * item.qty)})`,
    ),
    '',
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${formatPrice(order.deliveryFee)}`,
    `Total: ${formatPrice(order.total)}`,
    `Payment: ${order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Bank transfer'}`,
  ]

  const number = import.meta.env.VITE_WHATSAPP_NUMBER.replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`
}
