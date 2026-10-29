'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Star, CheckCircle, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import './community.css';

export type Review = {
  id: string;
  image?: string;
  author: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  created_at?: string;
};

const initialReviews: Review[] = [
  {
    id: 'rev-01',
    author: 'Sanduni M.',
    location: 'Colombo 07',
    rating: 5,
    title: 'Collar stays completely flat after multiple washes.',
    body: 'Finally a local brand doing actual heavyweight cotton. The 240 GSM has structure without feeling hot in Colombo. The drop-shoulder cut is spot on.',
    image: '/campaign/real/woman-black-tee.webp',
  },
  {
    id: 'rev-02',
    author: 'Kavindu P.',
    location: 'Kandy',
    rating: 5,
    title: 'Got to Kandy in 48 hours. Proper heavy fleece.',
    body: 'The hood is double-layered so it stays structured instead of drooping flat. Delivery was super quick with PromptX COD.',
    image: '/campaign/real/man-black-hoodie.webp',
  },
  {
    id: 'rev-03',
    author: 'Dilki R.',
    location: 'Negombo',
    rating: 5,
    title: 'Boxy fit without looking sloppy.',
    body: 'Grabbed the white hoodie for an oversized look. Fleece is soft on the inside and the ribbed cuffs keep the sleeves stacked nicely.',
    image: '/campaign/real/woman-white-hoodie.webp',
  },
  {
    id: 'rev-04',
    author: 'Shenal W.',
    location: 'Battaramulla',
    rating: 5,
    title: 'Doesn’t shrink or bacon around the neck.',
    body: 'Washed this tee three times now—collar ribbing didn’t lose shape at all. Best heavyweight tee I’ve bought in SL so far.',
    image: '/campaign/real/man-white-tee.webp',
  },
  {
    id: 'rev-05',
    author: 'Amesh & Tharushi',
    location: 'Galle',
    rating: 5,
    title: 'Screen print quality is top notch.',
    body: 'Got matching signature graphic tees. Thick screen print that doesn’t crack or peel. WhatsApp support replied to our sizing question in minutes.',
    image: '/campaign/real/couple-graphic-tees.webp',
  },
];

export default function CommunityReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const manualUntil = useRef(0);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Write Review Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [formData, setFormData] = useState({
    author: '',
    location: '',
    title: '',
    body: '',
  });

  const loadReviews = useCallback(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch(err => console.error('Failed to load reviews from Neon DB:', err));
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const move = useCallback((direction: number) => {
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
    const target = direction > 0 && endReached
      ? 0
      : direction < 0 && startReached
      ? maximum
      : Math.min(maximum, Math.max(0, track.scrollLeft + step * direction));
    track.scrollTo({
      left: target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  }, []);

  // Automatic smooth scroll every 6 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (Date.now() >= manualUntil.current && !document.hidden) {
        move(1);
      }
    }, 6000);
    return () => window.clearInterval(interval);
  }, [move]);

  async function handleAddReview(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: formData.author,
          location: formData.location || 'Colombo',
          rating: newRating,
          title: formData.title,
          body: formData.body,
          image: '/campaign/real/couple-graphic-tees.webp',
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSubmittedMessage('Thank you! Your review has been saved to the database and published.');
        // Add immediately to the beginning of local state
        if (result.review) {
          setReviews(prev => [result.review, ...prev]);
        }
        // Reset form after delay
        setTimeout(() => {
          setSubmittedMessage('');
          setFormData({ author: '', location: '', title: '', body: '' });
          setNewRating(5);
          setModalOpen(false);
          // Scroll to the new review at the very start
          if (trackRef.current) {
            trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }, 1600);
      } else {
        alert(result.error || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      console.error('Review submit error:', err);
      alert('Network error while submitting review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section ref={sectionRef} className="hello-community" aria-labelledby="community-title">
        <div className="hello-community-heading">
          <div>
            <p className="hello-community-kicker">COMMUNITY FEEDBACK</p>
            <h2 id="community-title">Heard on the street.</h2>
            <p className="hello-community-disclosure">Verified reviews from people wearing HELLO! daily across Sri Lanka.</p>
          </div>
          <div className="hello-community-controls">
            <button
              type="button"
              className="hello-write-review-btn"
              onClick={() => setModalOpen(true)}
              aria-label="Write a community review"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>WRITE A REVIEW</span>
            </button>
            <button
              type="button"
              aria-label="Previous reviews"
              aria-controls="hello-review-track"
              onClick={() => {
                manualUntil.current = Date.now() + 8000;
                move(-1);
              }}
            >
              <ArrowLeft size={17}/>
            </button>
            <button
              type="button"
              aria-label="Next reviews"
              aria-controls="hello-review-track"
              onClick={() => {
                manualUntil.current = Date.now() + 8000;
                move(1);
              }}
            >
              <ArrowRight size={17}/>
            </button>
          </div>
        </div>
        <div
          ref={trackRef}
          id="hello-review-track"
          className="hello-review-track"
          role="region"
          aria-label="Customer review slider"
          tabIndex={0}
          onPointerDown={() => { manualUntil.current = Date.now() + 8000; }}
        >
          {reviews.map((review, idx) => (
            <article className="hello-review-card" key={review.id || idx}>
              <img
                src={review.image || '/campaign/real/couple-graphic-tees.webp'}
                alt={`${review.author}'s review`}
                width={480}
                height={320}
                loading="lazy"
              />
              <div className="hello-review-copy">
                <div className="hello-review-rating">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600, fontSize: '9px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    <CheckCircle size={11} /> Verified Buyer
                  </span>
                </div>
                <h3>{review.title}</h3>
                <p>{review.body}</p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{review.author} · {review.location || 'Sri Lanka'}</span>
                  <span>{review.created_at ? new Date(review.created_at).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' }) : 'Verified'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Write a Review Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Share Your Experience">
        <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {submittedMessage ? (
            <div style={{ padding: '1.25rem', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
              ✓ {submittedMessage}
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setNewRating(num)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      aria-label={`${num} stars`}
                    >
                      <Star
                        size={24}
                        fill={num <= newRating ? '#eab308' : 'none'}
                        color={num <= newRating ? '#eab308' : '#a1a1aa'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label>
                  <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>Your Name</span>
                  <input
                    required
                    name="author"
                    placeholder="e.g. Kasun D."
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line, #e4e4e7)', borderRadius: '4px', fontSize: '0.88rem' }}
                  />
                </label>
                <label>
                  <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>City / Town</span>
                  <input
                    required
                    name="location"
                    placeholder="e.g. Colombo 03"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line, #e4e4e7)', borderRadius: '4px', fontSize: '0.88rem' }}
                  />
                </label>
              </div>

              <label>
                <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>Review Headline</span>
                <input
                  required
                  name="title"
                  placeholder="e.g. Loved the structured collar and heavy fleece"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line, #e4e4e7)', borderRadius: '4px', fontSize: '0.88rem' }}
                />
              </label>

              <label>
                <span style={{ display: 'block', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>Your Review</span>
                <textarea
                  required
                  name="body"
                  rows={4}
                  placeholder="Tell us about the fabric weight, GSM, fit, and how it holds up after washes..."
                  value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line, #e4e4e7)', borderRadius: '4px', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="button outline"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button dark"
                  disabled={submitting}
                  style={{ padding: '8px 20px', fontSize: '0.82rem', background: '#111', color: '#fff' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </>
  );
}
