'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase/client';
import Link from 'next/link';
import {
  UserRound,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { money } from '@/lib/catalog';
import type { StoredOrder } from '@/components/checkout/Checkout';
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

  // Profile details
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState('');

  useEffect(() => onAuthStateChanged(firebaseAuth, setFirebaseUser), []);

  async function handleGoogleLogin() {
    setGoogleError('');
    setGoogleBusy(true);
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ idToken: await result.user.getIdToken() }),
      });
      if (!res.ok) throw new Error('Secure account session could not be created. Please try again.');
      setActiveTab('profile');
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
      await signOut(firebaseAuth).catch(() => {});
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleGoogleLogout() {
    setGoogleError('');
    setGoogleBusy(true);
    try {
      const res = await fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' });
      if (!res.ok) throw new Error('Could not end the server session.');
      await signOut(firebaseAuth);
      setOrders([]);
      setProfile({ name: '', email: '', phone: '', address: '', city: '' });
    } catch {
      setGoogleError('Sign-out failed. Please retry.');
    } finally {
      setGoogleBusy(false);
    }
  }


  // Order history
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (!open) return;
    try {
      // Load saved customer profile
      const profileKey = firebaseUser ? 'hello-customer-profile-' + firebaseUser.uid : 'hello-customer-profile-guest';
      setProfile({ name: firebaseUser?.displayName || '', email: firebaseUser?.email || '', phone: '', address: '', city: '' });
      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Load saved order history
      const savedOrders = localStorage.getItem('hello-order-history');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          // Never show another customer’s locally cached orders after account switching.
          const mine = firebaseUser?.email ? parsed.filter((o: StoredOrder) =>
            o.customer?.email?.toLowerCase() === firebaseUser.email?.toLowerCase()
          ) : [];
          setOrders(mine);
          // If no search input, prefill with the latest order reference
          if (!trackRef && parsed.length > 0) {
            setTrackRef(parsed[0].reference);
          }
        }
      }
    } catch {}
  }, [open, firebaseUser]);

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
      localStorage.setItem(firebaseUser ? 'hello-customer-profile-' + firebaseUser.uid : 'hello-customer-profile-guest', JSON.stringify(profile));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {}
  }

  const isGuest = !firebaseUser;

  return (
    <Modal open={open} onClose={onClose} title="HELLO! Account" drawer>
      <div className="profile-drawer-container">
        {/* User Card */}
        <div className="profile-hero-card">
          <div className="profile-avatar">
            {(firebaseUser?.displayName || profile.name) ? (firebaseUser?.displayName || profile.name).slice(0, 2).toUpperCase() : <UserRound size={20} />}
          </div>
          <div className="profile-info">
            <div className="profile-header-title">
              <h3>{firebaseUser?.displayName || (firebaseUser ? 'HELLO! Member' : 'Guest Explorer')}</h3>
              <span className={`profile-badge ${isGuest ? 'guest' : 'member'}`}>
                {isGuest ? 'GUEST' : 'MEMBER'}
              </span>
            </div>
            <p className="profile-email">
              {firebaseUser?.email || (isGuest ? 'Sign in to save your account securely' : 'Active Streetwear Profile')}
            </p>
          </div>
        </div>

        <div className="profile-google-auth" style={{ display: 'grid', gap: 8 }}>
          {firebaseUser ? (
            <button type="button" className="profile-save-btn" onClick={handleGoogleLogout} disabled={googleBusy}>
              {googleBusy ? 'SIGNING OUT…' : 'SIGN OUT'}
            </button>
          ) : (
            <button type="button" className="profile-save-btn" onClick={handleGoogleLogin} disabled={googleBusy}>
              {googleBusy ? 'CONNECTING…' : 'CONTINUE WITH GOOGLE'}
            </button>
          )}
          {googleError && <p role="alert" style={{ color: '#b91c1c', fontSize: 12 }}>{googleError}</p>}
        </div>

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
                <Sparkles size={16} color="#16a34a" />
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

                    <div className="order-card-footer">
                      <strong className="order-card-total">{money(order.total)}</strong>
                      <button
                        type="button"
                        className="order-track-btn"
                        onClick={() => {
                          setTrackRef(order.reference);
                          setActiveTab('track');
                          void handleTrackSubmit(undefined, order.reference);
                        }}
                      >
                        Track Shipment <ArrowRight size={13} />
                      </button>
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

        {/* Drawer Footer Actions */}
        <div className="profile-drawer-footer">
          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noreferrer"
            className="drawer-concierge-link"
          >
            <MessageCircle size={15} color="#25D366" />
            <span>WhatsApp Concierge Support</span>
            <ExternalLink size={12} />
          </a>
          <div className="drawer-sublinks">
            <Link href="/track-order" onClick={onClose}>Track Order Page</Link>
            <span>·</span>
            {/* Admin link is intentionally not exposed in the customer account drawer. */}
          </div>
        </div>
      </div>
    </Modal>
  );
}
