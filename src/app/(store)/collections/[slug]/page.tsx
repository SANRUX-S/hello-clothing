import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { categories } from '@/lib/catalog';
import { getProductsFromDb } from '@/lib/server/db';
import ShopListing from '@/components/shop/ShopListing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: categories.find(c => c.slug === slug)?.name ?? 'Collection' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!categories.some(c => c.slug === slug)) notFound();
  const products = await getProductsFromDb();
  return (
    <Suspense fallback={<div className="page-loading">Finding your fit…</div>}>
      <ShopListing category={slug} initialProducts={products} />
    </Suspense>
  );
}
