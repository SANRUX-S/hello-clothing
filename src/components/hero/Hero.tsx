'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

const slides = [
  { image: '/hero/couple-campaign.jpg?v=5', alt: 'HELLO! official photoshoot with couple in white hoodie and black tee', edition: 'DROP 01 · COLOMBO', className: 'campaign-wide' },
  { image: '/campaign/real/couple-graphic-tees.webp', alt: 'HELLO! models wearing black and white graphic tees', edition: '240 GSM HEAVYWEIGHT', className: 'campaign-portrait' },
  { image: '/campaign/real/man-black-hoodie.webp', secondImage: '/campaign/real/woman-white-hoodie.webp', alt: 'HELLO! black hoodie worn by a male model', edition: '380 GSM BRUSHED FLEECE', className: 'campaign-pair' },
];
export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (paused || reduced || engaged) return;
    const timer = window.setInterval(() => {
      const bounds = section.current?.getBoundingClientRect();
      if (!document.hidden && bounds && bounds.bottom > 100 && bounds.top < window.innerHeight) setActive(value => (value + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, reduced, engaged, active]);
  function choose(index: number) { setActive((index + slides.length) % slides.length); }
  return <section ref={section} className="editorial-page campaign-hero" aria-label="HELLO! featured campaign" aria-roledescription="carousel" data-slide={active + 1}
    onMouseEnter={() => setEngaged(true)} onMouseLeave={event => setEngaged(event.currentTarget.contains(document.activeElement))}
    onFocusCapture={() => setEngaged(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) setEngaged(false); }}
    onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); choose(active + (event.key === 'ArrowRight' ? 1 : -1)); } }}>
    <div className="campaign-slides">{slides.map((slide, index) => <div key={slide.image} className={`campaign-frame ${slide.className} ${active === index ? 'is-active' : ''}`} aria-hidden={active !== index}>
      <img
        src={slide.image}
        srcSet={index === 0 ? "/hero/couple-campaign.webp?v=5" : undefined}
        sizes={index === 0 ? "100vw" : undefined}
        alt={slide.alt}
        width={index === 0 ? 2560 : 960}
        height={index === 0 ? 1440 : 1280}
        fetchPriority={index === 0 ? 'high' : 'auto'}
        decoding="async"
      />
      {slide.secondImage && <img src={slide.secondImage} alt="HELLO! white hoodie worn by a female model" width={960} height={1280} />}
    </div>)}</div>
    <div className="campaign-shade" />
    <div className="campaign-copy"><span className="eyebrow">DESIGNED IN COLOMBO · READY TO WEAR</span><h1><span>ONE DAY,<br />EVEN THE DEVIL<br />WILL SAY</span><img src="/branding/hello-light.webp" alt="Hello!" width={2378} height={964} /></h1><p>Heavyweight cotton. Custom boxy fits. Built for the street.</p><Link href="/new-arrivals" className="button campaign-cta">SHOP LATEST DROP <ArrowRight size={18} /></Link></div>
    <div className="campaign-bottom"><div className="campaign-pagination" aria-label="Campaign slides">{slides.map((slide, index) => <button key={slide.image} type="button" aria-label={`Go to slide ${index + 1}`} aria-pressed={active === index} onClick={() => choose(index)}>0{index + 1}<span /></button>)}</div><span className="campaign-edition">{slides[active].edition}</span><div className="campaign-controls"><button type="button" aria-label={paused || reduced ? 'Play campaign slideshow' : 'Pause campaign slideshow'} disabled={reduced} onClick={() => setPaused(value => !value)}>{paused || reduced ? <Play size={15} /> : <Pause size={15} />}</button><button type="button" aria-label="Previous campaign slide" onClick={() => choose(active - 1)}><ArrowLeft size={17} /></button><button type="button" aria-label="Next campaign slide" onClick={() => choose(active + 1)}><ArrowRight size={17} /></button></div></div>
    <Link href="#discover" className="campaign-scroll" aria-label="Explore categories and new arrivals"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></Link>
  </section>;
}
