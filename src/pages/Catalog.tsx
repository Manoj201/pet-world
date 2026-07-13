import { useEffect, useState } from 'react'
import { subscribeToCatalog, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'

export function Catalog() {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => subscribeToCatalog(setProducts), [])

  if (products === null) {
    return <p className="p-8 text-center text-muted-foreground">Loading products…</p>
  }

  if (products.length === 0) {
    return <p className="p-8 text-center text-muted-foreground">No products available yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
