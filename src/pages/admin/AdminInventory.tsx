import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { subscribeToAllProducts, type Product } from '@/services/products'
import { adjustStock, type StockAdjustmentReason } from '@/services/inventory'
import { cn } from '@/lib/utils'

const REASONS: { value: StockAdjustmentReason; label: string }[] = [
  { value: 'in-store-sale', label: 'In-store sale' },
  { value: 'restock', label: 'Restock' },
  { value: 'adjustment', label: 'Adjustment' },
]

function InventoryRow({ product }: { product: Product }) {
  const [change, setChange] = useState('')
  const [reason, setReason] = useState<StockAdjustmentReason>('in-store-sale')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const value = Number(change)
    if (!value) {
      toast.error('Enter a non-zero amount')
      return
    }
    const signedChange =
      reason === 'in-store-sale'
        ? -Math.abs(value)
        : reason === 'restock'
          ? Math.abs(value)
          : value

    setSubmitting(true)
    try {
      const stock = await adjustStock({ productId: product.id, change: signedChange, reason })
      toast.success(`${product.name} stock is now ${stock}`)
      setChange('')
    } catch {
      toast.error('Failed to adjust stock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
      </TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                reason === r.value ? 'border-primary bg-muted font-medium' : 'border-input',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          className="h-8 w-20"
          value={change}
          onChange={(e) => setChange(e.target.value)}
          placeholder={reason === 'adjustment' ? '± Qty' : 'Qty'}
        />
      </TableCell>
      <TableCell>
        <Button size="sm" disabled={submitting} onClick={handleSubmit}>
          Apply
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => subscribeToAllProducts(setProducts), [])

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-medium">Inventory</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Current stock</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <InventoryRow key={product.id} product={product} />
          ))}
        </TableBody>
      </Table>

      {products.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">No products yet.</p>
      )}
    </div>
  )
}
