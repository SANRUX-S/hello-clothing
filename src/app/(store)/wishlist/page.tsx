import { Suspense } from 'react';
import { getProductsFromDb } from '@/lib/server/db';
import ShopListing from '@/components/shop/ShopListing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your wishlist' };

export default async function Page() {
  const products = await getProductsFromDb();
  return (
    <Suspense fallback={<div className="page-loading">Your favorites…</div>}>
      <ShopListing wishlist initialProducts={products} />
    </Suspense>
  );
}
