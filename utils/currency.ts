export function parsePrice(value: string): number {
  const normalized = value.replace(/[^\d.,]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse price from "${value}"`);
  }

  return parsed;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}
