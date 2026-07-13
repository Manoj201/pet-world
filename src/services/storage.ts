import {
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageError,
} from 'firebase/storage'
import { storage } from '@/services/firebase'

const RESIZE_POLL_INTERVAL_MS = 1500
const RESIZE_POLL_TIMEOUT_MS = 30000

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName !== file.name) return fromName.toLowerCase()
  return MIME_EXTENSIONS[file.type] ?? 'jpg'
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Uploads the original product image, then polls for the version the
 * "Resize Images" extension produces (default naming: <name>_800x800.<ext>
 * in the same folder) and returns its download URL once available.
 */
export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<string> {
  const ext = extensionFor(file)
  const originalRef = ref(storage, `products/${productId}/original.${ext}`)
  await uploadBytes(originalRef, file, { contentType: file.type })

  const resizedRef = ref(storage, `products/${productId}/original_800x800.${ext}`)
  const deadline = Date.now() + RESIZE_POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    try {
      return await getDownloadURL(resizedRef)
    } catch (error) {
      if ((error as StorageError).code !== 'storage/object-not-found') throw error
      await sleep(RESIZE_POLL_INTERVAL_MS)
    }
  }

  throw new Error(
    'Resized image did not appear in time. Check the Resize Images extension logs.',
  )
}
