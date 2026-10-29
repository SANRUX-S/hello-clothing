'use client';
import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CategoryFeatureGrid from '@/components/shop/CategoryFeatureGrid';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  UserRound,
  Package,
  Mail,
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { money } from '@/lib/catalog';
import type { StoredOrder } from '@/components/checkout/Checkout';
import { signInWithGoogle, logOut, onAuthChange, type User } from '@/lib/firebase';

const policies: Record<string, { title: string; intro: string; sections: { title: string; copy: string }[] }> = {
  shipping: {
    title: 'ISLANDWIDE DELIVERY.',
    intro: 'Courier Delivery Across All 25 Districts',
    sections: [
      {
        title: 'Delivery Coverage & Courier Partners',
        copy: 'HELLO! delivers to every postal address across all 25 districts in Sri Lanka in partnership with PromptX Logistics and Domex Courier. All orders are carefully packed in our tamper-evident branded dust bags.',
      },
      {
        title: 'Shipping Times, Cutoff & Rates',
        copy: '• Colombo & Greater Suburbs: 1 to 2 business days (LKR 500).\n• Outstation & Islandwide: 2 to 4 business days (LKR 500).\n• Express Priority (Western Province): Next-day guaranteed delivery (LKR 750).\n• Free Islandwide Shipping is automatically applied to all orders of LKR 10,000 or more.\n• Orders placed before 2:00 PM (Monday–Saturday) are prepared and handed to couriers on the same business day.',
      },
      {
        title: 'Cash on Delivery (COD) & SMS Tracking',
        copy: 'Cash on Delivery is available across all 25 districts with no extra surcharge. Once your parcel is dispatched from our Colombo fulfillment hub, you will receive an SMS containing your live PromptX tracking number.',
      },
    ],
  },
  returns: {
    title: 'EASY 7-DAY EXCHANGES.',
    intro: 'Doorstep Size Swaps Guaranteed',
    sections: [
      {
        title: '7-Day Hassle-Free Size Exchanges',
        copy: 'Streetwear is all about the right fit and silhouette. If your garment doesn’t fit exactly the way you like, we will happily exchange it for another size or style within 7 days of delivery.',
      },
      {
        title: 'Exchange Conditions',
        copy: 'Garments must be unworn, unwashed, and returned in their original condition with all HELLO! swing tags and packaging intact. For hygiene reasons, caps and socks cannot be exchanged unless factory defective.',
      },
      {
        title: 'Doorstep Courier Exchange',
        copy: 'Simply message our WhatsApp Concierge at +94 78 619 1260 with your Order Reference. We will send our courier to deliver your new size and collect the previous piece directly from your doorstep.',
      },
    ],
  },
  privacy: {
    title: 'CUSTOMER DATA & PRIVACY.',
    intro: 'Zero Data Selling · Encrypted Checkout',
    sections: [
      {
        title: 'How We Protect Your Information',
        copy: 'HELLO! Clothing is committed to keeping your personal information safe. Your contact details and delivery addresses are used exclusively to process your orders, provide dispatch tracking updates, and deliver your parcels.',
      },
      {
        title: 'Zero Third-Party Data Selling',
        copy: 'We never sell, trade, or share your personal data with third-party advertisers or data brokers. All online transactions are handled through 256-bit SSL encrypted channels.',
      },
      {
        title: 'Your Preferences & Control',
        copy: 'You can update or delete your contact profile and newsletter subscription preferences at any time by contacting our support concierge.',
      },
    ],
  },
  terms: {
    title: 'THE HELLO! STANDARD.',
    intro: 'Store Terms & Quality Promise',
    sections: [
      {
        title: 'HELLO! Quality Promise',
        copy: 'Every piece is crafted from premium heavyweight fabrics (240–380 GSM combed cotton and fleece), pre-shrunk and tailored to hold its form over extended everyday wear.',
      },
      {
        title: 'Pricing & Currency',
        copy: 'All prices displayed on HELLO! are in Sri Lankan Rupees (LKR) and include all applicable local taxes. There are no surprise checkout fees.',
      },
      {
        title: 'Authenticity & Copyright',
        copy: 'All graphics, designs, logos, typography, and campaign photography are the original intellectual property of HELLO! Clothing Sri Lanka.',
      },
    ],
  },
};

