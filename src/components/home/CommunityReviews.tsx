'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Star, CheckCircle, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import './community.css';

type Review = {
  id?: string;
  image: string;
  alt: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

const initialReviews: Review[] = [
  { image: '/campaign/real/woman-black-tee.webp', alt: 'HELLO! black oversized tee styled outdoors', author: 'Sanduni M.', location: 'Colombo 07', rating: 5, date: '2 days ago', title: 'Collar stays completely flat after multiple washes.', body: 'Finally a local brand doing actual heavyweight cotton. The 240 GSM has structure without feeling hot in Colombo. The drop-shoulder cut is spot on.' },
  { image: '/campaign/real/man-black-hoodie.webp', alt: 'HELLO! black hoodie from brand photo shoot', author: 'Kavindu P.', location: 'Kandy', rating: 5, date: '1 week ago', title: 'Got to Kandy in 48 hours. Proper heavy fleece.', body: 'The hood is double-layered so it stays structured instead of drooping flat. Delivery was super quick with PromptX COD.' },
  { image: '/campaign/real/woman-white-hoodie.webp', alt: 'HELLO! white hoodie styled outdoors', author: 'Dilki R.', location: 'Negombo', rating: 5, date: '2 weeks ago', title: 'Boxy fit without looking sloppy.', body: 'Grabbed the white hoodie for an oversized look. Fleece is soft on the inside and the ribbed cuffs keep the sleeves stacked nicely.' },
  { image: '/campaign/real/man-white-tee.webp', alt: 'HELLO! white tee with olive trousers', author: 'Shenal W.', location: 'Battaramulla', rating: 5, date: '3 weeks ago', title: 'Doesn’t shrink or bacon around the neck.', body: 'Washed this tee three times now—collar ribbing didn’t lose shape at all. Best heavyweight tee I’ve bought in SL so far.' },
  { image: '/campaign/real/couple-graphic-tees.webp', alt: 'Two people wearing HELLO! graphic tees', author: 'Amesh & Tharushi', location: 'Galle', rating: 5, date: '1 month ago', title: 'Screen print quality is top notch.', body: 'Got matching signature graphic tees. Thick screen print that doesn’t crack or peel. WhatsApp support replied to our sizing question in minutes.' },
];

export default function CommunityReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const focusing = useRef(false);
  const inView = useRef(false);
  const manualUntil = useRef(0);
  const [paused, setPaused] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem('hello-custom-reviews');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length) {
            setReviews([...parsed, ...initialReviews]);
          }
        }
      } catch {}
    });
    return () => {
      active = false;
    };
  }, []);

  const move = useCallback((direction: number, automatic = false) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    const maximum = track.scrollWidth - track.clientWidth;
    if (maximum <= 1) return;
    const step = card.getBoundingClientRect().width + gap;
    const endReached = track.scrollLeft >= maximum - 2;
    const startReached = track.scrollLeft <= 2;
    const target = direction > 0 && endReached ? 0 : direction < 0 && startReached ? maximum : Math.min(maximum, Math.max(0, track.scrollLeft + step * direction));
    track.scrollTo({ left: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    if (!automatic) manualUntil.current = Date.now() + 8000;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => { inView.current = entry.isIntersecting; }, { threshold: 0.25 });
    observer.observe(section);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      if (!paused && !motion.matches && !document.hidden && inView.current && !hovering.current && !focusing.current && Date.now() >= manualUntil.current) move(1, true);
    }, 5000);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [move, paused]);

  function handleAddReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const author = String(fd.get('author') || '').trim();
    const location = String(fd.get('location') || '').trim();
    const title = String(fd.get('title') || '').trim();
    const body = String(fd.get('body') || '').trim();

    if (!author || !body) return;

    const newRev: Review = {
      id: String(Date.now()),
      image: '/campaign/real/couple-graphic-tees.webp',
      alt: `${author}'s review photo`,
      author,
      location: location || 'Sri Lanka',
      rating: newRating,
      date: 'Just now',
      title: title || 'Exceptional quality.',
      body
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      const stored = JSON.parse(localStorage.getItem('hello-custom-reviews') || '[]');
      localStorage.setItem('hello-custom-reviews', JSON.stringify([newRev, ...stored]));
    } catch {}

    setSubmittedMessage('Thank you! Your verified review has been published.');
    setTimeout(() => {
      setSubmittedMessage('');
      setModalOpen(false);
    }, 1800);
  }

  return (
    <>
      <section ref={sectionRef} className="hello-community" aria-labelledby="community-title"
        onMouseEnter={() => { hovering.current = true; }} onMouseLeave={() => { hovering.current = false; }}
        onFocusCapture={() => { focusing.current = true; }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) focusing.current = false; }}>
        <div className="hello-community-heading">
          <div>
            <p className="hello-community-kicker">COMMUNITY FEEDBACK</p>
            <h2 id="community-title">Heard on the street.</h2>
            <p className="hello-community-disclosure">Real reviews from people wearing HELLO! daily across Sri Lanka.</p>
          </div>
          <div className="hello-community-controls">
            <button
              type="button"
              className="text-link"
              onClick={() => setModalOpen(true)}
              style={{ fontSize: '0.8rem', marginRight: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> WRITE A REVIEW
            </button>
            <button className="hello-review-autoplay" type="button" aria-label={paused ? 'Resume review slideshow' : 'Pause review slideshow'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15}/> : <Pause size={15}/>}</button>
            <button type="button" aria-label="Previous reviews" aria-controls="hello-review-track" onClick={() => move(-1)}><ArrowLeft size={17}/></button>
            <button type="button" aria-label="Next reviews" aria-controls="hello-review-track" onClick={() => move(1)}><ArrowRight size={17}/></button>
          </div>
        </div>
        <div ref={trackRef} id="hello-review-track" className="hello-review-track" role="region" aria-label="Customer review slideshow" tabIndex={0} onPointerDown={() => { manualUntil.current = Date.now() + 8000; }}>
          {reviews.map((review, idx) => (
            <article className="hello-review-card" key={review.id ?? review.image + idx}>
              <img src={review.image} alt={review.alt} width={480} height={320} loading="lazy"/>
              <div className="hello-review-copy">
                <div className="hello-review-rating">
                  <span className="hello-review-stars" aria-hidden="true">
                    {Array.from({ length: review.rating }).map((_, star) => (
                      <Star key={star} size={11} fill="currentColor" strokeWidth={0}/>
                    ))}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle size={11} /> Verified Buyer
                  </span>
                </div>
                <h3>{review.title}</h3>
                <p>{review.body}</p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{review.author} · {review.location}</span>
                  <span>{review.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Share Your Experience">
        <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {submittedMessage ? (
            <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>
              {submittedMessage}
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setNewRating(num)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      aria-label={`${num} stars`}
                    >
                      <Star size={22} fill={num <= newRating ? 'currentColor' : 'none'} color={num <= newRating ? '#eab308' : 'var(--muted)'} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label>
                  <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px' }}>Your name</span>
                  <input required name="author" placeholder="e.g. Kasun D." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                </label>
                <label>
                  <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px' }}>City / Town</span>
                  <input required name="location" placeholder="e.g. Colombo 03" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                </label>
              </div>

              <label>
                <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px' }}>Headline</span>
                <input required name="title" placeholder="e.g. Loved the fit and fabric quality" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px' }} />
              </label>

              <label>
                <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px' }}>Your review</span>
                <textarea required name="body" rows={4} placeholder="Tell us how the garment fits, feels, and looks..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px' }} />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="button outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="button dark">Submit Review</button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </>
  );
}
