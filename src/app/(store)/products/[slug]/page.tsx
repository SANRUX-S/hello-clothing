import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlugFromDb, getProductsFromDb } from '@/lib/server/db';
import ProductDetail from '@/components/shop/ProductDetail';

export const revalidate = 60;
export const dynamicParams = true;

const getProduct = cache(async (slug: string) => {
  return await getProductBySlugFromDb(slug);
});

export async function generateStaticParams() {
  try {
    const products = await getProductsFromDb();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  return {
    title: p?.name ? `${p.name} — HELLO!` : 'Product — HELLO!',
    description: p?.description || 'Heavyweight streetwear designed in Colombo.',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  return <ProductDetail product={p} />;
}

