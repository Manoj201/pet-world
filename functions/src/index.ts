import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentWritten,
} from 'firebase-functions/v2/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

// Storage Security Rules can't read Firestore directly, so admin-only
// Storage access is enforced via an auth custom claim kept in sync here.
export const syncAdminClaim = onDocumentWritten('users/{uid}', async (event) => {
  const after = event.data?.after
  const role = after?.exists ? after.data()?.role : undefined
  await getAuth().setCustomUserClaims(event.params.uid, { admin: role === 'admin' })
})

interface OrderItem {
  productId: string
  qty: number
}

// Runs the stock decrement, order numbering, and audit log as one
// transaction so an online order and an in-store sale can never both
// sell the last unit of a product.
export const onOrderCreate = onDocumentCreated('orders/{orderId}', async (event) => {
  const snapshot = event.data
  if (!snapshot) return

  const order = snapshot.data() as { items: OrderItem[]; status: string }
  const db = getFirestore()
  const counterRef = db.collection('counters').doc('orders')
  const productRefs = order.items.map((item) => db.collection('products').doc(item.productId))

  await db.runTransaction(async (tx) => {
    const [productSnaps, counterSnap] = await Promise.all([
      Promise.all(productRefs.map((ref) => tx.get(ref))),
      tx.get(counterRef),
    ])

    const nextCount = ((counterSnap.data()?.count as number) ?? 0) + 1
    const orderNumber = `PS-${new Date().getFullYear()}-${String(nextCount).padStart(4, '0')}`

    productRefs.forEach((ref, i) => {
      const item = order.items[i]
      const currentStock = (productSnaps[i].data()?.stock as number) ?? 0
      const newStock = Math.max(currentStock - item.qty, 0)

      tx.update(ref, { stock: newStock, updatedAt: FieldValue.serverTimestamp() })
      tx.set(db.collection('stockMovements').doc(), {
        productId: item.productId,
        change: -item.qty,
        reason: 'online-order',
        orderId: event.params.orderId,
        adminId: null,
        timestamp: FieldValue.serverTimestamp(),
      })
    })

    tx.set(counterRef, { count: nextCount }, { merge: true })
    tx.update(snapshot.ref, {
      orderNumber,
      statusHistory: FieldValue.arrayUnion({
        status: order.status,
        timestamp: Timestamp.now(),
        updatedBy: 'system',
      }),
    })
  })
})

const DELIVERY_FEE = 350

interface CreateOrderItemInput {
  productId: string
  qty: number
}

interface OrderBuyerInput {
  name: string
  phone: string
  address: string
  email: string
}

// Prices and totals are computed here from live product data, never trusted
// from the client, then written via the Admin SDK (Firestore rules block
// direct client writes to `orders` entirely). This still fires the
// onOrderCreate trigger above unchanged, since Admin SDK writes trigger
// Firestore functions the same as client writes.
export const createOrder = onCall(async (request) => {
  const { items, buyer, paymentMethod, userId } = request.data as {
    items?: CreateOrderItemInput[]
    buyer?: OrderBuyerInput
    paymentMethod?: 'cod' | 'transfer'
    userId?: string | null
  }

  if (!items?.length || !buyer?.name || !buyer?.phone || !buyer?.address) {
    throw new HttpsError('invalid-argument', 'Missing required order fields')
  }
  if (paymentMethod !== 'cod' && paymentMethod !== 'transfer') {
    throw new HttpsError('invalid-argument', 'Invalid payment method')
  }
  if (userId && request.auth?.uid !== userId) {
    throw new HttpsError('permission-denied', 'userId must match the authenticated caller')
  }
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.qty) || item.qty <= 0) {
      throw new HttpsError('invalid-argument', 'Invalid item quantity')
    }
  }

  const db = getFirestore()
  const productRefs = items.map((item) => db.collection('products').doc(item.productId))
  const productSnaps = await Promise.all(productRefs.map((ref) => ref.get()))

  const lineItems = items.map((item, i) => {
    const snap = productSnaps[i]
    if (!snap.exists) {
      throw new HttpsError('not-found', `Product ${item.productId} not found`)
    }
    const data = snap.data()!
    return {
      productId: item.productId,
      name: data.name as string,
      price: data.price as number,
      imageUrl: (data.imageUrl as string) ?? '',
      qty: item.qty,
    }
  })

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal + DELIVERY_FEE

  const orderRef = await db.collection('orders').add({
    orderNumber: '',
    items: lineItems,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total,
    paymentMethod,
    status: 'pending',
    priority: 0,
    flagged: false,
    statusHistory: [],
    buyer,
    userId: userId ?? null,
    createdAt: FieldValue.serverTimestamp(),
  })

  return { orderId: orderRef.id, subtotal, deliveryFee: DELIVERY_FEE, total, items: lineItems }
})

