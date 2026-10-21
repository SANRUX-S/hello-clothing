import type {Metadata,Viewport} from 'next';
import {StoreProvider} from '@/store/store';
import './globals.css';
export const metadata:Metadata={title:{default:'HELLO! — Colombo Streetwear',template:'%s | HELLO!'},description:'Heavyweight streetwear designed in Colombo. Custom oversized fits, 240+ GSM combed cotton tees, and daily staples built for the island.',robots:{index:false,follow:false},icons:{icon:'/brand/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#151715'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><head><link rel="preload" href="/branding/hello-light.webp" as="image"/></head><body><StoreProvider>{children}</StoreProvider></body></html>;}
