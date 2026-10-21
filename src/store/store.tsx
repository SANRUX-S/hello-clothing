'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {products} from '@/lib/catalog';
import {normalizeCart,lineKey,type CartLine} from '@/lib/cart';

type Store = {cart:CartLine[]; wishlist:string[]; add:(line:CartLine)=>boolean; update:(key:string,quantity:number)=>void; remove:(key:string)=>void; clear:()=>void; toggleWish:(id:string)=>void; toast:(message:string)=>void; cartOpen:boolean; setCartOpen:(v:boolean)=>void; ready:boolean};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}) {
  const [cart,setCart]=useState<CartLine[]>([]); const [wishlist,setWishlist]=useState<string[]>([]);
  const [ready,setReady]=useState(false); const [cartOpen,setCartOpen]=useState(false); const [message,setMessage]=useState(''); const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    try { const c=JSON.parse(localStorage.getItem('hello-cart-v1')??'[]'); const w=JSON.parse(localStorage.getItem('hello-wishlist-v1')??'[]');
      // The initial browser snapshot is read after hydration to keep server output stable.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate the validated external browser store once after SSR.
      setCart(normalizeCart(c)); setWishlist(Array.isArray(w)?w.filter((id:unknown)=>typeof id==='string'&&products.some(p=>p.id===id)):[]);
    } catch { /* Invalid browser data is safely replaced with an empty cart. */ }
    setReady(true);
  },[]);
  useEffect(()=>{if(ready){try{localStorage.setItem('hello-cart-v1',JSON.stringify(cart));localStorage.setItem('hello-wishlist-v1',JSON.stringify(wishlist));}catch{/* Browsing still works with storage disabled. */}}},[cart,wishlist,ready]);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function toast(text:string){setMessage(text);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setMessage(''),3200);}
  function add(line:CartLine){const candidate=normalizeCart([...cart,line]);const before=cart.reduce((n,l)=>n+l.quantity,0);const after=candidate.reduce((n,l)=>n+l.quantity,0);if(after<=before){toast('You’ve reached the available quantity.');return false;}setCart(candidate);toast('Added to your bag. Good choice.');return true;}
  function update(key:string,quantity:number){setCart(old=>normalizeCart(old.map(l=>lineKey(l)===key?{...l,quantity}:l)));}
  function remove(key:string){setCart(old=>old.filter(l=>lineKey(l)!==key));}
  function toggleWish(id:string){setWishlist(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
  return <Context.Provider value={{cart,wishlist,add,update,remove,clear:()=>setCart([]),toggleWish,toast,cartOpen,setCartOpen,ready}}>{children}<div role="status" aria-live="polite" className={`toast ${message?'show':''}`}>{message}</div></Context.Provider>;
}
export function useStore(){const value=useContext(Context);if(!value)throw new Error('StoreProvider is required');return value;}
