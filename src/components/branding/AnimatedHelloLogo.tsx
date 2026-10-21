'use client';

import Link from 'next/link';
import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import './animated-hello-logo.css';

/** Both masks use the uploaded 2378 × 964 canvas, so rest position reconstructs the original exactly. */
export default function AnimatedHelloLogo(){
 const link=useRef<HTMLAnchorElement>(null);const mark=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const target=mark.current;const anchor=link.current;if(!target||!anchor)return;
  let timeline:gsap.core.Timeline|null=null;let lastPlayed=-Infinity;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const reset=()=>{timeline?.kill();timeline=null;gsap.set(target,{clearProps:'transform'});};
  const play=()=>{
   if(motion.matches||document.hidden||performance.now()-lastPlayed<6500)return;
   const settings=(()=>{try{const saved=JSON.parse(localStorage.getItem('hello-demo-settings-v1')??'{}');return saved&&typeof saved==='object'?saved:{};}catch{return {};}})();
   if(settings.logoMotion===false)return;
   lastPlayed=performance.now();reset();
   const mobile=window.matchMedia('(max-width: 600px)').matches;const travel=mobile?17:42;const jump=mobile?12:25;
   timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>gsap.set(target,{clearProps:'transform'})});
   const hop=(x:number,height:number,rotation:number,duration:number)=>{
    timeline!.to(target,{x,y:-height,rotation,scaleX:.94,scaleY:1.06,duration:duration*.48,ease:'power2.out'})
     .to(target,{y:0,rotation:rotation*.15,scaleX:1.12,scaleY:.88,duration:duration*.52,ease:'power2.in'})
     .to(target,{scaleX:1,scaleY:1,duration:.09,ease:'power2.out'});
   };
   hop(travel,jump,-8,.45);hop(-travel*.65,jump*.78,7,.47);hop(travel*.5,jump*.62,-5,.4);hop(-travel*.12,jump*.35,3,.32);hop(0,jump*.2,0,.25);
   timeline.to(target,{x:0,y:0,rotation:0,scaleX:1,scaleY:1,duration:.12,ease:'power2.out'});
  };
  const visibility=()=>{if(document.hidden)reset();};
  const preference=()=>{if(motion.matches)reset();};
  const startTimer=setTimeout(play,450);
  anchor.addEventListener('pointerenter',play);anchor.addEventListener('focus',play);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',preference);
  return()=>{clearTimeout(startTimer);reset();anchor.removeEventListener('pointerenter',play);anchor.removeEventListener('focus',play);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',preference);};
 },[]);
  return (
    <Link
      ref={link}
      className="brand-logo hello-brand-link"
      href="/"
      prefetch={true}
      aria-label="HELLO! — home"
      onClick={() => {
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
    >
      <span className="hello-logo-art" aria-hidden="true">
        <img className="hello-logo-word" src="/branding/hello-word.webp" width={2378} height={964} alt="" fetchPriority="high" />
        <span className="hello-logo-mark" ref={mark}>
          <img src="/branding/hello-mark.webp" width={2378} height={964} alt="" fetchPriority="high" />
        </span>
      </span>
    </Link>
  );
}
