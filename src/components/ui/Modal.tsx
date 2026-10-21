'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
export function Modal({open,onClose,title,children,drawer=false}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;drawer?:boolean}){
 const ref=useRef<HTMLDivElement>(null);const closeRef=useRef(onClose);
 useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{
  if(!open)return;
  const active=document.activeElement as HTMLElement|null;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const dialog=ref.current;
  const backdrop=dialog?.closest('.modal-backdrop');
  const siblings=Array.from(document.body.children).filter((el):el is HTMLElement=>el instanceof HTMLElement&&el!==backdrop);
  const inertBefore=siblings.map(el=>el.inert);
  siblings.forEach(el=>{el.inert=true;});
  const focusable=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex="0"]')??[]).filter(e=>!e.hasAttribute('disabled'));
  focusable()[0]?.focus();
  function key(e:KeyboardEvent){if(e.key==='Escape')closeRef.current();if(e.key==='Tab'){const f=focusable();if(!f.length)return;if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0]?.focus();}}}
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=previous;siblings.forEach((el,i)=>{el.inert=inertBefore[i];});document.removeEventListener('keydown',key);if(active?.isConnected)active.focus();};
 },[open]);
 if(!open)return null;
  return createPortal(<div className="modal-backdrop" onClick={onClose}><div className={`modal-panel ${drawer?'drawer-panel':''}`} ref={ref} role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><div className="modal-top"><h2>{title}</h2><button className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><X size={22}/></button></div>{children}</div></div>,document.body);
}
