import {Suspense} from 'react';
import ShopListing from '@/components/shop/ShopListing';
export const metadata={title:'Search'};
export default function Page(){return <Suspense fallback={<div className="page-loading">Looking for your piece…</div>}><ShopListing search/></Suspense>;}