const faq = [
  {
    q: 'How does HELLO! clothing fit?',
    a: 'Our tees, hoodies, and pants feature a contemporary drop-shoulder, boxy streetwear fit. If you prefer a tailored or closer fit, we recommend selecting one size smaller than your standard size. Refer to our Size Guide for exact centimeter and inch measurements.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD) islandwide?',
    a: 'Yes! Cash on Delivery is available across all 25 districts in Sri Lanka. You can pay cash directly to the courier partner upon parcel handover.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders in Colombo and surrounding suburbs arrive in 1 to 2 business days. Outstation deliveries typically take 2 to 4 business days via our partner PromptX Logistics. Express next-day delivery is also available for Western Province orders.',
  },
  {
    q: 'What is your fabric quality?',
    a: 'We use high-density 240–260 GSM combed compact cotton for our tees, 290 GSM heavy twill for cargo pants, and 380 GSM brushed fleece for our hoodies. All fabrics are pre-washed and pre-shrunk to prevent fading or shrinkage.',
  },
  {
    q: 'Can I exchange my piece if the size doesn’t fit?',
    a: 'Absolutely. We offer a 7-day hassle-free doorstep exchange policy. Just WhatsApp our team at +94 78 619 1260 with your order reference number, and we will arrange a size swap.',
  },
  {
    q: 'Where is your store located?',
    a: 'We are primarily an online streetwear label dispatching from our Colombo fulfillment hub, with periodic retail pop-ups and exhibitions announced through our VIP newsletter and Instagram (@hello.streetwear).',
  },
];

