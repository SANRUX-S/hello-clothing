import {notFound} from 'next/navigation';
import {getProduct} from '@/lib/catalog';
import ProductDetail from '@/components/shop/ProductDetail';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getProduct(slug);return {title:p?.name??'Product',description:p?.description};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getProduct(slug);if(!p)notFound();return <ProductDetail product={p}/>;}
