import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {categories} from '@/lib/catalog';
import ShopListing from '@/components/shop/ShopListing';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:categories.find(c=>c.slug===slug)?.name??'Collection'};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!categories.some(c=>c.slug===slug))notFound();return <Suspense fallback={<div className="page-loading">Finding your fit…</div>}><ShopListing category={slug}/></Suspense>;}
