'use client';
import Link from 'next/link';
import {useCallback,useState} from 'react';
import {ArrowRight,ArrowUpRight,ChevronLeft,ChevronRight} from 'lucide-react';
import {helloLooks} from '@/data/helloLooks';
import {useDemoContent} from '@/lib/browser-content';
import OutfitWheel from './OutfitWheel';
import ModelOutfitShowcase from './ModelOutfitShowcase';
import './fit-explorer.css';

export default function StreetwearFitExplorer() {
  const [selectedLookIndex,setSelectedLookIndex]=useState(0);
  const demo=useDemoContent();
  const selectLook=useCallback((index:number)=>setSelectedLookIndex(((index%8)+8)%8),[]);
  const activeLook=helloLooks[selectedLookIndex];
  const headline=demo.heroTitle?demo.heroTitle.replace(/^SAY HELLO!\s*/i,'').slice(0,40):'TO YOUR STYLE.';
  return <section className="fit-explorer" aria-labelledby="fit-heading">
    <div className="fit-atmosphere" aria-hidden="true"/>
    <div className="fit-layout">
      <div className="fit-copy">
        <span className="eyebrow fit-edition">HELLO! / THE EVERYDAY EDIT</span>
        <h1 id="fit-heading"><span className="fit-say">SAY</span><img src="/branding/hello-light.webp" alt="Hello!" width={476} height={193}/><span className="fit-tagline">{headline}</span></h1>
        <p>{demo.heroSubtitle||'Premium streetwear for the bold generation.'}</p>
        <Link href="/shop" className="button light">SHOP NOW <ArrowRight size={17}/></Link>
        <span className="fit-copy-footnote">YOUR STYLE. YOUR RULES.</span>
      </div>
      <div className="fit-control">
        <div className="fit-control-heading"><span className="eyebrow">A DIFFERENT KIND OF ROTATION</span><h2>CHOOSE YOUR FIT.</h2></div>
        <OutfitWheel looks={helloLooks} selectedLookIndex={selectedLookIndex} onSelectLook={selectLook} ariaLabel="Choose one of eight HELLO! outfit looks"/>
        <div className="fit-look-details">
          <div className="fit-look-topline"><span className="eyebrow">LOOK <b>{String(selectedLookIndex+1).padStart(2,'0')}</b> / 08</span><div className="fit-palette" aria-label="Outfit palette">{activeLook.palette.map((color,i)=><span key={`${color}-${i}`} style={{backgroundColor:color}}/>)}</div></div>
          <div className="fit-look-title" aria-live="polite" aria-atomic="true"><h3>{activeLook.name}</h3><p>{activeLook.description}</p></div>
          <div className="fit-look-actions"><Link href={activeLook.categoryHref} className="text-link">EXPLORE THE PIECES <ArrowUpRight size={15}/></Link><div><button aria-label="Previous look" onClick={()=>selectLook(selectedLookIndex-1)}><ChevronLeft size={17}/></button><button aria-label="Next look" onClick={()=>selectLook(selectedLookIndex+1)}><ChevronRight size={17}/></button></div></div>
        </div>
      </div>
      <ModelOutfitShowcase activeLook={activeLook}/>
    </div>
    <div className="fit-bottom"><span>01 — 08 <i/> FIND YOUR EVERYDAY.</span><a href="#new-arrivals">SCROLL TO EXPLORE <ArrowRight size={13}/></a></div>
  </section>;
}
