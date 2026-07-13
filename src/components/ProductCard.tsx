import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import type { Product } from '@/services/products'
import { formatPrice } from '@/lib/format'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)

  function handleQuickAdd(event: MouseEvent) {
    event.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }

  return (
    <div className="group rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <p className="mt-3 truncate text-xs text-muted-foreground">{product.brand}</p>
        <p className="truncate text-sm font-medium">{product.name}</p>
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-base font-semibold text-primary">{formatPrice(product.price)}</p>
        {product.stock > 0 && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Quick add to cart"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
