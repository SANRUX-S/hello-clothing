import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { categories } from '@/lib/catalog';
import { getCategoriesFromDb, getProductsFromDb } from '@/lib/server/db';
import ShopListing from '@/components/shop/ShopListing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbCats = await getCategoriesFromDb().catch(() => []);
  const allCats = [...categories, ...dbCats];
  return { title: allCats.find(c => c.slug === slug)?.name ?? 'Collection' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [dbCats, products] = await Promise.all([
    getCategoriesFromDb().catch(() => []),
    getProductsFromDb().catch(() => [])
  ]);
  const allCats = [...categories, ...dbCats];
  if (!allCats.some(c => c.slug === slug)) notFound();
  return (
    <Suspense fallback={<div className="page-loading">Finding your fit…</div>}>
      <ShopListing category={slug} initialProducts={products} />
    </Suspense>
  );
}
