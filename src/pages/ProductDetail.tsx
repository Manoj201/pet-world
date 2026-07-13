import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct, type Product } from '@/services/products'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>()

  useEffect(() => {
    if (!id) return
    getProduct(id).then(setProduct)
  }, [id])

  if (product === undefined) {
    return <p className="p-8 text-center text-muted-foreground">Loading…</p>
  }

  if (product === null) {
    return <p className="p-8 text-center text-muted-foreground">Product not found.</p>
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
        <p className="mt-2 text-xl font-medium">
          {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
            product.price,
          )}
        </p>
        <p className="mt-4 whitespace-pre-line text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  )
}
