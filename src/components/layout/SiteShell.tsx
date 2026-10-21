'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useState,type ReactNode} from 'react';
import {Search,UserRound,ShoppingBag,Menu,ArrowRight,Minus,Plus,Trash2,ArrowUpRight,Heart} from 'lucide-react';
import {products,categories,money,searchProducts} from '@/lib/catalog';
import {lineKey,cartSubtotal} from '@/lib/cart';
import {useStore} from '@/store/store';
import {Modal} from '@/components/ui/Modal';
import AnimatedHelloLogo from '@/components/branding/AnimatedHelloLogo';
import ProfileDrawer from '@/components/layout/ProfileDrawer';
import './site-shell.css';

const primaryLinks = [
  ['NEW ARRIVALS', '/new-arrivals'],
  ['T-SHIRTS', '/collections/t-shirts'],
  ['HOODIES', '/collections/hoodies'],
  ['PANTS', '/collections/pants'],
  ['ACCESSORIES', '/collections/accessories'],
] as const;

export function CartItems({compact=false}:{compact?:boolean}){const store=useStore();return <div className={`cart-items ${compact?'compact':''}`}>{store.cart.map(l=>{const p=store.getProduct(l.productId);if(!p)return null;const key=lineKey(l);return <article key={key} className="cart-item"><Link href={`/products/${p.slug}`} onClick={()=>store.setCartOpen(false)}><img src={p.image || '/demo-products/essential-tee.webp'} alt={p.name} width={100} height={125}/></Link><div className="cart-item-info"><Link href={`/products/${p.slug}`} onClick={()=>store.setCartOpen(false)}><h3>{p.name}</h3></Link><p>{l.color} / {l.size}</p><strong>{money(p.price)}</strong><div className="quantity"><button aria-label={`Decrease ${p.name} quantity`} onClick={()=>l.quantity===1?store.remove(key):store.update(key,l.quantity-1)}><Minus size={12}/></button><span>{l.quantity}</span><button aria-label={`Increase ${p.name} quantity`} disabled={l.quantity>=10} onClick={()=>store.update(key,l.quantity+1)}><Plus size={12}/></button></div></div><button className="icon-button remove-item" aria-label={`Remove ${p.name}`} onClick={()=>store.remove(key)}><Trash2 size={16}/></button></article>;})}</div>;}
function Header() {
 const pathname=usePathname();
 const router=useRouter();
 const store=useStore();
 const [search,setSearch]=useState(false);
 const [menu,setMenu]=useState(false);
 const [accountOpen, setAccountOpen]=useState(false);
 const [query,setQuery]=useState('');
 const count=store.cart.reduce((n,l)=>n+l.quantity,0);
 const suggestions=query.trim()?store.catalog.filter(p=>`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())):store.catalog.slice(0,3);
 return <><header className="site-header editorial-header"><div className="header-inner">
   <nav className="desktop-nav" aria-label="Main navigation">{primaryLinks.map(([label,href])=><Link key={href} className={pathname===href?'active':''} aria-current={pathname===href?'page':undefined} href={href}>{label}</Link>)}</nav>
   <button className="icon-button mobile-menu-button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={menu} onClick={()=>setMenu(true)}><Menu/></button>
   <AnimatedHelloLogo/>
   <div className="header-actions">
     <button className="icon-button" aria-label="Search products" aria-haspopup="dialog" onClick={()=>setSearch(true)}><Search/></button>
     <button className="icon-button account-icon" aria-label="Your account" aria-haspopup="dialog" onClick={()=>setAccountOpen(true)}><UserRound/></button>
     <button className="icon-button bag-button" aria-label={`Open shopping bag, ${count} items`} aria-haspopup="dialog" onClick={()=>store.setCartOpen(true)}><ShoppingBag/><span className="bag-count">{count}</span></button>
   </div>
 </div></header>
 <Modal open={menu} onClose={()=>setMenu(false)} title="Explore Hello!" drawer><nav className="mobile-nav">{[['Shop all','/shop'],['New arrivals','/new-arrivals'],...categories.map(c=>[c.name,`/collections/${c.slug}`]),['Our story','/about'],['Wishlist','/wishlist']].map(([name,href])=><Link key={href} href={href} onClick={()=>setMenu(false)}>{name}<ArrowUpRight size={21}/></Link>)}<button className="mobile-nav-link-btn" onClick={()=>{setMenu(false);setAccountOpen(true);}}>Your account & Track order <ArrowUpRight size={21}/></button></nav><p className="drawer-note">MADE HEAVY. WORN DAILY.</p></Modal>
 <Modal open={search} onClose={()=>setSearch(false)} title="Search the collection"><form className="search-form" onSubmit={e=>{e.preventDefault();setSearch(false);router.push(`/search?q=${encodeURIComponent(query)}`);}}><Search size={20}/><input aria-label="Search the collection" placeholder="Try ‘heavy tee’, ‘hoodie’ or ‘cargo’" autoComplete="off" value={query} onChange={e=>setQuery(e.target.value)}/><button className="icon-button" aria-label="Submit search"><ArrowRight/></button></form><p className="eyebrow search-label">{query?'THE RESULTS':'POPULAR PIECES'}</p><div className="search-suggestions">{suggestions.length?suggestions.map(p=><Link key={p.id} href={`/products/${p.slug}`} onClick={()=>setSearch(false)}><img src={p.image} alt="" width={70} height={80}/><span>{p.name}<small>{money(p.price)}</small></span><ArrowUpRight size={18}/></Link>):<p>No matching pieces found. Try a different search.</p>}</div></Modal>
 <Modal open={store.cartOpen} onClose={()=>store.setCartOpen(false)} title={`Your bag (${count})`} drawer>{count?<><CartItems compact/><div className="drawer-bottom"><div className="summary-line"><span>Subtotal</span><strong>{money(cartSubtotal(store.cart, store.catalog))}</strong></div><p className="muted small">Shipping calculated in the demo checkout.</p><Link className="button dark" href="/checkout" onClick={()=>store.setCartOpen(false)}>CHECKOUT <ArrowRight size={17}/></Link><Link className="text-link view-bag" href="/cart" onClick={()=>store.setCartOpen(false)}>VIEW YOUR BAG</Link></div></>:<div className="empty-state"><ShoppingBag size={42} strokeWidth={1}/><h3>Your bag is empty.</h3><p>Time to add some heavyweight streetwear to your rotation.</p><Link className="button dark" href="/shop" onClick={()=>store.setCartOpen(false)}>SHOP THE COLLECTION <ArrowRight size={17}/></Link></div>}</Modal>
 <ProfileDrawer open={accountOpen} onClose={()=>setAccountOpen(false)} /></>;
}
export function Footer() {
 return <footer className="site-footer editorial-footer" role="contentinfo">
   <div className="footer-top">
     <div className="footer-brand">
       <Link href="/" aria-label="Hello! home"><img className="hello-footer-logo" src="/branding/hello-light.webp" width={2378} height={964} alt="Hello!"/></Link>
       <p>Heavyweight streetwear designed in Colombo.<br/>Cut boxy. Built to last.</p>
       <span className="footer-location">HELLO! CLOTHING / SRI LANKA</span>
     </div>
     <nav className="footer-column" aria-label="Shop links">
       <h3>SHOP</h3>
       <Link href="/new-arrivals">New arrivals</Link>
       <Link href="/collections/t-shirts">T-shirts</Link>
       <Link href="/collections/hoodies">Hoodies</Link>
       <Link href="/collections/pants">Pants</Link>
       <Link href="/collections/accessories">Accessories</Link>
       <Link href="/shop">All products</Link>
     </nav>
     <nav className="footer-column" aria-label="Help and legal links">
       <h3>HELP & LEGAL</h3>
       <Link href="/track-order">Track your order</Link>
       <Link href="/refund-policy">Refund Policy</Link>
       <Link href="/privacy-policy">Privacy Policy</Link>
       <Link href="/terms-and-conditions">Terms & Conditions</Link>
       <Link href="/policies/returns">Returns & exchanges</Link>
       <Link href="/policies/shipping">Shipping information</Link>
       <Link href="/size-guide">Size guide</Link>
       <Link href="/faq">FAQs</Link>
       <Link href="/contact">Contact us</Link>
     </nav>
     <nav className="footer-column" aria-label="About and account links">
       <h3>THE HELLO! WORLD</h3>
       <Link href="/about">Our story</Link>
       <Link href="/collections">The collections</Link>
       <Link href="/wishlist">Your wishlist <Heart size={12}/></Link>
       <Link href="/account">Your account</Link>
       <Link className="footer-contact-link" href="/contact">LET’S TALK <ArrowUpRight size={16}/></Link>
     </nav>
   </div>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} HELLO! CLOTHING. All rights reserved.</span><div><Link href="/refund-policy">Refund Policy</Link><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms-and-conditions">Terms & Conditions</Link><Link href="/admin">Demo studio <ArrowUpRight size={12}/></Link></div></div>
   <div className="preview-note"><span className="status-dot"/> STORE PREVIEW <span>Sample products and prices. No real orders or payments.</span></div>
 </footer>;
}
export default function SiteShell({children}:{children:ReactNode}) {
 const pathname=usePathname();
 return <><div id="site-content"><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main>{pathname!=='/'&&<Footer/>}</div></>;
}
