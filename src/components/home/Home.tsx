'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { products, categories, type Product } from '@/lib/catalog';
import { ProductCard } from '@/components/shop/ProductCard';
import { Footer } from '@/components/layout/SiteShell';
import Hero from '@/components/hero/Hero';
import CommunityReviews from './CommunityReviews';
import Newsletter, { ServiceStrip } from './Newsletter';
import './editorial-home.css';

function ProductRail({ title, eyebrow, items, id }: { title: string; eyebrow: string; items: Product[]; id: string }) {
  const row = useRef<HTMLDivElement>(null);
  function move(direction: number) { if (row.current) row.current.scrollBy({ left: direction * row.current.clientWidth * .8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
  return <section id={id} className="home-product-section" aria-label={title}><div className="editorial-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}<span className="red-rule" /></h2></div><div className="rail-actions"><Link href={id === 'new-arrivals' ? '/new-arrivals' : '/shop'} className="text-link">VIEW ALL <ArrowRight size={15} /></Link><div><button onClick={() => move(-1)} aria-label={`Previous ${title.toLowerCase()}`}><ArrowLeft size={17} /></button><button onClick={() => move(1)} aria-label={`Next ${title.toLowerCase()}`}><ArrowRight size={17} /></button></div></div></div><div className="home-product-rail" ref={row} tabIndex={0} aria-label={`${title} products, scroll horizontally`}>{items.map((product, index) => <ProductCard key={product.id} product={product} index={index} showSwatches />)}</div></section>;
}
const categoryImages: Record<string, string> = { 't-shirts': '/campaign/real/man-white-tee.webp', hoodies: '/campaign/real/woman-white-hoodie.webp' };
export default function Home() {
  return <div className="editorial-home"><Hero />
    <section id="discover" className="editorial-page home-discover" aria-label="Shop by category and new arrivals"><section className="home-categories" aria-labelledby="category-title"><div className="editorial-heading"><div><span className="eyebrow">ESSENTIAL SILHOUETTES</span><h2 id="category-title">SHOP BY CATEGORY.<span className="red-rule" /></h2></div><Link href="/shop" className="text-link">ALL CATEGORIES <ArrowRight size={15} /></Link></div><div className="editorial-category-grid">{[categories[0], categories[2], categories[1], categories[3]].map(category => <Link href={`/collections/${category.slug}`} className={`editorial-category ${category.slug}`} key={category.slug}><img src={categoryImages[category.slug] ?? category.image} alt={`Explore HELLO! ${category.name}`} width={600} height={400} loading="lazy" /><div><h3>{category.name}</h3><span>SHOP NOW <ArrowRight size={14} /></span></div><ArrowUpRight size={20} className="category-link-icon" /></Link>)}</div></section><ProductRail title="NEW ARRIVALS." eyebrow="FRESH OFF THE RACKS" items={products} id="new-arrivals" /></section>
    <section className="editorial-page home-built" aria-label="Built different and best sellers"><div className="built-banner"><img src="/hero/campaign.webp" alt="The HELLO! streetwear point of view" width={1600} height={900} loading="lazy" /><div className="built-shade" /><div className="built-copy"><span className="eyebrow">WHY WE’RE HERE</span><h2>BUILT<br />DIFFERENT.</h2><p>HEAVYWEIGHT COTTON.<br />CUSTOM CUTS. NO COMPROMISE.</p><Link href="/about" className="button outline-light">OUR STORY <ArrowRight size={17} /></Link></div><span className="built-aside">MADE<br />HEAVY.<br />WORN<br />DAILY.</span></div><div className="home-best-sellers"><ProductRail title="MOST WANTED." eyebrow="COMMUNITY FAVORITES · HEAVY ROTATION" items={[products[3], products[0], products[2], products[4], products[5], products[1]]} id="best-sellers" /></div></section>
    <section className="editorial-page home-people" aria-label="Men’s edit, women’s edit and customer reviews"><div className="people-edits"><Link href="/shop?edit=men" className="people-edit"><img src="/campaign/real/man-black-hoodie.webp" alt="Men’s edit, HELLO! black hoodie" width={960} height={1280} loading="lazy" /><div><span className="eyebrow">RELAXED & BOXY</span><h2>MEN’S EDIT.</h2><p>TEES, HEAVY HOODIES & CARGOS.</p><span className="button outline-light">SHOP MEN <ArrowRight size={16} /></span></div></Link><Link href="/shop?edit=women" className="people-edit"><img src="/campaign/real/woman-white-hoodie.webp" alt="Women’s edit, HELLO! white hoodie" width={960} height={1280} loading="lazy" /><div><span className="eyebrow">OVERSIZED DRAPES</span><h2>WOMEN’S EDIT.</h2><p>CLEAN STREETWEAR SILHOUETTES.</p><span className="button outline-light">SHOP WOMEN <ArrowRight size={16} /></span></div></Link></div><CommunityReviews /></section>
    <section className="editorial-page home-final-page" aria-label="Stay in the loop and HELLO! information"><Newsletter /><ServiceStrip /><Footer /></section>
  </div>;
}
