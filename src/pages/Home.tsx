import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Banknote,
  Bird,
  Cat,
  Dog,
  Fish,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { subscribeToCatalog, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.jpeg'

const TRUST_POINTS = [
  { icon: Truck, label: 'Fast local delivery' },
  { icon: Banknote, label: 'Cash on delivery available' },
  { icon: MessageCircle, label: 'Order confirmation via WhatsApp' },
  { icon: ShieldCheck, label: 'Quality-checked products' },
]

const INLINE_TRUST = ['Fast delivery', 'Cash on delivery', 'WhatsApp confirmation']

const TILE_STYLES = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-secondary text-secondary-foreground',
]

function iconForCategory(category: string): LucideIcon {
  const lower = category.toLowerCase()
  if (lower.includes('dog')) return Dog
  if (lower.includes('cat')) return Cat
  if (lower.includes('fish') || lower.includes('aqua')) return Fish
  if (lower.includes('bird')) return Bird
  return PawPrint
}

export function Home() {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => subscribeToCatalog(setProducts), [])

  const categories = useMemo(
    () => [...new Set((products ?? []).map((p) => p.category))].filter(Boolean),
    [products],
  )
  const featured = (products ?? []).slice(0, 12)

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#0d1826] px-6 pt-24 pb-32 text-center">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[#5fa8d3]/20 blur-3xl" />

        <div className="relative">
          <img
            src={logo}
            alt="Pet World"
            className="mx-auto size-24 rounded-full object-cover shadow-lg sm:size-28"
          />
          <h1 className="mt-5 text-4xl font-semibold text-balance text-primary-foreground sm:text-6xl">
            Your Pet's Life Partner
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 sm:text-lg">
            Everything your dog, cat, and other companions need — delivered to your door.
          </p>
          <Link
            to="/shop"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-8 bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:scale-105 hover:bg-accent',
            )}
          >
            Shop now
          </Link>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-primary-foreground/70 sm:text-sm">
            {INLINE_TRUST.map((label, i) => (
              <span key={label} className="flex items-center gap-3">
                {i > 0 && <span className="text-primary-foreground/30">•</span>}
                {label}
              </span>
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 -bottom-px h-14 bg-background"
          style={{ clipPath: 'polygon(0 100%, 100% 0%, 100% 100%)' }}
        />
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((category, i) => {
              const Icon = iconForCategory(category)
              return (
                <Link
                  key={category}
                  to={`/shop?category=${encodeURIComponent(category)}`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-4 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md',
                    TILE_STYLES[i % TILE_STYLES.length],
                  )}
                >
                  <Icon className="size-5" />
                  {category}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured products</h2>
            <Link to="/shop" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 text-center sm:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
