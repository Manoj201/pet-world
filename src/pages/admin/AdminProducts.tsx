import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteProduct,
  subscribeToAllProducts,
  updateProduct,
  type Product,
} from '@/services/products'
import { ProductFormDialog } from '@/pages/admin/ProductFormDialog'
import { formatPrice } from '@/lib/format'

const LOW_STOCK_THRESHOLD = 5

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)
  const [editing, setEditing] = useState<Product | null>(null)

  useEffect(() => subscribeToAllProducts(setProducts), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q),
    )
  }, [products, search])

  function openCreate() {
    setEditing(null)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  async function togglePublished(product: Product, inStock: boolean) {
    try {
      await updateProduct(product.id, { inStock })
    } catch {
      toast.error('Failed to update product')
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(product.id)
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium">Products</h1>
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, brand, category"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreate}>Add product</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Published</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="size-10 overflow-hidden rounded bg-muted">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{formatPrice(product.price)}</TableCell>
              <TableCell>
                <span
                  className={
                    product.stock <= LOW_STOCK_THRESHOLD
                      ? 'flex items-center gap-1 font-medium text-destructive'
                      : undefined
                  }
                >
                  {product.stock <= LOW_STOCK_THRESHOLD && <TriangleAlert className="size-3.5" />}
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <Switch
                  checked={product.inStock}
                  onCheckedChange={(checked) => togglePublished(product, checked)}
                />
              </TableCell>
              <TableCell className="space-x-2 text-right">
                <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          {products.length === 0
            ? 'No products yet. Click "Add product" to create one.'
            : 'No products match your search.'}
        </p>
      )}

      <ProductFormDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
      />
    </div>
  )
}
