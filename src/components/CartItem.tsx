import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore, type CartItem as CartItemType } from '@/store/useCartStore'
import { formatPrice } from '@/lib/format'

export function CartItem({ item }: { item: CartItemType }) {
  const setQty = useCartStore((state) => state.setQty)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <div className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{item.name}</p>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Remove item"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full border p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              onClick={() => setQty(item.productId, item.qty - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              onClick={() => setQty(item.productId, item.qty + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <p className="font-semibold text-primary">{formatPrice(item.price * item.qty)}</p>
        </div>
      </div>
    </div>
  )
}
