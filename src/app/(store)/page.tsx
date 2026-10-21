import { getProductsFromDb } from '@/lib/server/db';
import Home from '@/components/home/Home';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const products = await getProductsFromDb();
  return <Home initialProducts={products} />;
}
