export function formatPrice(price: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(price)
}
