import {Suspense} from 'react';
import ShopListing from '@/components/shop/ShopListing';
export const metadata={title:'Shop the everyday edit'};
export default function Page(){return <Suspense fallback={<div className="page-loading">Finding your everyday…</div>}><ShopListing/></Suspense>;}
