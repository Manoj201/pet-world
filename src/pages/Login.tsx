import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Lock } from 'lucide-react'
import { auth, db } from '@/services/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '@/assets/logo.jpeg'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

async function ensureCustomerDoc(uid: string, name: string) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, { name, role: 'customer', createdAt: serverTimestamp() })
  }
}

export function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleGoogleSignIn() {
    setSubmitting(true)
    setError(null)
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider())
      await ensureCustomerDoc(credential.user.uid, credential.user.displayName ?? '')
      navigate('/my-orders', { replace: true })
    } catch {
      setError('Could not sign in with Google.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        await ensureCustomerDoc(credential.user.uid, name)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/my-orders', { replace: true })
    } catch {
      setError(mode === 'signup' ? 'Could not create account.' : 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[75svh] items-center justify-center bg-secondary/40 p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Pet World"
            className="size-16 rounded-full object-cover shadow"
          />
          <h1 className="mt-4 text-xl font-semibold">
            {mode === 'signin' ? 'Welcome back' : 'Join Pet World'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Faster checkout, saved details, and easy order tracking.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full gap-2 border-border bg-background"
          disabled={submitting}
          onClick={handleGoogleSignIn}
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or continue with email
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>

          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground underline"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          Your information is safe with us
        </p>
      </div>
    </div>
  )
}
