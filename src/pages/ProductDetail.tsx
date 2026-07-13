import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getProduct, type Product } from '@/services/products'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>()
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (!id) return
    getProduct(id).then(setProduct)
  }, [id])

  if (product === undefined) {
    return (
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 p-6 sm:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (product === null) {
    return <p className="p-8 text-center text-muted-foreground">Product not found.</p>
  }

  function handleAddToCart() {
    if (!product) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
    toast.success('Added to cart')
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 p-6 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{product.brand}</p>
        <h1 className="text-2xl font-medium">{product.name}</h1>
        <p className="mt-2 text-xl font-medium">{formatPrice(product.price)}</p>
        <p className="mt-4 whitespace-pre-line text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        <Button className="mt-4 w-full" disabled={product.stock <= 0} onClick={handleAddToCart}>
          Add to cart
        </Button>
      </div>
    </div>
  )
}
