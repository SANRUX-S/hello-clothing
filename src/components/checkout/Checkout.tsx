'use client';
import { useState, useEffect, useSyncExternalStore, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Building2,
  Truck,
  ShoppingBag,
  Printer,
  Sparkles,
  Copy,
  Mail,
  ExternalLink,
  ShieldCheck,
  Phone,
  MapPin,
  MessageCircle,
  FileText,
  PackageCheck,
  Clock
} from 'lucide-react';
import './receipt.css';

import { useStore } from '@/store/store';
import { cartSubtotal } from '@/lib/cart';
import { products, money } from '@/lib/catalog';

type PaymentMethod = 'cod' | 'bank' | 'card';
type DeliveryMethod = 'standard' | 'express';

export type StoredOrder = {
  reference: string;
  currency: string;
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  createdAt: string;
  status?: string;
  courier?: string;
  tracking_number?: string;
  trackingNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  items: {
    productId: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image: string;
  }[];
};

export default function Checkout() {
  const store = useStore();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');

  const subtotal = cartSubtotal(store.cart);
  const deliveryFee = deliveryMethod === 'express' ? 75000 : subtotal >= 1000000 ? 0 : 50000;
  const grandTotal = subtotal + deliveryFee;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);

    const customerData = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      address: String(data.get('address') || '').trim(),
      city: String(data.get('city') || '').trim(),
      postalCode: String(data.get('postalCode') || '').trim() || undefined,
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: store.cart,
          customer: customerData,
          paymentMethod,
          deliveryMethod,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Please check your details and try again.');

      const fullOrder: StoredOrder = {
        reference: result.preview.reference,
        currency: result.preview.currency,
        subtotal: result.preview.subtotal,
        delivery: deliveryFee,
        total: result.preview.subtotal + deliveryFee,
        paymentMethod,
        deliveryMethod,
        status: result.preview.status || 'processing',
        courier: result.preview.courier || 'PromptX Logistics',
        tracking_number: result.preview.trackingNumber || `PX-${result.preview.reference.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`,
        trackingNumber: result.preview.trackingNumber || `PX-${result.preview.reference.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`,
        createdAt: new Date().toISOString(),
        customer: customerData,
        items: (result.preview.items as Array<{
          productId?: string;
          name: string;
          color: string;
          size: string;
          quantity: number;
          lineTotal: number;
          image: string;
        }>).map((item) => ({
          ...item,
          productId: item.productId || 'item',
          unitPrice: item.lineTotal / item.quantity,
        })),
      };

      saveOrder(fullOrder);

      // Save customer profile locally for convenience in account/checkout
      try {
        localStorage.setItem('hello-customer-profile', JSON.stringify(customerData));
      } catch {}

      // Clear the cart
      store.clear();

      router.push(`/order-confirmation/${fullOrder.reference}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not prepare your order. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (store.ready && !store.cart.length) {
    return (
      <section className="empty-state empty-page">
        <ShoppingBag size={45} strokeWidth={1} />
        <h1>First, find your favorites.</h1>
        <p>Add a piece to your bag to proceed through checkout.</p>
        <Link className="button dark" href="/shop">
          EXPLORE THE COLLECTION <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-page page-gutter">
      <Link href="/cart" className="text-link">
        <ArrowLeft size={14} /> BACK TO YOUR BAG
      </Link>
      <div className="page-heading">
        <span className="eyebrow">FINAL STEP</span>
        <h1>COMPLETE YOUR ORDER.</h1>
      </div>

      <form className="checkout-grid" onSubmit={submit}>
        <div className="checkout-fields">
          <h2>
            <span>01</span> SHIPPING & CONTACT DETAILS
          </h2>
          <div className="form-grid">
            <label>
              Full name
              <input
                required
                minLength={2}
                maxLength={120}
                name="name"
                autoComplete="name"
                placeholder="e.g. Ruwan Perera"
              />
            </label>
            <label>
              Email address
              <input
                required
                maxLength={254}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label>
              Phone number
              <input
                required
                minLength={7}
                maxLength={25}
                pattern="[+0-9 ()-]+"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="07X XXX XXXX"
              />
            </label>
            <label>
              City / Suburb
              <input
                required
                minLength={2}
                maxLength={100}
                name="city"
                autoComplete="address-level2"
                placeholder="e.g. Colombo 04 / Kandy"
              />
            </label>
            <label className="full-field">
              Delivery address
              <input
                required
                minLength={5}
                maxLength={300}
                name="address"
                autoComplete="street-address"
                placeholder="House No, Street, Apartment / Suite"
              />
            </label>
            <label>
              Postal code <span className="muted">(optional)</span>
              <input maxLength={12} name="postalCode" autoComplete="postal-code" placeholder="Postal code" />
            </label>
          </div>

          <h2>
            <span>02</span> DELIVERY SERVICE
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <label
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: deliveryMethod === 'standard' ? 'var(--fg)' : 'var(--line)',
              }}
              onClick={() => setDeliveryMethod('standard')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="delivery_opt"
                  checked={deliveryMethod === 'standard'}
                  onChange={() => setDeliveryMethod('standard')}
                />
                <Truck size={20} />
                <div>
                  <strong>Standard Islandwide Delivery (PromptX Logistics)</strong>
                  <p>2 to 4 business days · Full SMS tracking</p>
                </div>
              </div>
              <strong>{subtotal >= 1000000 ? 'FREE' : money(50000)}</strong>
            </label>

            <label
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: deliveryMethod === 'express' ? 'var(--fg)' : 'var(--line)',
              }}
              onClick={() => setDeliveryMethod('express')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="delivery_opt"
                  checked={deliveryMethod === 'express'}
                  onChange={() => setDeliveryMethod('express')}
                />
                <Sparkles size={20} />
                <div>
                  <strong>Express Colombo & Suburbs Priority</strong>
                  <p>Next-day guaranteed delivery across Western Province</p>
                </div>
              </div>
              <strong>{money(75000)}</strong>
            </label>
          </div>

          <h2>
            <span>03</span> PAYMENT METHOD
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'cod' ? 'var(--fg)' : 'var(--line)',
              }}
              onClick={() => setPaymentMethod('cod')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="payment_opt"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <CheckCircle2 size={20} color="#16a34a" />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay in cash directly to courier partner upon delivery</p>
                </div>
              </div>
            </label>

            <label
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'bank' ? 'var(--fg)' : 'var(--line)',
              }}
              onClick={() => setPaymentMethod('bank')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="payment_opt"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                />
                <Building2 size={20} />
                <div>
                  <strong>Direct Bank Transfer / Deposit</strong>
                  <p>Commercial Bank or Sampath Bank (Account details on confirmation)</p>
                </div>
              </div>
            </label>

            <label
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'card' ? 'var(--fg)' : 'var(--line)',
              }}
              onClick={() => setPaymentMethod('card')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="payment_opt"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <CreditCard size={20} />
                <div>
                  <strong>Credit / Debit Card (Visa, Mastercard, Amex)</strong>
                  <p>Instant secure payment gateway</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <aside className="order-summary">
          <h2>YOUR ORDER PIECES</h2>
          {store.cart.map((l, i) => {
            const p = products.find((prod) => prod.id === l.productId)!;
            return (
              <div className="checkout-item" key={i}>
                <img src={p.image} alt={p.name} width={64} height={80} />
                <div>
                  <strong>{p.name}</strong>
                  <span>
                    {l.color} / {l.size} · Qty {l.quantity}
                  </span>
                </div>
                <span>{money(p.price * l.quantity)}</span>
              </div>
            );
          })}

          <div className="summary-line">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>

          <div className="summary-line">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? 'FREE' : money(deliveryFee)}</span>
          </div>

          <div className="summary-line total">
            <strong>Total Amount</strong>
            <strong>{money(grandTotal)}</strong>
          </div>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <button disabled={busy || !store.ready} className="button dark" type="submit">
            {busy ? 'CONFIRMING ORDER…' : 'PLACE ORDER NOW'} <ArrowRight size={17} />
          </button>

          <p className="small muted">
            Protected by SSL encryption. You will receive an SMS confirmation and real-time courier tracking reference.
          </p>
        </aside>
      </form>
    </section>
  );
}

function saveOrder(order: StoredOrder) {
  try {
    sessionStorage.setItem('hello-order-preview', JSON.stringify(order));
    const history = JSON.parse(localStorage.getItem('hello-order-history') || '[]');
    history.unshift(order);
    localStorage.setItem('hello-order-history', JSON.stringify(history));
  } catch {}
  window.dispatchEvent(new Event('hello:preview'));
}

function previewSnapshot(): string {
  try {
    return sessionStorage.getItem('hello-order-preview') || '';
  } catch {
    return '';
  }
}

function subscribePreview(callback: () => void) {
  window.addEventListener('hello:preview', callback);
  return () => window.removeEventListener('hello:preview', callback);
}

function getStoredOrder(reference: string): StoredOrder | null {
  try {
    // 1. Check current session
    const sess = sessionStorage.getItem('hello-order-preview');
    if (sess) {
      const parsed = JSON.parse(sess);
      if (parsed?.reference === reference) return parsed;
    }

    // 2. Fallback to localStorage history
    const history: StoredOrder[] = JSON.parse(localStorage.getItem('hello-order-history') || '[]');
    const found = history.find((o) => o.reference === reference);
    if (found) return found;

    return null;
  } catch {
    return null;
  }
}

export function OrderConfirmation({ reference }: { reference: string }) {
  useSyncExternalStore(subscribePreview, previewSnapshot, () => '');
  const localOrder = getStoredOrder(reference);
  const [dbOrder, setDbOrder] = useState<StoredOrder | null>(null);
  const [isLoading, setIsLoading] = useState(!localOrder);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/track?ref=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.order) {
          setDbOrder({
            reference: d.order.reference,
            currency: 'LKR',
            subtotal: d.order.subtotal,
            delivery: d.order.delivery,
            total: d.order.total,
            paymentMethod: d.order.payment_method || 'cod',
            deliveryMethod: 'standard',
            status: d.order.status || 'processing',
            courier: d.order.courier || 'PromptX Logistics',
            tracking_number: d.order.tracking_number || '',
            createdAt: d.order.created_at || d.order.createdAt || new Date().toISOString(),
            customer: d.order.customer || { name: 'Valued Customer', email: '', phone: '', address: '', city: 'Colombo' },
            items: Array.isArray(d.order.items) ? d.order.items : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reference]);

  const order = localOrder || dbOrder;

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 3000);
  };

  const handleEmailReceipt = async () => {
    if (!order) return;
    setIsEmailing(true);
    setEmailNotice('');
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: order.reference, action: 'resend_email' }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailNotice(`Receipt copy dispatched to ${order.customer.email || 'your email'} via orders@helloclothing.store`);
      } else {
        setEmailNotice(data.error || 'Failed to dispatch email.');
      }
    } catch {
      setEmailNotice('Network request failed. Please check your connection.');
    } finally {
      setIsEmailing(false);
      setTimeout(() => setEmailNotice(''), 7000);
    }
  };

  const cleanPhone = (order?.customer?.phone || '').replace(/[^0-9]/g, '');
  const wpPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.slice(1) : cleanPhone;
  const whatsappUrl = `https://wa.me/94786191260?text=${encodeURIComponent(
    `Hello HELLO! Clothing, I have a query regarding my order receipt ${order?.reference || reference}.`
  )}`;

  const orderStatus = (order?.status || 'order_placed').toLowerCase();
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
  const trackingCode = order ? (order.tracking_number || order.trackingNumber || `PX-${order.reference.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`) : '';

  return (
    <section className="receipt-page-wrapper">
      {/* Hero Header */}
      <div className="receipt-hero-banner no-print">
        <div className="receipt-badge-pill">
          <span className="receipt-badge-dot" />
          <span>OFFICIAL DISPATCH REGISTERED</span>
        </div>
        <h1 className="receipt-hero-title">LOOKING GOOD.</h1>
        <p className="receipt-hero-subtitle">
          Your order is confirmed and secured in our Colombo atelier fulfillment hub. Below is your official parcel note and tax invoice.
        </p>
      </div>

      {isLoading ? (
        <div className="luxury-receipt-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #23252a', borderTopColor: '#4ade80', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Verifying order <strong>{reference}</strong> with fulfillment database…
          </p>
        </div>
      ) : order ? (
        <div id="hello-printable-receipt" className="luxury-receipt-card">
          {/* Top Document Header */}
          <div className="receipt-header-row">
            <div className="receipt-brand-col">
              <img
                src="/branding/hello-light.webp"
                alt="HELLO! Clothing"
                className="receipt-logo-img"
              />
              <span className="receipt-brand-tagline">
                Heavyweight Streetwear Atelier · Colombo
              </span>
              <span className="receipt-brand-note">
                Official Dispatch Note & Tax Invoice · VAT Registered
              </span>
            </div>

            <div className="receipt-ref-col">
              <span className="receipt-ref-label">ORDER REFERENCE</span>
              <div className="receipt-ref-pill">
                <span className="receipt-ref-code">{order.reference}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="receipt-copy-btn no-print"
                  title="Copy reference code"
                >
                  <Copy size={11} /> {copiedRef ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <span className="receipt-timestamp">
                {new Date(order.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div className="receipt-stepper-wrap">
            <div className="receipt-stepper-title">
              <span>Fulfillment & Dispatch Pipeline</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>PromptX Express</span>
            </div>
            <div className="receipt-stepper-grid">
              <div className={`stepper-step ${currentRank > 0 ? 'completed' : 'active'}`}>
                <div className="stepper-icon-bubble">
                  <Check size={14} />
                </div>
                <span className="stepper-step-name">1. Placed</span>
                <span className="stepper-step-desc">Order Registered</span>
              </div>

              <div className={`stepper-step ${currentRank > 1 ? 'completed' : currentRank === 1 ? 'active' : ''}`}>
                <div className="stepper-icon-bubble">
                  {currentRank > 1 ? <Check size={14} /> : <Sparkles size={14} />}
                </div>
                <span className="stepper-step-name">2. In Progress</span>
                <span className="stepper-step-desc">QC & Hand-Packed</span>
              </div>

              <div className={`stepper-step ${currentRank > 2 ? 'completed' : currentRank === 2 ? 'active' : ''}`}>
                <div className="stepper-icon-bubble">
                  {currentRank > 2 ? <Check size={14} /> : <Truck size={14} />}
                </div>
                <span className="stepper-step-name">3. Dispatched</span>
                <span className="stepper-step-desc">PromptX Courier</span>
              </div>

              <div className={`stepper-step ${currentRank > 3 ? 'completed' : currentRank === 3 ? 'active' : ''}`}>
                <div className="stepper-icon-bubble">
                  {currentRank > 3 ? <Check size={14} /> : <Clock size={14} />}
                </div>
                <span className="stepper-step-name">4. Out for Delivery</span>
                <span className="stepper-step-desc">Rider on the Way</span>
              </div>

              <div className={`stepper-step ${currentRank >= 4 ? 'completed' : ''}`}>
                <div className="stepper-icon-bubble">
                  <CheckCircle2 size={14} />
                </div>
                <span className="stepper-step-name">5. Received</span>
                <span className="stepper-step-desc">To Your Doorstep</span>
              </div>
            </div>
          </div>

          {/* Dossier Grid (Customer + Logistics) */}
          <div className="receipt-dossier-grid">
            <div className="receipt-dossier-card">
              <div className="dossier-card-header">
                <MapPin size={14} color="#4ade80" />
                <span>Destination Dossier</span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Customer</span>
                <span className="dossier-val">{order.customer.name || 'Valued Customer'}</span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Address</span>
                <span className="dossier-val">
                  {order.customer.address}, {order.customer.city}
                  {order.customer.postalCode ? ` (${order.customer.postalCode})` : ''}
                </span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Phone</span>
                <span className="dossier-val">{order.customer.phone || 'On file'}</span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Dispatch Email</span>
                <span className="dossier-val" style={{ fontSize: '11px' }}>
                  {order.customer.email || 'customer@onfile'}
                </span>
              </div>
            </div>

            <div className="receipt-dossier-card">
              <div className="dossier-card-header">
                <Truck size={14} color="#4ade80" />
                <span>Logistics & Dispatch Dossier</span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Courier Partner</span>
                <span className="dossier-val">{order.courier || 'PromptX Logistics'}</span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Waybill Tracking</span>
                <span className="dossier-val dossier-val-highlight">#{trackingCode}</span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Payment Method</span>
                <span className="dossier-val" style={{ textTransform: 'uppercase' }}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card'}
                </span>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Estimated Transit</span>
                <span className="dossier-val">1 - 3 Business Days</span>
              </div>
            </div>
          </div>

          {/* Parcel Merchandise Breakdown */}
          <div className="receipt-items-section">
            <div className="receipt-section-heading">
              <span>Parcel Contents ({order.items.length} {order.items.length === 1 ? 'Item' : 'Items'})</span>
              <span style={{ fontSize: '10px', color: '#6b7280' }}>Heavyweight Combed Cotton</span>
            </div>

            {order.items.map((item, i) => (
              <div key={i} className="receipt-item-row">
                <div className="receipt-item-left">
                  <div className="receipt-thumb-wrap">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="receipt-thumb-img" />
                    ) : (
                      <ShoppingBag size={20} color="#6b7280" />
                    )}
                  </div>
                  <div className="receipt-item-info">
                    <span className="receipt-item-title">{item.name}</span>
                    <div className="receipt-item-tags">
                      <span className="receipt-item-tag-pill">Color: {item.color || 'Standard'}</span>
                      <span className="receipt-item-tag-pill">Size: {item.size || 'M'}</span>
                      <span className="receipt-item-tag-pill">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="receipt-item-right">
                  <span className="receipt-item-price">{money(item.lineTotal)}</span>
                  <span className="receipt-item-unit">
                    {item.quantity > 1 ? `${money(item.unitPrice || item.lineTotal / item.quantity)} each` : 'Unit Price'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Ledger Section */}
          <div className="receipt-ledger-section">
            <div className="receipt-ledger-box">
              <div className="ledger-line">
                <span>Merchandise Subtotal:</span>
                <span className="ledger-val">{money(order.subtotal || order.total - order.delivery)}</span>
              </div>
              <div className="ledger-line">
                <span>Islandwide Courier Delivery:</span>
                <span className="ledger-val">{order.delivery === 0 ? 'FREE' : money(order.delivery || 50000)}</span>
              </div>
              <div className="ledger-line">
                <span>Applicable Local Taxes:</span>
                <span className="ledger-val" style={{ color: '#4ade80', fontSize: '11px' }}>Included (0% Additional)</span>
              </div>
              <div className="ledger-total-line">
                <span className="ledger-total-label">TOTAL AMOUNT:</span>
                <span className="ledger-total-amount">{money(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Specific Guidance */}
          {order.paymentMethod === 'cod' && (
            <div className="receipt-payment-box cod">
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                💵 Cash on Delivery (COD) Instructions:
              </strong>
              Please have the exact cash amount of <strong>{money(order.total)}</strong> ready for the PromptX courier delivery rider upon arrival. You may inspect the tamper-evident exterior seal before handing over cash.
            </div>
          )}

          {order.paymentMethod === 'bank' && (
            <div className="receipt-payment-box bank">
              <div className="bank-header">
                <Building2 size={16} />
                <span>Commercial Bank of Ceylon Deposit Details:</span>
              </div>
              <div>
                Bank: <strong>Commercial Bank of Ceylon</strong> · Branch: <strong>Colombo City Branch</strong><br />
                Account Name: <strong>HELLO! CLOTHING PVT LTD</strong><br />
                Account Number: <strong>1000 2489 1234</strong>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ color: '#93c5fd' }}>
                  Reference code for transfer: <strong>{order.reference}</strong>
                </span>
                <a
                  href={`https://wa.me/94786191260?text=${encodeURIComponent(`Hello! Here is the bank deposit slip for HELLO! order ${order.reference}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bank-wa-btn no-print"
                >
                  <MessageCircle size={14} /> WhatsApp Slip to Us
                </a>
              </div>
            </div>
          )}

          {/* Barcode & Guarantee Footer */}
          <div className="receipt-barcode-footer">
            <div className="receipt-guarantee-note">
              <strong>HELLO! Clothing Atelier Sri Lanka</strong> · Hand-Packed in Colombo<br />
              7-Day Hassle-Free Size Exchanges Guaranteed · Support: <a href="mailto:orders@helloclothing.store" style={{ color: '#9ca3af', textDecoration: 'underline' }}>orders@helloclothing.store</a>
            </div>

            <div className="receipt-barcode-box">
              <svg className="barcode-svg" viewBox="0 0 160 40" fill="currentColor">
                <rect x="0" y="0" width="3" height="40" />
                <rect x="5" y="0" width="1.5" height="40" />
                <rect x="9" y="0" width="4" height="40" />
                <rect x="15" y="0" width="2" height="40" />
                <rect x="19" y="0" width="1" height="40" />
                <rect x="23" y="0" width="3.5" height="40" />
                <rect x="29" y="0" width="1.5" height="40" />
                <rect x="33" y="0" width="4" height="40" />
                <rect x="40" y="0" width="2" height="40" />
                <rect x="44" y="0" width="3" height="40" />
                <rect x="50" y="0" width="1.5" height="40" />
                <rect x="54" y="0" width="4.5" height="40" />
                <rect x="61" y="0" width="2" height="40" />
                <rect x="66" y="0" width="3.5" height="40" />
                <rect x="72" y="0" width="1" height="40" />
                <rect x="76" y="0" width="4" height="40" />
                <rect x="83" y="0" width="2.5" height="40" />
                <rect x="88" y="0" width="1.5" height="40" />
                <rect x="92" y="0" width="4" height="40" />
                <rect x="98" y="0" width="2" height="40" />
                <rect x="103" y="0" width="3.5" height="40" />
                <rect x="109" y="0" width="1" height="40" />
                <rect x="113" y="0" width="4.5" height="40" />
                <rect x="120" y="0" width="2" height="40" />
                <rect x="124" y="0" width="3" height="40" />
                <rect x="130" y="0" width="1.5" height="40" />
                <rect x="134" y="0" width="4" height="40" />
                <rect x="141" y="0" width="2.5" height="40" />
                <rect x="146" y="0" width="3" height="40" />
                <rect x="152" y="0" width="1.5" height="40" />
                <rect x="156" y="0" width="4" height="40" />
              </svg>
              <span className="barcode-caption">{trackingCode}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="luxury-receipt-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '20px' }}>
            No order details found for reference <strong>{reference}</strong>.
          </p>
          <Link className="receipt-action-btn primary" href="/shop">
            EXPLORE THE COLLECTION <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Action Buttons Toolbar (Hidden when printed) */}
      {order && (
        <div className="receipt-actions-toolbar no-print">
          {emailNotice && (
            <div style={{ width: '100%', background: '#052e16', border: '1px solid #166534', color: '#4ade80', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
              ✓ {emailNotice}
            </div>
          )}

          <button
            type="button"
            className="receipt-action-btn primary"
            onClick={() => window.print()}
          >
            <Printer size={16} /> PRINT RECEIPT / PDF
          </button>

          <Link
            className="receipt-action-btn"
            href={`/track-order?ref=${encodeURIComponent(order.reference)}`}
          >
            <Truck size={16} /> TRACK LIVE DISPATCH
          </Link>

          <button
            type="button"
            className="receipt-action-btn"
            onClick={handleEmailReceipt}
            disabled={isEmailing}
          >
            <Mail size={16} /> {isEmailing ? 'SENDING…' : 'EMAIL RECEIPT COPY'}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="receipt-action-btn whatsapp"
          >
            <MessageCircle size={16} /> WHATSAPP CONCIERGE
          </a>

          <Link
            className="receipt-action-btn"
            href="/shop"
          >
            SHOP MORE <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}

