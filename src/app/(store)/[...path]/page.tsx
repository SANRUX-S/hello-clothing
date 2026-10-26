import { notFound, redirect } from 'next/navigation';
import InfoPage from '@/components/pages/InfoPage';

const allowed = [
  'about',
  'collections',
  'contact',
  'faq',
  'size-guide',
  'policies/shipping',
  'policies/returns',
  'policies/privacy',
  'shipping',
  'shipping-policy',
  'delivery',
  'returns',
  'terms',
  'account',
  'account/orders',
  'track-order',
  'order-tracking',
  'categories',
];

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return {
    title: path.at(-1)?.replaceAll('-', ' ').replace(/^./, (c) => c.toUpperCase()) ?? 'Hello!',
  };
}

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const kind = path.join('/');

  if (kind === 'shipping' || kind === 'shipping-policy' || kind === 'delivery') redirect('/policies/shipping');
  if (kind === 'returns' || kind === 'policies/returns') redirect('/refund-policy');
  if (kind === 'policies/privacy') redirect('/privacy-policy');
  if (kind === 'terms') redirect('/terms-and-conditions');
  if (kind === 'categories') redirect('/collections');
  if (kind === 'order-tracking') redirect('/track-order');

  if (!allowed.includes(kind) && !/^account\/orders\/[^/]+$/.test(kind)) notFound();
  return <InfoPage kind={kind} />;
}

