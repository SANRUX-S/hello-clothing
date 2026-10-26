import {OrderConfirmation} from '@/components/checkout/Checkout';
export const metadata = {
  title: 'Order Confirmation — HELLO! Official Store',
  description: 'View and print your official HELLO! Clothing dispatch receipt and live courier tracking reference.'
};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <OrderConfirmation reference={id}/>;}
