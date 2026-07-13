import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'

export type StockAdjustmentReason = 'in-store-sale' | 'restock' | 'adjustment'

interface AdjustStockInput {
  productId: string
  change: number
  reason: StockAdjustmentReason
}

interface AdjustStockResult {
  stock: number
}

const adjustStockManually = httpsCallable<AdjustStockInput, AdjustStockResult>(
  functions,
  'adjustStockManually',
)

export async function adjustStock(input: AdjustStockInput): Promise<number> {
  const response = await adjustStockManually(input)
  return response.data.stock
}
