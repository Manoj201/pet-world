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
    <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block">
          <div className="aspect-square w-full overflow-hidden bg-muted">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            )}
          </div>
        </Link>
        {product.stock > 0 && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute -bottom-4 right-3 flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md ring-4 ring-card transition-transform hover:scale-110"
            aria-label="Quick add to cart"
          >
            <Plus className="size-4.5" />
          </button>
        )}
      </div>

      <Link to={`/products/${product.id}`} className="block px-3 pt-5">
        <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
        <p className="truncate text-sm font-medium">{product.name}</p>
      </Link>
      <p className="px-3 pt-1 pb-3 text-base font-semibold text-primary">
        {formatPrice(product.price)}
      </p>
    </div>
  )
}
