export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    currencyDisplay: 'narrowSymbol',
  }).format(price)
}
