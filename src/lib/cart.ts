import { products, type Product } from './catalog';

export type CartLine = { productId: string; size: string; color: string; quantity: number };

export function lineKey(line: Omit<CartLine, 'quantity'>) {
  return `${line.productId}:${line.size}:${line.color}`;
}

export function normalizeCart(value: unknown, catalog?: Product[]): CartLine[] {
  if (!Array.isArray(value)) return [];
  const list = catalog && catalog.length ? catalog : products;
  const lines = new Map<string, CartLine>();
  for (const item of value.slice(0, 100)) {
    if (!item || typeof item !== 'object') continue;
    const p = list.find((p) => p.id === item.productId && p.status === 'published') || products.find((p) => p.id === item.productId);
    if (!p || (p.sizes.length && !p.sizes.includes(item.size)) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
    const key = lineKey(item);
    const old = lines.get(key);
    const used = Array.from(lines.values()).filter((l) => l.productId === p.id).reduce((n, l) => n + l.quantity, 0);
    const addition = Math.max(0, Math.min(item.quantity, p.stock - used, 10 - (old?.quantity ?? 0)));
    if (addition) lines.set(key, { productId: p.id, size: item.size, color: item.color, quantity: (old?.quantity ?? 0) + addition });
  }
  return Array.from(lines.values());
}

export function cartSubtotal(lines: CartLine[], catalog?: Product[]) {
  const list = catalog && catalog.length ? catalog : products;
  return lines.reduce((sum, l) => sum + (list.find((p) => p.id === l.productId)?.price ?? 0) * l.quantity, 0);
}