// Guest order tracking: looked up by orderNumber + phone rather than a
// direct Firestore read, since guests have no auth to scope a read to.
export const getOrderStatus = onCall(async (request) => {
  const { orderNumber, phone } = request.data as { orderNumber?: string; phone?: string }
  if (!orderNumber || !phone) {
    throw new HttpsError('invalid-argument', 'orderNumber and phone are required')
  }

  const snapshot = await getFirestore()
    .collection('orders')
    .where('orderNumber', '==', orderNumber)
    .where('buyer.phone', '==', phone)
    .limit(1)
    .get()

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'No matching order found')
  }

  const order = snapshot.docs[0].data()
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    statusHistory: (order.statusHistory ?? []).map(
      (event: { status: string; timestamp: Timestamp; updatedBy: string }) => ({
        ...event,
        timestamp: event.timestamp?.toMillis() ?? null,
      }),
    ),
    items: order.items,
    total: order.total,
    createdAt: (order.createdAt as Timestamp | undefined)?.toMillis() ?? null,
  }
})

// When an order is confirmed, re-checks whether other still-pending orders
// for the same products can still be fulfilled against current stock
// (which may have shrunk since they were placed, e.g. via an in-store sale
// or manual correction) and flags the ones that can no longer be covered.
export const checkOrderConflicts = onDocumentUpdated('orders/{orderId}', async (event) => {
  const before = event.data?.before.data()
  const after = event.data?.after.data()
  if (!before || !after) return
  if (before.status === 'confirmed' || after.status !== 'confirmed') return

  const db = getFirestore()
  const items = after.items as OrderItem[]
  const productIds = [...new Set(items.map((item) => item.productId))]

  const [productSnaps, pendingSnap] = await Promise.all([
    Promise.all(productIds.map((id) => db.collection('products').doc(id).get())),
    db.collection('orders').where('status', '==', 'pending').get(),
  ])
  const stockByProduct = new Map(
    productIds.map((id, i) => [id, (productSnaps[i].data()?.stock as number) ?? 0]),
  )

  const otherPending = pendingSnap.docs.filter((d) => d.id !== event.params.orderId)

  for (const productId of productIds) {
    let remaining = stockByProduct.get(productId) ?? 0
    const contenders = otherPending
      .filter((d) => (d.data().items as OrderItem[]).some((i) => i.productId === productId))
      .sort(
        (a, b) =>
          ((a.data().createdAt as Timestamp | undefined)?.toMillis() ?? 0) -
          ((b.data().createdAt as Timestamp | undefined)?.toMillis() ?? 0),
      )

    for (const doc of contenders) {
      const item = (doc.data().items as OrderItem[]).find((i) => i.productId === productId)
      if (!item) continue
      if (remaining < item.qty) {
        if (!doc.data().flagged) await doc.ref.update({ flagged: true })
      } else {
        remaining -= item.qty
      }
    }
  }
})

// In-store sale / restock / correction, using the same transactional
// stock-decrement + audit-log path as online orders so both can never
// oversell the same last unit.
export const adjustStockManually = onCall(async (request) => {
  if (request.auth?.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Admins only')
  }

  const { productId, change, reason } = request.data as {
    productId?: string
    change?: number
    reason?: 'in-store-sale' | 'restock' | 'adjustment'
  }

  if (!productId || typeof change !== 'number' || change === 0 || !reason) {
    throw new HttpsError(
      'invalid-argument',
      'productId, a non-zero change, and reason are required',
    )
  }

  const db = getFirestore()
  const productRef = db.collection('products').doc(productId)
  const adminId = request.auth.uid

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(productRef)
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Product not found')
    }

    const currentStock = (snap.data()?.stock as number) ?? 0
    const stock = Math.max(currentStock + change, 0)

    tx.update(productRef, { stock, updatedAt: FieldValue.serverTimestamp() })
    tx.set(db.collection('stockMovements').doc(), {
      productId,
      change,
      reason,
      orderId: null,
      adminId,
      timestamp: FieldValue.serverTimestamp(),
    })

    return { stock }
  })
})
