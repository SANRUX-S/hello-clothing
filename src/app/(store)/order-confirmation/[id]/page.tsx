import {OrderConfirmation} from '@/components/checkout/Checkout';
export const metadata={title:'Your order preview'};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <OrderConfirmation reference={id}/>;}
