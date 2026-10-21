'use client';

import Link from 'next/link';
import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, Headphones, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import './community.css';

export default function Newsletter() {
  const emailId = useId();
  const messageId = useId();
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    if (typeof email === 'string' && email.includes('@')) {
      try {
        const saved = JSON.parse(localStorage.getItem('hello-newsletter-list') || '[]');
        if (!saved.includes(email)) {
          saved.push(email);
          localStorage.setItem('hello-newsletter-list', JSON.stringify(saved));
        }
      } catch {}
    }
    setSubmitted(true);
    event.currentTarget.reset();
  }

  function copyCode() {
    navigator.clipboard.writeText('HELLO10');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return <section className="hello-newsletter" aria-labelledby="newsletter-title">
    <img className="hello-newsletter-photo" src="/campaign/real/couple-graphic-tees.webp" alt="" width={960} height={1280} loading="lazy"/>
    <div className="hello-newsletter-copy">
      <p className="hello-community-kicker">DROP ALERTS & RESTOCKS</p>
      <h2 id="newsletter-title">NEVER MISS A DROP.</h2>
      <p>Limited batch releases sell out fast. Get drop announcements, secret restocks, and private member perks straight to your inbox.</p>
    </div>
    <form className="hello-newsletter-form" onSubmit={handleSubmit}>
      <label className="hello-newsletter-label" htmlFor={emailId}>Your email address</label>
      <div className="hello-newsletter-field">
        <input id={emailId} type="email" name="email" required maxLength={254} autoComplete="email" placeholder="Enter your email" aria-describedby={messageId}/>
        <button type="submit" aria-label="Subscribe to the newsletter"><ArrowRight size={21}/></button>
      </div>
      {submitted ? (
        <div id={messageId} className="hello-newsletter-message" role="status" style={{ color: 'var(--fg)', marginTop: '0.75rem', fontSize: '0.88rem' }}>
          <span>🎉 Welcome to the club. Use code </span>
          <button
            type="button"
            onClick={copyCode}
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              padding: '2px 8px',
              fontWeight: 700,
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '4px',
              marginRight: '4px'
            }}
          >
            {copied ? 'COPIED!' : 'HELLO10'}
          </button>
          <span> for 10% off your order!</span>
        </div>
      ) : (
        <p id={messageId} className="hello-newsletter-message" role="status">
          No spam ever. Just drop notifications and 10% off your first order.
        </p>
      )}
    </form>
  </section>;
}

const services = [
  { icon: Truck, title: 'ISLANDWIDE DELIVERY', text: '1–2 days Colombo · 2–4 days outstation', href: '/policies/shipping' },
  { icon: PackageCheck, title: '7-DAY EXCHANGES', text: 'Doorstep size swaps made simple', href: '/policies/returns' },
  { icon: ShieldCheck, title: 'CASH ON DELIVERY', text: 'Available across all 25 districts', href: '/checkout' },
  { icon: Headphones, title: 'WHATSAPP SUPPORT', text: '+94 78 619 1260 direct help', href: '/contact' },
];

export function ServiceStrip() {
  return <nav className="hello-service-strip" aria-label="Shopping information">{services.map(({ icon: Icon, title, text, href }) => <Link key={href} href={href}><Icon size={29} strokeWidth={1.35}/><span><strong>{title}</strong><small>{text}</small></span></Link>)}</nav>;
}
