import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Banknote,
  Bird,
  Cat,
  Dog,
  Fish,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { subscribeToCatalog, type Product } from '@/services/products'
import { subscribeToApprovedReviews, type Review } from '@/services/reviews'
import { ProductCard } from '@/components/ProductCard'
import { StarRating } from '@/components/StarRating'
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

const STORE_LAT = 6.203655
const STORE_LNG = 80.4754034
const STORE_MAPS_URL = 'https://maps.app.goo.gl/rVH9pwsb8m714XkA6'
const STORE_ADDRESS = 'Pet World, Deniyaya Road, Pitabeddara (Near Pitabeddara Police Station)'
const CONTACT_EMAIL = 'pitabeddarapetworld@gmail.com'
const CONTACT_WHATSAPP_NUMBERS = ['0777839475', '0772369042']

const mapsEmbedKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY
const STORE_EMBED_URL = mapsEmbedKey
  ? `https://www.google.com/maps/embed/v1/place?key=${mapsEmbedKey}&q=${STORE_LAT},${STORE_LNG}&zoom=17`
  : null

function toWhatsAppUrl(localNumber: string) {
  const digits = localNumber.replace(/\D/g, '').replace(/^0/, '')
  return `https://wa.me/94${digits}`
}

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
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => subscribeToCatalog(setProducts), [])
  useEffect(() => subscribeToApprovedReviews(setReviews), [])

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

      <section className="overflow-hidden border-y bg-primary py-5">
        <div className="flex w-max animate-marquee gap-16">
          {[...TRUST_POINTS, ...TRUST_POINTS].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3 whitespace-nowrap">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent">
                <Icon className="size-4 text-accent-foreground" />
              </div>
              <p className="text-sm font-medium text-primary-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">What our customers say</h2>
            <Link to="/reviews" className="text-sm font-medium text-primary hover:underline">
              Leave a review →
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No reviews yet — be the first to share your experience.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <StarRating value={review.rating} size="sm" />
                  <p className="mt-3 text-sm text-muted-foreground">"{review.comment}"</p>
                  <p className="mt-3 text-sm font-medium">{review.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden border-t bg-gradient-to-br from-secondary/70 via-secondary/40 to-muted/50">
        <div className="pointer-events-none absolute -top-16 -left-16 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 size-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <MessageCircle className="size-6" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">Get in touch</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visit us, message us, or drop by — we'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-2xl ring-4 ring-card shadow-lg">
                {STORE_EMBED_URL ? (
                  <iframe
                    title="Pet World store location"
                    src={STORE_EMBED_URL}
                    className="h-72 w-full lg:h-full lg:min-h-80"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-72 w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground lg:h-full lg:min-h-80">
                    <MapPin className="size-8" />
                    <p className="text-sm">Map preview coming soon</p>
                  </div>
                )}
              </div>

              <a
                href={STORE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-4 w-full gap-2 shadow-md sm:w-auto',
                )}
              >
                <MapPin className="size-4" />
                Get directions
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
              <div className="group flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{STORE_ADDRESS}</p>
                </div>
              </div>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15">
                  <Mail className="size-5 text-accent-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="truncate text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>

              {CONTACT_WHATSAPP_NUMBERS.map((number) => (
                <a
                  key={number}
                  href={toWhatsAppUrl(number)}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <MessageCircle className="size-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">{number}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
