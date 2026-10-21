import { Suspense } from 'react';
import { getProductsFromDb } from '@/lib/server/db';
import ShopListing from '@/components/shop/ShopListing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New arrivals' };

export default async function Page() {
  const products = await getProductsFromDb();
  return (
    <Suspense fallback={<div className="page-loading">The latest perspective…</div>}>
      <ShopListing newOnly initialProducts={products} />
    </Suspense>
  );
}