export default function InfoPage({ kind }: { kind: string }) {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [successRef, setSuccessRef] = useState('');

  // Sizing state
  const [guideUnit, setGuideUnit] = useState<'inches' | 'cm'>('inches');

  // Tracking state
  const initialRef = searchParams.get('ref') || '';
  const [trackRefInput, setTrackRefInput] = useState(initialRef);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<StoredOrder | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Account state
  const [profile, setProfile] = useState<{ name: string; email: string; phone: string; address: string; city: string }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [profileSaved, setProfileSaved] = useState(false);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setFirebaseUser(user);
      if (user) {
        setProfile((prev) => ({
          ...prev,
          name: prev.name || user.displayName || '',
          email: user.email || prev.email || '',
        }));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        // Load orders
        const storedOrders = JSON.parse(localStorage.getItem('hello-order-history') || '[]');
        if (Array.isArray(storedOrders)) {
          setOrders(storedOrders);
          if (initialRef) {
            const match = storedOrders.find((o: StoredOrder) => o.reference.toUpperCase() === initialRef.toUpperCase());
            if (match) setActiveTrackingOrder(match);
          } else if (storedOrders.length > 0) {
            setActiveTrackingOrder(storedOrders[0]);
            setTrackRefInput(storedOrders[0].reference);
          }
        }

        // Load profile
        const storedProfile = JSON.parse(localStorage.getItem('hello-customer-profile') || 'null');
        if (storedProfile) {
          setProfile(storedProfile);
        }
      } catch {}
    });

    if (initialRef) {
      setTrackingLoading(true);
      fetch(`/api/orders/track?ref=${encodeURIComponent(initialRef)}`)
        .then((r) => r.json())
        .then((d) => {
          if (active && d?.order) {
            setActiveTrackingOrder({
              reference: d.order.reference,
              currency: 'LKR',
              subtotal: d.order.subtotal,
              delivery: d.order.delivery,
              total: d.order.total,
              paymentMethod: d.order.payment_method || 'cod',
              deliveryMethod: 'standard',
              createdAt: d.order.created_at,
              status: d.order.status || 'processing',
              courier: d.order.courier || 'PromptX Logistics',
              tracking_number: d.order.tracking_number || '',
              customer: d.order.customer || { name: 'Customer', phone: '', city: 'Colombo', address: '', email: '' },
              items: Array.isArray(d.order.items) ? d.order.items : [],
            });
            setTrackingError('');
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setTrackingLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [initialRef]);

  async function handleContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const f = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          email: f.get('email'),
          message: f.get('message'),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not send message.');
      setMessage(data.message);
      setSuccessRef(data.reference || 'HL-INQ-RECEIVED');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Message could not be sent.');
    } finally {
      setBusy(false);
    }
  }

  function handleSaveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      localStorage.setItem('hello-customer-profile', JSON.stringify(profile));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {}
  }

  async function handleSearchTracking(e: FormEvent) {
    e.preventDefault();
    const query = trackRefInput.trim().toUpperCase();
    if (!query) return;

    setTrackingLoading(true);
    setTrackingError('');

    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data?.order) {
        setActiveTrackingOrder({
          reference: data.order.reference,
          currency: 'LKR',
          subtotal: data.order.subtotal,
          delivery: data.order.delivery,
          total: data.order.total,
          paymentMethod: data.order.payment_method || 'cod',
          deliveryMethod: 'standard',
          createdAt: data.order.created_at,
          status: data.order.status || 'processing',
          courier: data.order.courier || 'PromptX Logistics',
          tracking_number: data.order.tracking_number || '',
          customer: data.order.customer || { name: 'Customer', phone: '', city: 'Colombo', address: '', email: '' },
          items: Array.isArray(data.order.items) ? data.order.items : [],
        });
      } else {
        const found = orders.find((o) => o.reference.toUpperCase() === query);
        if (found) {
          setActiveTrackingOrder(found);
        } else {
          setActiveTrackingOrder(null);
          setTrackingError(`No order found for reference "${query}". Please check the code on your receipt or SMS.`);
        }
      }
    } catch {
      const found = orders.find((o) => o.reference.toUpperCase() === query);
      if (found) {
        setActiveTrackingOrder(found);
      } else {
        setTrackingError('Unable to connect to tracking service. Please try again.');
      }
    } finally {
      setTrackingLoading(false);
    }
  }

  if (kind === 'about') {
    return (
      <>
        <section className="about-hero">
          <img
            src="/hero/campaign.webp"
            alt="HELLO! streetwear campaign with models on urban steps"
            width={1600}
            height={900}
          />
          <div />
          <div className="about-hero-copy">
            <span className="eyebrow">BORN IN COLOMBO</span>
            <h1>
              HEAVYWEIGHT.
              <br />
              NO SHORTCUTS.
            </h1>
            <p>Real streetwear built for daily wear in the island heat. Not cheap fast fashion.</p>
          </div>
        </section>
        <section className="about-story page-gutter">
          <span className="eyebrow">HOW WE STARTED</span>
          <div>
            <h2>
              TIRED OF
              <br />
              PAPER-THIN TEES.
            </h2>
            <p>
              We started HELLO! in Colombo because we were sick of buying tees that look great in a photoshoot, but shrink, fade, and turn into bacon around the collar after two washes in the heat.
            </p>
            <p>
              We wanted genuine heavyweight streetwear: 240+ GSM combed compact cotton that holds its boxy silhouette, thick double-layered hoods that don’t flop flat, and relaxed drop-shoulder cuts with clean stitching.
            </p>
            <p>
              Every piece is cut, stitched, and tested right here in Sri Lanka. Islandwide doorstep delivery with 7-day size swaps because streetwear only works when the fit is 100% right.
            </p>
            <Link className="text-link" href="/shop">
              SHOP THE LATEST DROP <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (kind === 'collections') return <CategoryFeatureGrid />;

  if (kind === 'account' || kind === 'account/orders' || kind.startsWith('account/orders/')) {
    return (
      <section className="account-page page-gutter">
        <div className="account-editorial">
          <span className="eyebrow">HELLO! MEMBER STUDIO</span>
          <h1>
            GOOD TO
            <br />
            SEE YOU.
          </h1>
          <img src="/campaign/real/man-black-hoodie.webp" alt="HELLO! Streetwear member" width={800} height={600} />
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--panel)', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}>
              VIP Streetwear Member
            </span>
            <p style={{ marginTop: '6px', color: 'var(--muted)' }}>
              Active member benefits: Priority dispatch on new drops, 10% welcome discount, and 7-day courier exchange guarantee.
            </p>
          </div>
        </div>

        <div className="account-form" style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <UserRound size={32} strokeWidth={1.2} />
            <div>
              <h2 style={{ margin: 0 }}>Your Profile & Orders</h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Manage your personal details and track purchases</span>
            </div>
          </div>

          {/* Google One-Tap / Sign-In Card */}
          <div style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid var(--line)', borderRadius: '6px', marginBottom: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            {firebaseUser ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--fg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {firebaseUser.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{firebaseUser.displayName || 'Google Member'}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ● Verified ({firebaseUser.email})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => { await logOut(); setFirebaseUser(null); }}
                  className="button outline"
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <div>
                <span className="eyebrow" style={{ margin: '0 0 6px', display: 'block' }}>GOOGLE ACCOUNT</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 12px', lineHeight: '1.5' }}>
                  Connect your Google account to auto-fill delivery details and sync orders across all your devices.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setSigningIn(true);
                    setAuthError('');
                    try {
                      const u = await signInWithGoogle();
                      setFirebaseUser(u);
                    } catch (e: any) {
                      if (e?.code !== 'auth/popup-closed-by-user') {
                        setAuthError(e?.message || 'Could not connect with Google.');
                      }
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  disabled={signingIn}
                  className="button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ffffff', color: '#141614', border: '1px solid #dcd9d0', padding: '10px 18px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '4px', cursor: 'pointer' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{signingIn ? 'CONNECTING…' : 'CONTINUE WITH GOOGLE'}</span>
                </button>
                {authError && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '8px' }}>{authError}</p>}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Saved Delivery Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>
                Full Name
                <input
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your full name"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
              <label style={{ fontSize: '0.8rem' }}>
                Email
                <input
                  required
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem' }}>
                Phone Number
                <input
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="07X XXX XXXX"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
              <label style={{ fontSize: '0.8rem' }}>
                City / Suburb
                <input
                  required
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="e.g. Colombo 07"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>

            <label style={{ fontSize: '0.8rem' }}>
              Street Address
              <input
                required
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="House No, Street name"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', marginTop: '4px' }}
              />
            </label>

            <button type="submit" className="button dark" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {profileSaved ? 'SAVED TO BROWSER!' : 'UPDATE PROFILE'}
            </button>
          </form>

          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Recent Orders ({orders.length})</h3>
            {orders.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((o) => (
                  <div
                    key={o.reference}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      background: 'var(--panel)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{o.reference}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>● In Transit</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {o.items.map((it) => `${it.name} (${it.color}/${it.size}) × ${it.quantity}`).join(', ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{money(o.total)}</span>
                      <Link href={`/track-order?ref=${o.reference}`} className="text-link" style={{ fontSize: '0.8rem' }}>
                        TRACK PARCEL <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', background: 'var(--panel)', borderRadius: '8px', textAlign: 'center' }}>
                <Package size={30} strokeWidth={1} style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No orders placed yet.</p>
                <Link className="text-link" href="/shop" style={{ display: 'inline-block', marginTop: '8px' }}>
                  EXPLORE THE COLLECTION <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (kind === 'track-order') {
    const isOrderReady = Boolean(activeTrackingOrder);
    const orderStatus = activeTrackingOrder?.status || 'processing';
    const isCancelled = orderStatus === 'cancelled';

    const STATUS_RANKS: Record<string, number> = {
      order_placed: 0,
      confirmed: 0,
      processing: 0,
      placed: 0,
      in_progress: 1,
      production: 1,
      ready_to_dispatch: 2,
      dispatched: 2,
      out_for_delivery: 3,
      delivered: 4,
      order_received: 4,
    };
    const currentRank = STATUS_RANKS[orderStatus] ?? 0;

    const timelineSteps = [
      {
        title: '1. Order Placed & Confirmed',
        desc: 'Order verified and entered into HELLO! fulfillment hub in Colombo',
        status: isCancelled ? 'pending' : currentRank > 0 ? 'done' : currentRank === 0 ? 'current' : 'pending',
      },
      {
        title: '2. In Progress (QC & Hand-Packing)',
        desc: 'Inspected for fabric consistency and hand-packed in signature atelier dust bag',
        status: isCancelled ? 'pending' : currentRank > 1 ? 'done' : currentRank === 1 ? 'current' : 'pending',
      },
      {
        title: `3. Ready to Dispatch (${activeTrackingOrder?.courier || 'PromptX Logistics'})`,
        desc: activeTrackingOrder?.tracking_number
          ? `Handed to courier with Waybill #${activeTrackingOrder.tracking_number}`
          : `Handed over to ${activeTrackingOrder?.courier || 'PromptX Logistics'} for express transit`,
        status: isCancelled ? 'pending' : currentRank > 2 ? 'done' : currentRank === 2 ? 'current' : 'pending',
      },
      {
        title: '4. Out for Delivery Today',
        desc: activeTrackingOrder?.customer?.city
          ? `Courier rider is on the road for doorstep delivery in ${activeTrackingOrder.customer.city}`
          : 'Courier rider is on the road for doorstep delivery today',
        status: isCancelled ? 'pending' : currentRank > 3 ? 'done' : currentRank === 3 ? 'current' : 'pending',
      },
      {
        title: '5. Order Received / Delivered',
        desc: 'Recipient signature collected and parcel safely handed over',
        status: currentRank >= 4 ? 'done' : 'pending',
      },
    ];

    return (
      <section className="info-page narrow-page page-gutter" style={{ maxWidth: '780px' }}>
        <span className="eyebrow">DISPATCH & COURIER TRACKING</span>
        <h1>FOLLOW YOUR PIECE.</h1>

        <form onSubmit={handleSearchTracking} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            value={trackRefInput}
            onChange={(e) => setTrackRefInput(e.target.value)}
            placeholder="Enter Order Reference (e.g. HL-XXXXXX)"
            required
            style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.95rem' }}
          />
          <button type="submit" className="button dark" disabled={trackingLoading}>
            {trackingLoading ? 'SEARCHING…' : 'TRACK'}
          </button>
        </form>

        {trackingError && (
          <div style={{ padding: '0.9rem 1.2rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {trackingError}
          </div>
        )}

        {isOrderReady && activeTrackingOrder ? (
          <div style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '1.5rem', background: 'var(--panel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="eyebrow" style={{ margin: 0 }}>ACTIVE SHIPMENT</span>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{activeTrackingOrder.reference}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Courier: {activeTrackingOrder.courier || 'PromptX Logistics'}</span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isCancelled ? '#ef4444' : orderStatus === 'delivered' ? '#16a34a' : '#2563eb',
                  }}
                >
                  ● {isCancelled
                    ? 'Cancelled'
                    : orderStatus === 'delivered'
                    ? 'Delivered'
                    : orderStatus === 'out_for_delivery'
                    ? 'Out for Delivery'
                    : orderStatus === 'dispatched'
                    ? 'Handed to Courier'
                    : orderStatus === 'production'
                    ? 'Quality Checked & Prepared'
                    : orderStatus === 'confirmed'
                    ? 'Confirmed'
                    : 'Processing'}
                </span>
                {activeTrackingOrder.tracking_number && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                    Waybill: #{activeTrackingOrder.tracking_number}
                  </span>
                )}
              </div>
            </div>

            {/* Tracking Progress Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {timelineSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        background: step.status === 'done' ? '#16a34a' : step.status === 'current' ? '#2563eb' : 'var(--line)',
                        color: step.status === 'done' || step.status === 'current' ? '#ffffff' : 'var(--muted)',
                      }}
                    >
                      {idx + 1}
                    </div>
                    {idx < timelineSteps.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          height: '28px',
                          background: step.status === 'done' ? '#16a34a' : 'var(--line)',
                          margin: '4px 0',
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.92rem', color: step.status === 'pending' ? 'var(--muted)' : 'var(--fg)' }}>
                        {step.title}
                      </strong>
                      {step.status === 'current' && (
                        <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>CURRENT STEP</span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipment Items */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <span className="eyebrow">PARCEL CONTENTS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {activeTrackingOrder.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{it.name} ({it.color} / {it.size}) × {it.quantity}</span>
                    <strong>{money(it.lineTotal)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Official Receipt Access */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Tax Document</span>
                <strong style={{ fontSize: '0.92rem' }}>Order Receipt & Dispatch Invoice</strong>
              </div>
              <Link
                href={`/order-confirmation/${encodeURIComponent(activeTrackingOrder.reference)}`}
                className="button dark"
                style={{ fontSize: '0.78rem', padding: '0 18px', minHeight: '38px', gap: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                VIEW & PRINT RECEIPT
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--panel)', borderRadius: '8px' }}>
            <Package size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
            <p>Enter your HELLO! Order Reference above to check live courier delivery updates.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link className="button dark" href="/shop">
            EXPLORE THE STORE <ArrowRight size={17} />
          </Link>
          <Link className="button outline" href="/contact">
            COURIER INQUIRY SUPPORT
          </Link>
        </div>
      </section>
    );
  }

  if (kind === 'contact') {
    return (
      <section className="contact-page page-gutter">
        <div className="page-heading">
          <span className="eyebrow">A CONVERSATION STARTS WITH HELLO.</span>
          <h1>LET’S TALK.</h1>
        </div>
        <div className="contact-grid">
          <div>
            <Mail size={30} strokeWidth={1} />
            <h2>We’re always here for you.</h2>
            <p>Questions about sizing, your order, or wholesale inquiries? The HELLO! concierge is ready to assist.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              <a
                href="https://wa.me/94786191260"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--fg)', fontSize: '0.9rem' }}
              >
                <MessageCircle size={20} color="#25D366" />
                <span>
                  <strong>WhatsApp Concierge:</strong> +94 78 619 1260
                </span>
                <ExternalLink size={14} />
              </a>

              <a
                href="tel:0786191260"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--fg)', fontSize: '0.9rem' }}
              >
                <Phone size={20} />
                <span>
                  <strong>Direct Support Hotline:</strong> 078 619 1260
                </span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Clock size={20} />
                <span>
                  <strong>Hours:</strong> Mon – Sat: 9:00 AM – 7:00 PM
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <MapPin size={20} />
                <span>
                  <strong>Dispatch Hub:</strong> Colombo 07, Sri Lanka
                </span>
              </div>
            </div>

            <Link className="text-link" href="/faq">
              BROWSE FREQUENT QUESTIONS <ArrowUpRight size={16} />
            </Link>
          </div>

          <form onSubmit={handleContact} className="contact-form">
            <label>
              Your name
              <input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Full name" />
            </label>
            <label>
              Email address
              <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" />
            </label>
            <label>
              Your message
              <textarea name="message" required minLength={10} maxLength={4000} rows={5} placeholder="How can we help you?" />
            </label>

            <button className="button dark" disabled={busy}>
              {busy ? 'SENDING INQUIRY…' : 'SEND MESSAGE'} <ArrowRight size={17} />
            </button>

            {message && (
              <div
                role="status"
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  background: successRef ? '#ecfdf5' : '#fef2f2',
                  color: successRef ? '#065f46' : '#991b1b',
                  fontSize: '0.88rem',
                  marginTop: '0.75rem',
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </section>
    );
  }

  if (kind === 'faq') {
    return (
      <section className="info-page faq-page page-gutter">
        <span className="eyebrow">QUESTIONS & ANSWERS</span>
        <h1>EVERYTHING YOU NEED TO KNOW.</h1>
        <div className="faq-layout">
          <div>
            <span className="eyebrow">THE ANSWERS</span>
            <p>From sizing recommendations to islandwide delivery timelines, here’s how we operate.</p>
            <Link href="/contact" className="text-link">
              STILL HAVE QUESTIONS? <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="faq-list">
            {faq.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <Plus size={17} />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (kind === 'size-guide') {
    return (
      <section className="info-page narrow-page page-gutter" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="eyebrow">MEASUREMENT STANDARDS</span>
            <h1>FIND YOUR EXACT FIT.</h1>
          </div>
          <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--line)', borderRadius: '6px', padding: '3px' }}>
            <button
              type="button"
              onClick={() => setGuideUnit('inches')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '4px',
                background: guideUnit === 'inches' ? 'var(--fg)' : 'transparent',
                color: guideUnit === 'inches' ? 'var(--bg)' : 'var(--muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              INCHES
            </button>
            <button
              type="button"
              onClick={() => setGuideUnit('cm')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '4px',
                background: guideUnit === 'cm' ? 'var(--fg)' : 'transparent',
                color: guideUnit === 'cm' ? 'var(--bg)' : 'var(--muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              CENTIMETERS
            </button>
          </div>
        </div>

        <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
          HELLO! garments are cut with a relaxed streetwear oversized silhouette. If you prefer a regular tailored fit, consider sizing down one size.
        </p>

        {/* Tops Chart */}
        <div style={{ margin: '2rem 0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Tops (T-Shirts & Oversized Hoodies)</h2>
          <table style={{ width: '100%', fontSize: '0.88rem', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 6px' }}>SIZE</th>
                <th style={{ padding: '10px 6px' }}>CHEST ({guideUnit === 'inches' ? 'IN' : 'CM'})</th>
                <th style={{ padding: '10px 6px' }}>LENGTH</th>
                <th style={{ padding: '10px 6px' }}>SHOULDER</th>
                <th style={{ padding: '10px 6px' }}>SLEEVE</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: 'S', c: guideUnit === 'inches' ? '42' : '106', l: guideUnit === 'inches' ? '28' : '71', sh: guideUnit === 'inches' ? '20' : '51', sl: guideUnit === 'inches' ? '9.0' : '23' },
                { s: 'M', c: guideUnit === 'inches' ? '44' : '112', l: guideUnit === 'inches' ? '29' : '74', sh: guideUnit === 'inches' ? '21' : '53', sl: guideUnit === 'inches' ? '9.5' : '24' },
                { s: 'L', c: guideUnit === 'inches' ? '46' : '117', l: guideUnit === 'inches' ? '30' : '76', sh: guideUnit === 'inches' ? '22' : '56', sl: guideUnit === 'inches' ? '10.0' : '25' },
                { s: 'XL', c: guideUnit === 'inches' ? '48' : '122', l: guideUnit === 'inches' ? '31' : '79', sh: guideUnit === 'inches' ? '23' : '58', sl: guideUnit === 'inches' ? '10.5' : '27' },
                { s: 'XXL', c: guideUnit === 'inches' ? '50' : '127', l: guideUnit === 'inches' ? '32' : '81', sh: guideUnit === 'inches' ? '24' : '61', sl: guideUnit === 'inches' ? '11.0' : '28' },
              ].map((row) => (
                <tr key={row.s} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>{row.s}</td>
                  <td style={{ padding: '10px 6px' }}>{row.c}</td>
                  <td style={{ padding: '10px 6px' }}>{row.l}</td>
                  <td style={{ padding: '10px 6px' }}>{row.sh}</td>
                  <td style={{ padding: '10px 6px' }}>{row.sl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottoms Chart */}
        <div style={{ margin: '2rem 0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Bottoms (Cargo Pants)</h2>
          <table style={{ width: '100%', fontSize: '0.88rem', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 6px' }}>SIZE</th>
                <th style={{ padding: '10px 6px' }}>WAIST ({guideUnit === 'inches' ? 'IN' : 'CM'})</th>
                <th style={{ padding: '10px 6px' }}>TOTAL LENGTH</th>
                <th style={{ padding: '10px 6px' }}>INSEAM</th>
                <th style={{ padding: '10px 6px' }}>THIGH</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: 'S', w: guideUnit === 'inches' ? '28 - 30' : '71 - 76', l: guideUnit === 'inches' ? '40' : '101', i: guideUnit === 'inches' ? '29' : '74', t: guideUnit === 'inches' ? '24' : '61' },
                { s: 'M', w: guideUnit === 'inches' ? '31 - 33' : '79 - 84', l: guideUnit === 'inches' ? '41' : '104', i: guideUnit === 'inches' ? '30' : '76', t: guideUnit === 'inches' ? '25' : '64' },
                { s: 'L', w: guideUnit === 'inches' ? '34 - 36' : '86 - 91', l: guideUnit === 'inches' ? '42' : '107', i: guideUnit === 'inches' ? '31' : '79', t: guideUnit === 'inches' ? '26' : '66' },
                { s: 'XL', w: guideUnit === 'inches' ? '37 - 39' : '94 - 99', l: guideUnit === 'inches' ? '43' : '109', i: guideUnit === 'inches' ? '31.5' : '80', t: guideUnit === 'inches' ? '27' : '69' },
              ].map((row) => (
                <tr key={row.s} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>{row.s}</td>
                  <td style={{ padding: '10px 6px' }}>{row.w}</td>
                  <td style={{ padding: '10px 6px' }}>{row.l}</td>
                  <td style={{ padding: '10px 6px' }}>{row.i}</td>
                  <td style={{ padding: '10px 6px' }}>{row.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="measurement-steps">
          {[
            ['01', 'Lay it flat.', 'Choose your best-fitting garment and lay it on a flat table without pulling or stretching.'],
            ['02', 'Measure the chest.', 'Measure 1 inch below the armpit seam straight across from edge to edge and double that number for chest circumference.'],
            ['03', 'Check total length.', 'Measure from the top point of the shoulder down to the bottom hem.'],
          ].map(([n, h, p]) => (
            <div key={n}>
              <span>{n}</span>
              <h2>{h}</h2>
              <p>{p}</p>
            </div>
          ))}
        </div>

        <Link className="button dark" href="/shop">
          BACK TO THE COLLECTION <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  const key = kind.replace('policies/', '');
  const policy = policies[key];
  if (policy) {
    return (
      <section className="info-page narrow-page policy-page page-gutter">
        <span className="eyebrow">{policy.intro.toUpperCase()}</span>
        <h1>{policy.title}</h1>
        {policy.sections.map((s) => (
          <section key={s.title} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{s.title}</h2>
            <p style={{ whiteSpace: 'pre-line', color: 'var(--muted)', lineHeight: '1.6' }}>{s.copy}</p>
          </section>
        ))}
        <Link className="text-link" href="/shop">
          BACK TO THE COLLECTION <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  return (
    <section className="empty-state empty-page">
      <span className="empty-script">Hello?</span>
      <h1>This piece is missing.</h1>
      <p>Let’s get you back to the good stuff.</p>
      <Link className="button dark" href="/shop">
        EXPLORE THE COLLECTION <ArrowRight size={17} />
      </Link>
    </section>
  );
}
