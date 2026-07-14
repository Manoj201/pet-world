import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  approved: boolean
  createdAt: Timestamp | null
}

export interface CreateReviewInput {
  name: string
  rating: number
  comment: string
}

function toReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    name: data.name as string,
    rating: data.rating as number,
    comment: data.comment as string,
    approved: (data.approved as boolean) ?? false,
    createdAt: (data.createdAt as Timestamp) ?? null,
  }
}

export async function createReview(input: CreateReviewInput): Promise<void> {
  await addDoc(collection(db, 'reviews'), {
    name: input.name,
    rating: input.rating,
    comment: input.comment,
    approved: false,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToApprovedReviews(onChange: (reviews: Review[]) => void) {
  const q = query(
    collection(db, 'reviews'),
    where('approved', '==', true),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toReview(d.id, d.data())))
  })
}

export function subscribeToAllReviews(onChange: (reviews: Review[]) => void) {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toReview(d.id, d.data())))
  })
}

export async function setReviewApproved(reviewId: string, approved: boolean): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), { approved })
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', reviewId))
}
