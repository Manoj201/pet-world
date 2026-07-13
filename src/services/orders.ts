import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
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
}

export interface CreateOrderInput {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  buyer: OrderBuyer
  userId: string | null
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
  }
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const ref = await addDoc(collection(db, 'orders'), {
    orderNumber: '',
    items: input.items,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    paymentMethod: input.paymentMethod,
    status: 'pending',
    priority: 0,
    flagged: false,
    statusHistory: [],
    buyer: input.buyer,
    userId: input.userId,
    createdAt: serverTimestamp(),
  })
  return ref.id
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
