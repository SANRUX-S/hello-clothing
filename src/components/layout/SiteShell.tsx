'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useState,type ReactNode} from 'react';
import {Search,UserRound,ShoppingBag,Menu,ArrowRight,Minus,Plus,Trash2,ArrowUpRight,Heart,Lock} from 'lucide-react';
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
 <Modal open={store.cartOpen} onClose={()=>store.setCartOpen(false)} title={`Your bag (${count})`} drawer>{count?<><CartItems compact/><div className="drawer-bottom"><div className="summary-line"><span>Subtotal</span><strong>{money(cartSubtotal(store.cart, store.catalog))}</strong></div><p className="muted small">Standard islandwide delivery: LKR 500 (Free over LKR 10,000).</p><Link className="button dark" href="/checkout" onClick={()=>store.setCartOpen(false)}>CHECKOUT <ArrowRight size={17}/></Link><Link className="text-link view-bag" href="/cart" onClick={()=>store.setCartOpen(false)}>VIEW YOUR BAG</Link></div></>:<div className="empty-state"><ShoppingBag size={42} strokeWidth={1}/><h3>Your bag is empty.</h3><p>Time to add some heavyweight streetwear to your rotation.</p><Link className="button dark" href="/shop" onClick={()=>store.setCartOpen(false)}>SHOP THE COLLECTION <ArrowRight size={17}/></Link></div>}</Modal>
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
   <div className="footer-bottom">
     <span>© {new Date().getFullYear()} HELLO! CLOTHING. All rights reserved.</span>
     <div className="footer-bottom-actions">
       <a
         href="https://www.penetix.com/"
         target="_blank"
         rel="noopener noreferrer"
         className="penetix-credit"
         title="Designed & Developed by Penetix Cybersecurity Solutions"
       >
         Made by <span className="penetix-brand">Penetix Cybersecurity Solutions</span>
       </a>
     </div>
   </div>
   <div className="preview-note"><span className="status-dot" style={{ background: '#22c55e' }}/> HELLO! OFFICIAL STORE <span>Heavyweight Streetwear · Islandwide Delivery across Sri Lanka</span></div>
 </footer>;
}

export default function SiteShell({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const isAdminOrCheckout = pathname?.startsWith('/admin') || pathname?.startsWith('/checkout');

  return (
    <>
      <div id="site-content">
        <a className="skip-link" href="#main">Skip to content</a>
        <Header/>
        <main id="main">{children}</main>
        {pathname!=='/'&&<Footer/>}
        {!isAdminOrCheckout && (
          <a
            href="https://wa.me/94786191260?text=Hi%20HELLO!%20Clothing%2C%20I%20have%20a%20question%20about%20your%20hoodies%20and%20sizing%20%F0%9F%96%A4"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with HELLO! Colombo on WhatsApp"
            style={{
              position: 'fixed',
              bottom: '22px',
              right: '22px',
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '9999px',
              background: '#25D366',
              color: '#000000',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.5px',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.232-.039.363.275.145.347.494 1.201.537 1.289.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.18-.077.355.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.087.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.988-1.309C8.441 21.539 10.165 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
            <span>WhatsApp Us</span>
          </a>
        )}
      </div>
    </>
  );
}
