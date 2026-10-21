import {notFound} from 'next/navigation';
import InfoPage from '@/components/pages/InfoPage';
const allowed=['about','collections','contact','faq','size-guide','policies/shipping','policies/returns','policies/privacy','terms','account','account/orders','track-order'];
export async function generateMetadata({params}:{params:Promise<{path:string[]}>}){const {path}=await params;return {title:path.at(-1)?.replaceAll('-',' ').replace(/^./,c=>c.toUpperCase())??'Hello!'};}
export default async function Page({params}:{params:Promise<{path:string[]}>}){const {path}=await params;const kind=path.join('/');if(!allowed.includes(kind)&&!/^account\/orders\/[^/]+$/.test(kind))notFound();return <InfoPage kind={kind}/>;}
