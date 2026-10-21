'use client';
import {useEffect, useRef, useState} from 'react';
import {helloLooks, type HelloLook} from '@/data/helloLooks';
import DemoFigures from './DemoFigures';

type Scene = {look:HelloLook; ready:boolean; failed:boolean};
export default function ModelOutfitShowcase({activeLook, demoMode=true}:{activeLook:HelloLook;demoMode?:boolean}) {
  const [scene,setScene]=useState<Scene>({look:activeLook,ready:false,failed:false});
  const [previous,setPrevious]=useState<HelloLook|null>(null);
  const lastReady=useRef<HelloLook|null>(null);
  useEffect(()=>{
    let cancelled=false;
    let delivered=false;
    const asset=new Image();
    const ready=()=>{
      if(cancelled||delivered)return;
      delivered=true;
      setPrevious(lastReady.current);
      lastReady.current=activeLook;
      setScene({look:activeLook,ready:true,failed:false});
      // Warm the immediate neighbours; every visual is local and replaceable.
      const index=helloLooks.findIndex(look=>look.id===activeLook.id);
      for(const offset of [-1,1]) { const next=new Image();next.src=helloLooks[(index+offset+8)%8].image; }
    };
    asset.onload=ready;
    asset.onerror=()=>{if(!cancelled)setScene({look:activeLook,ready:false,failed:true});};
    asset.src=activeLook.image;
    if(asset.complete&&asset.naturalWidth)queueMicrotask(ready);
    return()=>{cancelled=true;asset.onload=null;asset.onerror=null;};
  },[activeLook]);

  return <div className="outfit-showcase" aria-label="Two-model outfit preview" data-look={scene.look.id} data-requested-look={activeLook.id} data-image-ready={scene.ready}>
    <div className="showcase-frame">
      <div className="showcase-fallback"><DemoFigures look={scene.failed?activeLook:scene.look}/></div>
      {scene.ready&&previous&&<img className="showcase-image showcase-previous" src={previous.image} alt="" aria-hidden="true" width={960} height={1200} style={{objectPosition:previous.imagePosition}}/>}
      {scene.ready&&<img key={scene.look.id} className="showcase-image showcase-current" src={scene.look.image} alt={`Generated styling demo: two adult models wearing ${scene.look.name.toLowerCase()}`} width={960} height={1200} style={{objectPosition:scene.look.imagePosition}}/>}
      <div className="showcase-edge"/>
      <span className="showcase-coordinate" aria-hidden="true">HELLO! STYLING STUDIO / {activeLook.id.replace('look-','')}</span>
    </div>
    {demoMode&&<span className="showcase-disclosure">{scene.failed?'ILLUSTRATED OUTFIT DEMO':'GENERATED OUTFIT DEMO'} <span>·</span> EIGHT RECORDED LOOKS</span>}
  </div>;
}
