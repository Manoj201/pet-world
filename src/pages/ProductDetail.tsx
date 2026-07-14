import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronRight, MessageCircle, Minus, Plus, ShieldCheck, Truck } from 'lucide-react'
import { getProduct, type Product } from '@/services/products'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const LOW_STOCK_THRESHOLD = 5

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  // Keying by id forces a full remount on navigation between products, so
  // `qty` naturally resets and stale content from the previous product
  // can't flash before the new fetch resolves.
  return <ProductDetailView key={id} id={id} />
}

function ProductDetailView({ id }: { id?: string }) {
  const [product, setProduct] = useState<Product | null>()
  const [qty, setQty] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (!id) return
    getProduct(id).then(setProduct)
  }, [id])

  if (product === undefined) {
    return (
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 p-6 sm:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (product === null) {
    return <p className="p-8 text-center text-muted-foreground">Product not found.</p>
  }

  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD

  function handleAddToCart() {
    if (!product) return
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      qty,
    )
    toast.success(`Added ${qty} to cart`)
    setQty(1)
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border bg-muted shadow-sm">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={cn('h-full w-full object-cover', outOfStock && 'opacity-60 grayscale')}
            />
          )}
        </div>

        <div>
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            {product.category}
          </Link>

          <p className="mt-3 text-sm text-muted-foreground">{product.brand}</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-primary">{formatPrice(product.price)}</p>

          <div className="mt-3">
            {outOfStock ? (
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent-foreground">
                Only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                In stock
              </span>
            )}
          </div>

          <p className="mt-4 whitespace-pre-line text-muted-foreground">{product.description}</p>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-1 rounded-full border p-0.5 w-fit">
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          )}

          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-6 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="size-5 text-primary" />
              <p className="text-xs text-muted-foreground">Fast delivery</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="size-5 text-primary" />
              <p className="text-xs text-muted-foreground">Quality checked</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <MessageCircle className="size-5 text-primary" />
              <p className="text-xs text-muted-foreground">WhatsApp confirm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
