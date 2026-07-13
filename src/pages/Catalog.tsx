import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { subscribeToCatalog, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function Catalog() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''

  useEffect(() => subscribeToCatalog(setProducts), [])

  const categories = useMemo(
    () => [...new Set((products ?? []).map((p) => p.category))].filter(Boolean),
    [products],
  )

  const filtered = useMemo(
    () =>
      selectedCategory
        ? (products ?? []).filter((p) => p.category === selectedCategory)
        : (products ?? []),
    [products, selectedCategory],
  )

  function selectCategory(category: string) {
    if (!category) {
      setSearchParams({})
    } else {
      setSearchParams({ category })
    }
  }

  if (products === null) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3 p-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={cn(
              'rounded-full border px-3 py-1 text-sm',
              !selectedCategory ? 'border-primary bg-primary text-primary-foreground' : '',
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                selectedCategory === category
                  ? 'border-primary bg-primary text-primary-foreground'
                  : '',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          {products.length === 0 ? 'No products available yet.' : 'No products in this category.'}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
