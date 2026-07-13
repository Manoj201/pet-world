import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const [, , uid] = process.argv
if (!uid) {
  console.error('Usage: GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/setAdminClaim.mjs <uid>')
  process.exit(1)
}

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!credentialsPath) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })

await getAuth().setCustomUserClaims(uid, { admin: true })
console.log(`Set { admin: true } claim for ${uid}`)
