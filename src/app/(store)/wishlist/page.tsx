import {Suspense} from 'react';
import ShopListing from '@/components/shop/ShopListing';
export const metadata={title:'Your wishlist'};
export default function Page(){return <Suspense fallback={<div className="page-loading">Your favorites…</div>}><ShopListing wishlist/></Suspense>;}
