import { Button } from '@/components/ui/button'
import { useCartStore, type CartItem as CartItemType } from '@/store/useCartStore'
import { formatPrice } from '@/lib/format'

export function CartItem({ item }: { item: CartItemType }) {
  const setQty = useCartStore((state) => state.setQty)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <div className="flex items-center gap-4 border-b py-4">
      <div className="size-16 shrink-0 overflow-hidden rounded bg-muted">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setQty(item.productId, item.qty - 1)}
        >
          −
        </Button>
        <span className="w-6 text-center">{item.qty}</span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setQty(item.productId, item.qty + 1)}
        >
          +
        </Button>
      </div>

      <p className="w-20 text-right font-medium">{formatPrice(item.price * item.qty)}</p>

      <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
        Remove
      </Button>
    </div>
  )
}
