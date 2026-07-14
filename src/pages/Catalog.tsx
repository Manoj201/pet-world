import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
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
      <div className="mx-auto max-w-6xl p-6">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            {selectedCategory || 'Shop all products'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all',
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:-translate-y-0.5 hover:shadow-md',
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
                'rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:-translate-y-0.5 hover:shadow-md',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <PackageSearch className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {products.length === 0 ? 'No products available yet.' : 'No products in this category.'}
          </p>
        </div>
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
