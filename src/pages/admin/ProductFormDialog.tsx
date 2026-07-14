import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createProduct, updateProduct, type Product } from '@/services/products'
import { uploadProductImage } from '@/services/storage'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

const emptyForm = {
  name: '',
  brand: '',
  price: '',
  category: '',
  stock: '',
  description: '',
  inStock: false,
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name,
          brand: product.brand,
          price: String(product.price),
          category: product.category,
          stock: String(product.stock),
          description: product.description,
          inStock: product.inStock,
        }
      : emptyForm,
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const input = {
        name: form.name,
        brand: form.brand,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        description: form.description,
        inStock: form.inStock,
        imageUrl: product?.imageUrl ?? '',
      }

      const id = product ? product.id : await createProduct(input)
      const imageUrl = imageFile ? await uploadProductImage(id, imageFile) : input.imageUrl

      if (product || imageFile) {
        await updateProduct(id, { ...input, imageUrl })
      }

      toast.success(product ? 'Product updated' : 'Product created')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="price">Price (LKR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="inStock"
              checked={form.inStock}
              onCheckedChange={(checked) => setForm({ ...form, inStock: checked })}
            />
            <Label htmlFor="inStock">Published (visible on storefront)</Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
