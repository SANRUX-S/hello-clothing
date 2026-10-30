'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import {
  UserRound,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { money } from '@/lib/catalog';
import type { StoredOrder } from '@/components/checkout/Checkout';
import { signInWithGoogle, logOut, onAuthChange, type User } from '@/lib/firebase';
import './profile-drawer.css';

type ProfileTab = 'track' | 'profile' | 'orders';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('track');
  const [trackRef, setTrackRef] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Profile details
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Order history
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (!open) return;
    try {
      // Load saved customer profile
      const savedProfile = localStorage.getItem('hello-customer-profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Load saved order history
      const savedOrders = localStorage.getItem('hello-order-history');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
          // If no search input, prefill with the latest order reference
          if (!trackRef && parsed.length > 0) {
            setTrackRef(parsed[0].reference);
          }
        }
      }
    } catch {}
  }, [open]);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      if (user) {
        setProfile((prev) => {
          const updated = {
            ...prev,
            name: prev.name || user.displayName || '',
            email: user.email || prev.email || '',
          };
          try {
            localStorage.setItem('hello-customer-profile', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    setAuthError('');
    try {
      const user = await signInWithGoogle();
      setFirebaseUser(user);
      if (user) {
        const updated = {
          ...profile,
          name: user.displayName || profile.name || '',
          email: user.email || profile.email || '',
        };
        setProfile(updated);
        try {
          localStorage.setItem('hello-customer-profile', JSON.stringify(updated));
        } catch {}
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err?.code === 'auth/unauthorized-domain') {
        setAuthError('Domain not authorized in Firebase Console. Please add this domain to Authorized Domains.');
      } else {
        setAuthError(err?.message || 'Could not sign in with Google. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    try {
      await logOut();
      setFirebaseUser(null);
    } catch {}
  }

  // Handle live tracking lookup
  async function handleTrackSubmit(e?: FormEvent, directRef?: string) {
    if (e) e.preventDefault();
    const query = (directRef || trackRef).trim().toUpperCase();
    if (!query) return;

    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.order) {
        setTrackingResult(data.order);
      } else {
        // Fallback to local stored order if exists
        const local = orders.find(o => o.reference.toUpperCase() === query);
        if (local) {
          setTrackingResult({
            reference: local.reference,
            status: 'out_for_delivery',
            courier: 'PromptX Logistics',
            tracking_number: 'PX-LOCAL',
            customer: local.customer,
            items: local.items,
            total: local.total,
            created_at: local.createdAt
          });
        } else {
          setTrackingError(data.error || 'No shipment found with this reference. Check your order SMS or receipt.');
        }
      }
    } catch (err: any) {
      // Local fallback
      const local = orders.find(o => o.reference.toUpperCase() === query);
      if (local) {
        setTrackingResult({
          reference: local.reference,
          status: 'out_for_delivery',
          courier: 'PromptX Logistics',
          tracking_number: 'PX-LOCAL',
          customer: local.customer,
          items: local.items,
          total: local.total,
          created_at: local.createdAt
        });
      } else {
        setTrackingError('Unable to connect to tracking service. Please try again.');
      }
    } finally {
      setTrackingLoading(false);
    }
  }

  // Handle saving customer profile
  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem('hello-customer-profile', JSON.stringify(profile));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {}
  }

  const isGuest = !profile.name.trim() && !firebaseUser;

  return (
    <Modal open={open} onClose={onClose} title="HELLO! Account" drawer>
      <div className="profile-drawer-container">
        {/* User Card */}
        <div className="profile-hero-card">
          <div className="profile-hero-top">
            <span className="profile-pass-title">HELLO! CREW PASS</span>
            <span className={`profile-badge ${firebaseUser ? 'verified' : isGuest ? 'guest' : 'member'}`}>
              ● {firebaseUser ? 'GOOGLE VERIFIED' : isGuest ? 'GUEST PASS' : 'STREETWEAR MEMBER'}
            </span>
          </div>

          <div className="profile-hero-main">
            <div className="profile-avatar">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Profile'}
                  className="profile-avatar-img"
                />
              ) : profile.name ? (
                profile.name.slice(0, 2).toUpperCase()
              ) : (
                <UserRound size={20} />
              )}
            </div>
            <div className="profile-info">
              <div className="profile-header-title">
                <h3>
                  {firebaseUser?.displayName || (profile.name ? profile.name : 'Colombo Streetwear Guest')}
                </h3>
              </div>
              <p className="profile-email">
                {firebaseUser?.email || profile.email || 'Sign in with Google for 1-click checkout'}
              </p>
            </div>
            {firebaseUser && (
              <button
                type="button"
                onClick={handleSignOut}
                className="profile-logout-btn"
                title="Sign out of Google"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        {/* Google One-Tap / Sign-In Button */}
        {!firebaseUser && (
          <div className="google-auth-banner">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="google-signin-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="google-icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{signingIn ? 'Connecting to Google…' : 'Continue with Google'}</span>
            </button>
            {authError && (
              <p className="google-auth-error">{authError}</p>
            )}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="profile-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'track'}
            className={`profile-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            <Truck size={14} />
            <span>Track Order</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserRound size={14} />
            <span>My Profile</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={14} />
            <span>My Orders ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: TRACK ORDER */}
        {activeTab === 'track' && (
          <div className="profile-tab-content">
            <div className="track-section-intro">
              <h4>Live Parcel & Courier Tracking</h4>
              <p>Enter your HELLO! Order Reference to see live PromptX courier updates.</p>
            </div>

            <form onSubmit={handleTrackSubmit} className="track-input-group">
              <div className="track-input-wrap">
                <Search size={15} className="track-input-icon" />
                <input
                  type="text"
                  placeholder="e.g. HL-782914"
                  value={trackRef}
                  onChange={e => setTrackRef(e.target.value)}
                  className="track-text-input"
                  required
                />
              </div>
              <button type="submit" className="track-action-btn" disabled={trackingLoading}>
                {trackingLoading ? 'TRACKING…' : 'TRACK'}
              </button>
            </form>

            {/* Quick Chips of Recent Orders */}
            {orders.length > 0 && (
              <div className="recent-order-chips">
                <span className="recent-chips-label">RECENT:</span>
                {orders.slice(0, 3).map(o => (
                  <button
                    key={o.reference}
                    type="button"
                    className="order-chip-btn"
                    onClick={() => {
                      setTrackRef(o.reference);
                      void handleTrackSubmit(undefined, o.reference);
                    }}
                  >
                    {o.reference}
                  </button>
                ))}
              </div>
            )}

            {/* Error state */}
            {trackingError && (
              <div className="track-error-box">
                <p>{trackingError}</p>
              </div>
            )}

            {/* Result State */}
            {trackingResult && (
              <div className="track-result-card">
                <div className="track-result-header">
                  <div>
                    <span className="track-eyebrow">ORDER REFERENCE</span>
                    <h5>{trackingResult.reference}</h5>
                  </div>
                  <span className="track-status-pill">
                    ● {trackingResult.status === 'delivered' ? 'Delivered' : trackingResult.status === 'out_for_delivery' ? 'Out for Delivery' : trackingResult.status === 'dispatched' ? 'In Transit' : 'Processing'}
                  </span>
                </div>

                <div className="track-courier-row">
                  <div>
                    <span className="track-muted-label">COURIER</span>
                    <strong>{trackingResult.courier || 'PromptX Logistics'}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="track-muted-label">WAYBILL #</span>
                    <strong>{trackingResult.tracking_number || trackingResult.trackingNumber || 'PX-849201'}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="track-progress-steps">
                  <div className={`step-item ${['processing', 'confirmed', 'production', 'dispatched', 'out_for_delivery', 'delivered'].includes(trackingResult.status) ? 'done' : ''}`}>
                    <span className="step-dot" />
                    <span className="step-label">Confirmed</span>
                  </div>
                  <div className={`step-item ${['dispatched', 'out_for_delivery', 'delivered'].includes(trackingResult.status) ? 'done' : ''}`}>
                    <span className="step-dot" />
                    <span className="step-label">Dispatched</span>
                  </div>
                  <div className={`step-item ${['out_for_delivery', 'delivered'].includes(trackingResult.status) ? 'active' : ''}`}>
                    <span className="step-dot" />
                    <span className="step-label">Out for Delivery</span>
                  </div>
                  <div className={`step-item ${trackingResult.status === 'delivered' ? 'done' : ''}`}>
                    <span className="step-dot" />
                    <span className="step-label">Delivered</span>
                  </div>
                </div>

                {/* Items preview */}
                {trackingResult.items && (
                  <div className="track-items-summary">
                    <span className="track-muted-label">PARCEL CONTENTS</span>
                    {trackingResult.items.map((it: any, idx: number) => (
                      <div key={idx} className="track-item-line">
                        <span>{it.name} ({it.color} / {it.size}) × {it.quantity}</span>
                        <strong>{money(it.lineTotal || it.unitPrice * it.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/track-order?ref=${trackingResult.reference}`}
                  className="track-full-page-link"
                  onClick={onClose}
                >
                  View full dispatch timeline <ArrowUpRight size={14} />
                </Link>

                <Link
                  href={`/order-confirmation/${trackingResult.reference}`}
                  className="track-full-page-link"
                  onClick={onClose}
                  style={{ marginTop: '4px', opacity: 0.85 }}
                >
                  View printable receipt & tax invoice <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="profile-tab-content">
            <div className="profile-form-intro">
              <h4>Saved Delivery Details</h4>
              <p>Keep your info saved so future checkouts are seamless and instant.</p>
            </div>

            {firebaseUser ? (
              <div className="google-connected-pill">
                <CheckCircle2 size={16} color="#16a34a" />
                <div>
                  <strong>Connected via Google ({firebaseUser.email})</strong>
                  <span>Your Google profile auto-fills delivery details at checkout</span>
                </div>
              </div>
            ) : (
              <div className="google-connect-prompt">
                <div className="prompt-text">
                  <strong>Fast 1-Click Checkout</strong>
                  <span>Sign in with Google to auto-sync your details and order updates.</span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                  className="google-connect-btn"
                >
                  Link Google
                </button>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <label className="profile-field">
                <span>Full Name</span>
                <input
                  type="text"
                  placeholder="Kasun Perera"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </label>

              <div className="profile-form-row">
                <label className="profile-field">
                  <span>Phone Number</span>
                  <input
                    type="tel"
                    placeholder="077 123 4567"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    required
                  />
                </label>
                <label className="profile-field">
                  <span>City / Suburb</span>
                  <input
                    type="text"
                    placeholder="Colombo 07"
                    value={profile.city}
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    required
                  />
                </label>
              </div>

              <label className="profile-field">
                <span>Email Address</span>
                <input
                  type="email"
                  placeholder="kasun@example.com"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </label>

              <label className="profile-field">
                <span>Street Address</span>
                <input
                  type="text"
                  placeholder="No 45/2, Ward Place"
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  required
                />
              </label>

              <button type="submit" className="profile-save-btn">
                {profileSaved ? (
                  <>
                    <Check size={16} /> Saved!
                  </>
                ) : (
                  'SAVE PROFILE'
                )}
              </button>
            </form>

            {/* Member Perks Card */}
            <div className="profile-perks-card">
              <div className="perks-heading">
                <strong>Streetwear Member Perks</strong>
              </div>
              <ul>
                <li>7-Day doorstep size exchange guarantee</li>
                <li>Priority packing & dispatch on limited drops</li>
                <li>Free Islandwide delivery on orders over LKR 10,000</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="profile-tab-content">
            {orders.length > 0 ? (
              <div className="profile-orders-list">
                {orders.map(order => (
                  <div key={order.reference} className="profile-order-card">
                    <div className="order-card-header">
                      <div>
                        <strong>{order.reference}</strong>
                        <span className="order-card-date">
                          {new Date(order.createdAt).toLocaleDateString('en-LK', {
                            dateStyle: 'medium'
                          })}
                        </span>
                      </div>
                      <span className="order-status-tag">● In Transit</span>
                    </div>

                    <div className="order-items-preview">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="order-mini-item">
                          <span>{it.name} ({it.color}/{it.size}) × {it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong className="order-card-total">{money(order.total)}</strong>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                        <Link
                          href={`/order-confirmation/${order.reference}`}
                          onClick={onClose}
                          className="order-track-btn"
                          style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          Receipt
                        </Link>
                        <button
                          type="button"
                          className="order-track-btn"
                          onClick={() => {
                            setTrackRef(order.reference);
                            setActiveTab('track');
                            void handleTrackSubmit(undefined, order.reference);
                          }}
                        >
                          Track <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-orders">
                <Package size={36} strokeWidth={1.2} />
                <h5>No orders placed yet</h5>
                <p>When you checkout with Cash on Delivery or Card, your orders will appear here automatically.</p>
                <Link href="/shop" className="explore-store-btn" onClick={onClose}>
                  EXPLORE THE STORE <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
