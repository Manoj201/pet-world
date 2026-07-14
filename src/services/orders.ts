import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/services/firebase'
import type { CartItem } from '@/store/useCartStore'

export type PaymentMethod = 'cod' | 'transfer'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderBuyer {
  name: string
  phone: string
  address: string
  email: string
}

export interface OrderStatusEvent {
  status: OrderStatus
  timestamp: Timestamp | null
  updatedBy: string
}

export interface Order {
  id: string
  orderNumber: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  priority: number
  flagged: boolean
  statusHistory: OrderStatusEvent[]
  buyer: OrderBuyer
  userId: string | null
  createdAt: Timestamp | null
  deleted: boolean
}

export interface CreateOrderItemInput {
  productId: string
  qty: number
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[]
  buyer: OrderBuyer
  paymentMethod: PaymentMethod
  userId: string | null
}

export interface CreateOrderResult {
  orderId: string
  subtotal: number
  deliveryFee: number
  total: number
  items: CartItem[]
}

function toOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    orderNumber: (data.orderNumber as string) ?? '',
    items: (data.items as CartItem[]) ?? [],
    subtotal: data.subtotal as number,
    deliveryFee: data.deliveryFee as number,
    total: data.total as number,
    paymentMethod: data.paymentMethod as PaymentMethod,
    status: data.status as OrderStatus,
    priority: (data.priority as number) ?? 0,
    flagged: (data.flagged as boolean) ?? false,
    statusHistory: (data.statusHistory as OrderStatusEvent[]) ?? [],
    buyer: data.buyer as OrderBuyer,
    userId: (data.userId as string | null) ?? null,
    createdAt: (data.createdAt as Timestamp) ?? null,
    deleted: (data.deleted as boolean) ?? false,
  }
}

// Pricing is computed server-side in the createOrder callable, never
// trusted from the client — see functions/src/index.ts. Firestore rules
// block direct client writes to `orders` entirely.
const createOrderCallable = httpsCallable<CreateOrderInput, CreateOrderResult>(
  functions,
  'createOrder',
)

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const response = await createOrderCallable(input)
  return response.data
}

// orderNumber is assigned by the onOrderCreate Cloud Function trigger, not at
// creation time, so callers that need the human-readable number right after
// createOrder (e.g. the WhatsApp notification) must wait for it to land.
export function waitForOrderNumber(orderId: string, timeoutMs = 8000): Promise<string> {
  return new Promise((resolve) => {
    let unsubscribe: () => void = () => {}

    const timeout = setTimeout(() => {
      unsubscribe()
      resolve('')
    }, timeoutMs)

    unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      const orderNumber = snap.data()?.orderNumber as string | undefined
      if (orderNumber) {
        clearTimeout(timeout)
        unsubscribe()
        resolve(orderNumber)
      }
    })
  })
}

export function subscribeToUserOrders(userId: string, onChange: (orders: Order[]) => void) {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toOrder(d.id, d.data())))
  })
}

export function subscribeToAllOrders(onChange: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toOrder(d.id, d.data())))
  })
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  updatedBy: string,
): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    statusHistory: arrayUnion({ status, timestamp: Timestamp.now(), updatedBy }),
  })
}

export async function updateOrderPriority(orderId: string, priority: number): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { priority })
}

// Soft delete: moves the order to the admin Trash view without losing the
// record or its audit trail. Reversible via restoreOrder.
export async function softDeleteOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { deleted: true })
}

export async function restoreOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { deleted: false })
}

// Permanent, irreversible removal — only ever called from the Trash view,
// after an order has already been soft-deleted.
export async function deleteOrder(orderId: string): Promise<void> {
  await deleteDoc(doc(db, 'orders', orderId))
}
