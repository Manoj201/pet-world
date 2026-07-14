import { initializeApp } from 'firebase/app'
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)

// Inert until VITE_RECAPTCHA_SITE_KEY is set (App Check registered in
// Firebase Console) — no key means no-op, so this is safe to ship ahead of
// that setup. Cloud Functions do NOT yet enforce App Check; that's a
// separate, deliberate follow-up once Console monitoring confirms real
// traffic is being attested correctly (see functions/src/index.ts).
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
if (recaptchaSiteKey) {
  if (import.meta.env.DEV) {
    // Lets local dev pass App Check once enforcement is eventually turned
    // on server-side; register the logged debug token in Firebase Console
    // → App Check → this app → Manage debug tokens.
    // @ts-expect-error -- debug flag read by the App Check SDK, not typed
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
