import { z } from "zod";

/** All amounts are integer minor units: LKR 3,490 is 349000. */
export const DEMO_DELIVERY_MINOR = 50_000;
export const MAX_LINE_QUANTITY = 10;
export const MAX_CART_LINES = 30;

const cartLineSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  size: z.string().trim().min(1).max(40),
  color: z.string().trim().min(1).max(60),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
}).strict();

export const checkoutSchema = z.object({
  mode: z.literal("demo").optional(),
  items: z.array(cartLineSchema).min(1).max(MAX_CART_LINES),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(25).regex(/^[+\d\s()-]+$/),
    address: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().max(12).optional(),
  }).strict().optional(),
}).strict();

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  status: string;
  isDemo: boolean;
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  image: string;
};

export type PreviewItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
};

export class CommerceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "CommerceError";
  }
}

/** Pure server calculation. No client amount, stock, or title is accepted. */
export function calculateDemoCheckout(input: unknown, catalog: readonly CheckoutProduct[]) {
  const parsed = checkoutSchema.parse(input);
  const products = new Map(catalog.map((product) => [product.id, product]));
  const merged = new Map<string, CheckoutInput["items"][number]>();

  for (const line of parsed.items) {
    const key = JSON.stringify([line.productId, line.size, line.color]);
    const existing = merged.get(key);
    const quantity = (existing?.quantity ?? 0) + line.quantity;
    if (quantity > MAX_LINE_QUANTITY) {
      throw new CommerceError("quantity_limit", "Choose at most 10 of each size and color.");
    }
    merged.set(key, { ...line, quantity });
  }

  const totalsByProduct = new Map<string, number>();
  const items: PreviewItem[] = [];
  for (const line of merged.values()) {
    const product = products.get(line.productId);
    if (!product || product.status !== "published") {
      throw new CommerceError("unavailable_product", "An item is no longer available. Please refresh your bag.");
    }
    if (!product.isDemo) {
      throw new CommerceError("live_product_disabled", "Live products cannot be checked out in this preview.");
    }
    if (!product.sizes.includes(line.size) || !product.colors.some((color) => color.name === line.color)) {
      throw new CommerceError("invalid_variant", `Choose an available size and color for ${product.name}.`);
    }
    const quantity = (totalsByProduct.get(product.id) ?? 0) + line.quantity;
    // Preview inventory is shared across this product's demo variants.
    if (!Number.isInteger(product.stock) || quantity > product.stock) {
      throw new CommerceError("out_of_stock", `The requested quantity of ${product.name} is unavailable.`);
    }
    totalsByProduct.set(product.id, quantity);
    if (!Number.isSafeInteger(product.price) || product.price < 0) {
      throw new CommerceError("invalid_catalog_price", "This item needs a price update. Please try again later.");
    }
    const lineTotal = product.price * line.quantity;
    if (!Number.isSafeInteger(lineTotal)) {
      throw new CommerceError("amount_limit", "The bag total exceeds the supported amount.");
    }
    items.push({ productId: product.id, slug: product.slug, name: product.name,
      size: line.size, color: line.color, quantity: line.quantity,
      unitPrice: product.price, lineTotal, image: product.image });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + DEMO_DELIVERY_MINOR;
  if (!Number.isSafeInteger(total)) throw new CommerceError("amount_limit", "The bag total exceeds the supported amount.");
  return { currency: "LKR" as const, items, subtotal, delivery: DEMO_DELIVERY_MINOR, total,
    deliveryIsDemo: true as const };
}
