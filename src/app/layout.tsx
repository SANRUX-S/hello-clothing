import type {Metadata,Viewport} from 'next';
import {StoreProvider} from '@/store/store';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://www.helloclothing.store'),
  title: {
    default: 'HELLO! — Colombo Heavyweight Streetwear',
    template: '%s | HELLO!'
  },
  description: 'Heavyweight streetwear designed in Colombo. Custom oversized fits, 380 GSM brushed fleece hoodies, and daily staples built for the island.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'HELLO! — Colombo Heavyweight Streetwear',
    description: 'Heavyweight streetwear designed in Colombo. Islandwide courier delivery across Sri Lanka.',
    url: 'https://www.helloclothing.store',
    siteName: 'HELLO! Clothing Colombo',
    images: [
      {
        url: '/hero/campaign.webp',
        width: 1200,
        height: 630,
        alt: 'HELLO! Heavyweight Streetwear Colombo',
      },
    ],
    locale: 'en_LK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HELLO! — Colombo Heavyweight Streetwear',
    description: 'Heavyweight streetwear designed in Colombo. Islandwide courier delivery across Sri Lanka.',
    images: ['/hero/campaign.webp'],
  },
  icons: {
    icon: '/brand/favicon.svg'
  }
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#151715'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><head><link rel="preload" href="/branding/hello-light.webp" as="image"/></head><body><StoreProvider>{children}</StoreProvider></body></html>;}
