import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
  addDoc,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  category: string
  imageUrl: string
  stock: number
  inStock: boolean
  description: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

const productsCollection = collection(db, 'products')

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: data.name as string,
    brand: data.brand as string,
    price: data.price as number,
    category: data.category as string,
    imageUrl: data.imageUrl as string,
    stock: data.stock as number,
    inStock: data.inStock as boolean,
    description: data.description as string,
    createdAt: (data.createdAt as Timestamp) ?? null,
    updatedAt: (data.updatedAt as Timestamp) ?? null,
  }
}

export function subscribeToCatalog(onChange: (products: Product[]) => void) {
  const q = query(
    productsCollection,
    where('inStock', '==', true),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toProduct(d.id, d.data())))
  })
}

export function subscribeToAllProducts(onChange: (products: Product[]) => void) {
  const q = query(productsCollection, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toProduct(d.id, d.data())))
  })
}

export async function getProduct(id: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, 'products', id))
  return snapshot.exists() ? toProduct(snapshot.id, snapshot.data()) : null
}

export async function createProduct(input: ProductInput): Promise<string> {
  const ref = await addDoc(productsCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<void> {
  await updateDoc(doc(db, 'products', id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id))
}
