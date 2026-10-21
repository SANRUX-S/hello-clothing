import {Suspense} from 'react';
import ShopListing from '@/components/shop/ShopListing';
export const metadata={title:'New arrivals'};
export default function Page(){return <Suspense fallback={<div className="page-loading">The latest perspective…</div>}><ShopListing newOnly/></Suspense>;}
