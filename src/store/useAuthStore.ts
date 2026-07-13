import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'

export type UserRole = 'customer' | 'admin'

interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  role: null,
  loading: true,
}))

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    useAuthStore.setState({ user: null, role: null, loading: false })
    return
  }

  const snapshot = await getDoc(doc(db, 'users', user.uid))
  const role = (snapshot.data()?.role as UserRole | undefined) ?? 'customer'
  useAuthStore.setState({ user, role, loading: false })
})
