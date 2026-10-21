import { describe, expect, it } from "vitest";
import { calculateDemoCheckout, CheckoutProduct, checkoutSchema } from "../src/lib/server/commerce";

const product: CheckoutProduct = {
  id: "tee", slug: "essential-tee", name: "Essential Tee", price: 349_000,
  status: "published", isDemo: true, colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#ffffff" }],
  sizes: ["S", "M"], stock: 5, image: "/images/essential-tee.webp",
};
const line = { productId: "tee", size: "M", color: "Black", quantity: 1 };
const preview = (items: unknown[], catalog: CheckoutProduct[] = [product]) => calculateDemoCheckout({ items }, catalog);

describe("trusted demo checkout calculation", () => {
  it("calculates exact integer LKR totals with explicitly demo delivery", () => {
    expect(preview([{ ...line, quantity: 2 }])).toMatchObject({ currency: "LKR", subtotal: 698_000, delivery: 50_000, total: 748_000, deliveryIsDemo: true });
  });
  it("rejects injected prices and payment statuses instead of trusting them", () => {
    expect(() => preview([{ ...line, price: 1 }])).toThrow();
    expect(checkoutSchema.safeParse({ items: [line], paymentStatus: "paid" }).success).toBe(false);
  });
  it("rejects fractional, negative, zero, oversized and string quantities", () => {
    for (const quantity of [0, -1, 1.5, 11, "2", NaN]) expect(() => preview([{ ...line, quantity }])).toThrow();
  });
  it("merges duplicate variants and enforces the merged quantity limit", () => {
    expect(preview([line, { ...line, quantity: 2 }]).items).toHaveLength(1);
    expect(preview([line, { ...line, quantity: 2 }]).items[0].quantity).toBe(3);
    expect(() => preview([{ ...line, quantity: 6 }, { ...line, quantity: 6 }], [{ ...product, stock: 100 }])).toThrow("at most 10");
  });
  it("checks stock across different variants of a demo product", () => {
    expect(() => preview([{ ...line, quantity: 3 }, { ...line, size: "S", quantity: 3 }])).toThrow("unavailable");
  });
  it("rejects unknown, unpublished, live, sold-out and nonexistent variants", () => {
    expect(() => preview([{ ...line, productId: "unknown" }])).toThrow("no longer available");
    expect(() => preview([line], [{ ...product, status: "draft" }])).toThrow("no longer available");
    expect(() => preview([line], [{ ...product, isDemo: false }])).toThrow("Live products");
    expect(() => preview([line], [{ ...product, stock: 0 }])).toThrow("unavailable");
    expect(() => preview([{ ...line, size: "XL" }])).toThrow("available size and color");
    expect(() => preview([{ ...line, color: "Blue" }])).toThrow("available size and color");
  });
  it("does not return delivery personal data in a preview", () => {
    const result = calculateDemoCheckout({ items: [line], customer: { name: "Preview shopper", email: "preview@example.test", phone: "0700000000", address: "Example preview address", city: "Preview city" } }, [product]);
    expect(JSON.stringify(result)).not.toContain("example.test");
    expect(result).not.toHaveProperty("customer");
  });
  it("rejects invalid catalog amounts and arithmetic overflow", () => {
    expect(() => preview([line], [{ ...product, price: -1 }])).toThrow("price update");
    expect(() => preview([line], [{ ...product, price: 3490.5 }])).toThrow("price update");
    expect(() => preview([{ ...line, quantity: 2 }], [{ ...product, price: Number.MAX_SAFE_INTEGER }])).toThrow("supported amount");
  });
  it("rejects empty carts and excessive input line counts", () => {
    expect(() => preview([])).toThrow();
    expect(() => preview(Array.from({ length: 31 }, () => line))).toThrow();
  });
});
