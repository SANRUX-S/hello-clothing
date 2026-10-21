import {useId} from 'react';
import type {FigureLook, HelloLook} from '@/data/helloLooks';

/** Local, independent garment layers remain usable if a demo photograph fails. */
export default function DemoFigures({look}:{look:HelloLook}) {
  const id=useId().replaceAll(':','');
  function figure(outfit:FigureLook, female:boolean) {
    const uid=`${id}-${female?'f':'m'}`;
    const long=['hoodie','mono','layers','signature'].includes(outfit.style);
    return <g transform={`translate(${female?277:95} 35) scale(${female?'.92':'1'})`}>
      <defs><linearGradient id={`${uid}-top`} x1="0" x2="1"><stop stopColor={outfit.top}/><stop offset=".42" stopColor={outfit.top}/><stop offset=".7" stopColor={outfit.accent} stopOpacity=".25"/><stop offset="1" stopColor={outfit.top}/></linearGradient><linearGradient id={`${uid}-skin`} x2="1" y2=".2"><stop stopColor="#9d765e"/><stop offset=".5" stopColor="#c69f80"/><stop offset="1" stopColor="#775642"/></linearGradient></defs>
      <ellipse cx="61" cy="511" rx="75" ry="10" fill="#000" opacity=".2"/>
      <path d="M24 280 103 281 115 472 76 477 60 354 47 477 8 474Z" fill={outfit.pants}/>
      <path d="m30 301-5 157m37-130 29 134m-44-94 8-43m20 94 13 25" stroke={outfit.accent} opacity=".18" fill="none" strokeWidth="3"/>
      <path d="m10 471 35 1 8 22-8 11-57-2 3-12Z m67 3 37-3 26 21-2 11-57 2Z" fill="#242625"/>
      <path d="M-10 503h54m38 1h54" stroke="#d2cfc2" strokeWidth="5"/>
      {female&&<path d="M23 35Q64-15 100 38L109 151 18 150Z" fill="#282522"/>}
      <path d="M45 73h32v42H45Z" fill={`url(#${uid}-skin)`}/>
      <ellipse cx="61" cy="51" rx="30" ry="39" fill={`url(#${uid}-skin)`}/>
      <path d={female?'M30 54Q25 0 70 12q41 5 23 56L80 31 43 36Z':'M29 47 22 24 32 8 49 10 56 0 76 6 92 19 94 41 75 28 52 34Z'} fill="#272622"/>
      <path d="M32 46h25l4 5 5-5h24l-3 14-20 1-7-8-7 8-18-2Z" fill="#171a19"/><path d="m58 63 5 4-5 3m-5 10h15" stroke="#76553f" fill="none"/>
      <path d="M15 126-9 137-13 249-3 301 11 299 11 242 30 168m79-42 24 11 13 110-9 54-14-2-1-58-21-73" fill={`url(#${uid}-skin)`}/>
      {outfit.style==='hoodie'&&<path d="M32 101Q17 69 36 64l24 26 28-25q24 13 3 40L61 122Z" fill={outfit.top} stroke={outfit.accent} strokeOpacity=".3" strokeWidth="3"/>}
      <path d={long?'M42 99 11 110-30 149-16 258 9 256 24 191 18 290q43 12 86 0l-3-99 18 66 27-1-14-114-33-33-20-10q-18 18-37 0Z':'M42 99 12 109-22 153-10 203 20 192 21 286q42 12 83 0l-3-94 25 11 16-52-35-41-28-11q-18 18-37 0Z'} fill={`url(#${uid}-top)`} stroke="#000" strokeOpacity=".15" strokeWidth="2"/>
      <path d="m29 159 5 95m61-87-6 93m-44 15 27-5m-50-41 9 10m66-17-9 12" stroke={outfit.accent} strokeOpacity=".15" fill="none" strokeWidth="2"/>
      {outfit.style==='hoodie'&&<><path d="m48 115-2 51m29-53 3 49M39 224h46l8 39H31Z" stroke={outfit.accent} strokeOpacity=".4" fill="none" strokeWidth="2"/></>}
      {outfit.style==='layers'&&<><path d="M44 105 60 127 78 106l-7 181H53Z" fill={outfit.accent}/><path d="m44 105-8 38 17-9m25-28 11 37-18-9M31 168h18v25H31m44-25h18v25H75" stroke={outfit.accent} fill="none" strokeOpacity=".45"/></>}
      {outfit.style==='mono'&&<path d="M62 113v174m-28-12h55" stroke={outfit.accent} strokeWidth="2" strokeOpacity=".6"/>}
      {outfit.style==='cargo'&&<g stroke={outfit.accent} strokeOpacity=".4" fill={outfit.pants}><path d="M14 341h32v48H12ZM80 338h31v49H81Z"/><path d="M14 351h31m37-3h28"/></g>}
      {outfit.style==='denim'&&<path d="M30 292 27 465m65-174 13 172M32 302h20m21 0h20" stroke={outfit.accent} strokeOpacity=".45" strokeWidth="2" fill="none"/>}
      {!['layers','mono'].includes(outfit.style)&&<image href="/branding/hello-light.webp" x={outfit.style==='graphic'||outfit.style==='signature'?29:67} y={outfit.style==='graphic'||outfit.style==='signature'?157:132} width={outfit.style==='graphic'||outfit.style==='signature'?64:23} height="28" style={{filter:['graphic','signature'].includes(outfit.style)&&outfit.top.startsWith('#d')?'invert(1)':undefined}}/>}
      {outfit.style==='graphic'&&<path d="m39 194 10 15 16-10 18 14m-41-64 15-9 18 6" stroke={outfit.accent} opacity=".5" fill="none" strokeWidth="3"/>}
    </g>;
  }
  return <svg className="demo-figures" viewBox="0 0 520 590" role="img" aria-label={`Illustrated garment fallback: two models in ${look.name}`}><defs><linearGradient id={`${id}-bg`} x2=".8" y2="1"><stop stopColor="#a6a093"/><stop offset="1" stopColor="#4b4c45"/></linearGradient></defs><path fill={`url(#${id}-bg)`} d="M0 0h520v590H0z"/><path d="m0 460 520-90v220H0Z" fill="#c9c3b3" opacity=".13"/>{figure(look.maleLook,false)}{figure(look.femaleLook,true)}</svg>;
}
