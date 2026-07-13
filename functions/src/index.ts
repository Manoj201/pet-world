import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'

initializeApp()

// Storage Security Rules can't read Firestore directly, so admin-only
// Storage access is enforced via an auth custom claim kept in sync here.
export const syncAdminClaim = onDocumentWritten('users/{uid}', async (event) => {
  const after = event.data?.after
  const role = after?.exists ? after.data()?.role : undefined
  await getAuth().setCustomUserClaims(event.params.uid, { admin: role === 'admin' })
})

// Cloud Functions land here as later milestones are implemented:
// onOrderCreate, adjustStockManually, syncInStockFlag, checkOrderConflicts, getOrderStatus
