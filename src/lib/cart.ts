import { products } from './catalog';
export type CartLine = {productId:string; size:string; color:string; quantity:number};
export function lineKey(line: Omit<CartLine,'quantity'>) { return `${line.productId}:${line.size}:${line.color}`; }
export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines = new Map<string, CartLine>();
  for (const item of value.slice(0,100)) {
    if (!item || typeof item !== 'object') continue;
    const p=products.find(p=>p.id===item.productId && p.status==='published');
    if (!p || !p.sizes.includes(item.size) || !p.colors.some(c=>c.name===item.color) || !Number.isInteger(item.quantity) || item.quantity<1) continue;
    const key=lineKey(item); const old=lines.get(key);
    const used=Array.from(lines.values()).filter(l=>l.productId===p.id).reduce((n,l)=>n+l.quantity,0);
    const addition=Math.max(0,Math.min(item.quantity,p.stock-used,10-(old?.quantity??0)));
    if (addition) lines.set(key,{productId:p.id,size:item.size,color:item.color,quantity:(old?.quantity??0)+addition});
  }
  return Array.from(lines.values());
}
export function cartSubtotal(lines: CartLine[]) { return lines.reduce((sum,l)=>sum+(products.find(p=>p.id===l.productId)?.price??0)*l.quantity,0); }
