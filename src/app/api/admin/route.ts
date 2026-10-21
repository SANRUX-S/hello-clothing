import { NextResponse } from "next/server";
import { staffOnly } from "@/lib/firebase/server";
import { getProductsFromDb, getOrdersFromDb, getCategoriesFromDb } from "@/lib/server/db";
import { privateHeaders } from "@/lib/server/http";

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await staffOnly();
  if (denied) return denied;
  try {
    const [products, orders, categories] = await Promise.all([
      getProductsFromDb(),
      getOrdersFromDb(),
      getCategoriesFromDb(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStock = products.filter(p => (p.stock || 0) <= 5).length;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        orderCount: orders.length,
        productCount: products.length,
        categoryCount: categories.length,
        totalStock,
        lowStock
      },
      recentOrders: orders.slice(0, 5),
      products,
      categories
    }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Stats error' }, { status: 500, headers: privateHeaders });
  }
}
