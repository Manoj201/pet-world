import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Product } from '@/services/products'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`}>
      <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <CardContent className="px-4 pt-4">
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          <p className="font-medium">{product.name}</p>
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <p className="font-medium">{formatPrice(product.price)}</p>
        </CardFooter>
      </Card>
    </Link>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(price)
}
