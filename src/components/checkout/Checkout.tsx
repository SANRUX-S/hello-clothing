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
  FileText
} from 'lucide-react';

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
      .catch(() => {});
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

  return (
    <section className="confirmation-page page-gutter" style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'left' }}>
      <div className="no-print" style={{ textAlign: 'center', width: '100%', marginBottom: '1rem' }}>
        <span className="confirmation-symbol" style={{ margin: '0 auto 12px' }}>
          <Check size={36} strokeWidth={1.5} color="#4ade80" />
        </span>
        <span className="eyebrow" style={{ color: '#4ade80', letterSpacing: '2px', fontWeight: 700 }}>
          ORDER CONFIRMED & REGISTERED
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', margin: '6px 0 10px' }}>
          LOOKING GOOD.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
          Thank you for choosing HELLO! Clothing Colombo. Your parcel is registered in our fulfillment hub and being prepared for dispatch.
        </p>
      </div>

      {order ? (
        <div
          id="hello-printable-receipt"
          className="receipt-card"
          style={{
            width: '100%',
            background: '#121314',
            border: '1px solid #27282b',
            borderRadius: '12px',
            padding: '32px 30px',
            color: '#ededed',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Official Document Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid #27282b',
              paddingBottom: '20px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <img src="/branding/hello-light.webp" alt="HELLO!" style={{ height: "30px", width: "auto", marginBottom: "6px", display: "block", objectFit: "contain" }} />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888' }}>
                Heavyweight Streetwear · Colombo, Sri Lanka
              </span>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                Official Dispatch Receipt & Tax Note · VAT Registered
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                ORDER REFERENCE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginTop: '2px' }}>
                <strong style={{ fontSize: '18px', letterSpacing: '1px', color: '#4ade80' }}>
                  {order.reference}
                </strong>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="no-print"
                  style={{
                    background: '#1f2022',
                    border: '1px solid #333',
                    color: '#ccc',
                    borderRadius: '4px',
                    padding: '3px 7px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Copy reference code"
                >
                  <Copy size={11} /> {copiedRef ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                {new Date(order.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* Quick Status Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '16px 0',
              borderBottom: '1px solid #27282b',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', display: 'block' }}>
                FULFILLMENT STATUS
              </span>
              <strong style={{ color: order.status === 'delivered' ? '#4ade80' : '#38bdf8' }}>
                {order.status === 'delivered'
                  ? 'DELIVERED TO DOORSTEP'
                  : order.status === 'dispatched'
                  ? 'HANDED TO COURIER (EN ROUTE)'
                  : 'CONFIRMED & PREPARING'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', display: 'block' }}>
                COURIER PARTNER
              </span>
              <strong>{order.courier || 'PromptX Logistics (Islandwide)'}</strong>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', display: 'block' }}>
                WAYBILL TRACKING #
              </span>
              <strong style={{ color: '#4ade80' }}>
                #{order.tracking_number || order.trackingNumber || `PX-${order.reference.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', display: 'block' }}>
                PAYMENT METHOD
              </span>
              <strong style={{ color: '#fff', textTransform: 'uppercase' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', display: 'block' }}>
                DELIVERY SERVICE
              </span>
              <strong style={{ color: '#fff' }}>
                {order.deliveryMethod === 'express' ? 'Express Priority (Next-Day)' : 'Standard Islandwide (2-4 Days)'}
              </strong>
            </div>
          </div>

          {/* Customer & Destination Dossier */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              padding: '18px 0',
              borderBottom: '1px solid #27282b',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>
                DELIVER TO (CUSTOMER)
              </span>
              <strong style={{ fontSize: '14px', color: '#fff', display: 'block' }}>
                {order.customer.name || 'Valued Customer'}
              </strong>
              <div style={{ color: '#aaa', marginTop: '4px' }}>
                {order.customer.address}<br />
                {order.customer.city}{order.customer.postalCode ? `, ${order.customer.postalCode}` : ''}<br />
                Sri Lanka
              </div>
              <div style={{ marginTop: '6px', color: '#888' }}>
                Phone: <strong style={{ color: '#fff' }}>{order.customer.phone}</strong>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>
                COMMUNICATION CHANNELS
              </span>
              <div style={{ color: '#aaa' }}>
                Email: <strong style={{ color: '#fff' }}>{order.customer.email || 'customer on file'}</strong>
              </div>
              <div style={{ display: 'inline-block', background: '#052e16', border: '1px solid #166534', color: '#4ade80', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', marginTop: '8px' }}>
                ✓ Official Receipt sent via orders@helloclothing.store
              </div>
              <div style={{ fontSize: '11px', color: '#777', marginTop: '8px' }}>
                Estimated Delivery: 1 to 3 business days across Western Province & islandwide.
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div style={{ padding: '20px 0', borderBottom: '1px solid #27282b' }}>
            <span style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '12px' }}>
              PARCEL MERCHANDISE BREAKDOWN ({order.items.length} ITEMS)
            </span>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27282b', color: '#777', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '10px' }}>ITEM DESCRIPTION</th>
                  <th style={{ textAlign: 'center', paddingBottom: '10px' }}>COLOR / SIZE</th>
                  <th style={{ textAlign: 'center', paddingBottom: '10px' }}>QTY</th>
                  <th style={{ textAlign: 'right', paddingBottom: '10px' }}>UNIT PRICE</th>
                  <th style={{ textAlign: 'right', paddingBottom: '10px' }}>LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e1f21' }}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', background: '#222' }}
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={18} color="#666" />
                          </div>
                        )}
                        <div>
                          <strong style={{ color: '#fff', fontSize: '13px', display: 'block' }}>{item.name}</strong>
                          <span style={{ color: '#777', fontSize: '11px' }}>Heavyweight Combed Streetwear</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
                      {item.color} / {item.size}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', color: '#aaa', fontSize: '12px' }}>
                      {money(item.unitPrice || item.lineTotal / item.quantity)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                      {money(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '18px 0', borderBottom: '1px solid #27282b' }}>
            <div style={{ width: '100%', maxWidth: '320px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '6px' }}>
                <span>Merchandise Subtotal:</span>
                <span style={{ color: '#fff' }}>{money(order.subtotal || order.total - order.delivery)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '6px' }}>
                <span>Islandwide Courier Delivery:</span>
                <span style={{ color: '#fff' }}>{order.delivery === 0 ? 'FREE' : money(order.delivery || 50000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '8px' }}>
                <span>Applicable Local Taxes:</span>
                <span style={{ color: '#4ade80', fontSize: '11px' }}>Included (0% Additional)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #333',
                  paddingTop: '10px',
                  fontSize: '16px',
                  fontWeight: 900,
                }}
              >
                <span style={{ color: '#fff' }}>TOTAL AMOUNT:</span>
                <span style={{ color: '#4ade80' }}>{money(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Specific Guidance */}
          {order.paymentMethod === 'cod' && (
            <div style={{ marginTop: '16px', padding: '14px 16px', background: '#171819', border: '1px solid #282a2d', borderRadius: '8px', fontSize: '12px', color: '#ccc', lineHeight: 1.5 }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>
                💵 Cash on Delivery (COD) Instructions:
              </strong>
              Please have exact cash amount of <strong>{money(order.total)}</strong> ready for the PromptX courier delivery rider upon arrival. You may inspect the tamper-evident exterior seal before handing over cash.
            </div>
          )}

          {order.paymentMethod === 'bank' && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#0e1726', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6 }}>
              <strong style={{ color: '#38bdf8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                🏦 Commercial Bank of Ceylon Deposit Details:
              </strong>
              Bank: <strong>Commercial Bank of Ceylon</strong> · Branch: <strong>Colombo City Branch</strong><br />
              Account Name: <strong>HELLO! CLOTHING PVT LTD</strong><br />
              Account Number: <strong>1000 2489 1234</strong><br />
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#94a3b8' }}>
                  Reference code for transfer: <strong>{order.reference}</strong>
                </span>
                <a
                  href={`https://wa.me/94786191260?text=${encodeURIComponent(`Hello! Here is the bank deposit slip for HELLO! order ${order.reference}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="no-print"
                  style={{
                    background: '#25D366',
                    color: '#000',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp Slip to Us
                </a>
              </div>
            </div>
          )}

          {/* Guarantee & Terms Note */}
          <div style={{ marginTop: '20px', padding: '12px 0 0', fontSize: '11px', color: '#666', borderTop: '1px solid #1f2022', lineHeight: 1.6, textAlign: 'center' }}>
            HELLO! Clothing Sri Lanka · Designed & Hand-Packed in Colombo · 7-Day Hassle-Free Size Swaps Guaranteed<br />
            Questions? Email <a href="mailto:orders@helloclothing.store" style={{ color: '#888', textDecoration: 'underline' }}>orders@helloclothing.store</a> or reach WhatsApp Support at <strong>+94 78 619 1260</strong>.
          </div>
        </div>
      ) : (
        <div className="confirmation-summary" style={{ textAlign: 'center', padding: '40px 20px', background: '#121314', border: '1px solid #27282b', borderRadius: '12px' }}>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
            No order details found for reference <strong>{reference}</strong>.
          </p>
          <Link className="button dark" href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            EXPLORE THE COLLECTION <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {/* Action Buttons Toolbar (Hidden when printed) */}
      {order && (
        <div className="no-print" style={{ width: '100%', marginTop: '20px' }}>
          {emailNotice && (
            <div style={{ background: '#052e16', border: '1px solid #166534', color: '#4ade80', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
              ✓ {emailNotice}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="button dark"
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
            >
              <Printer size={16} /> PRINT RECEIPT / PDF
            </button>

            <Link
              className="button outline"
              href={`/track-order?ref=${encodeURIComponent(order.reference)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', textDecoration: 'none' }}
            >
              <Truck size={16} /> TRACK LIVE DISPATCH
            </Link>

            <button
              type="button"
              className="button outline"
              onClick={handleEmailReceipt}
              disabled={isEmailing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
            >
              <Mail size={16} /> {isEmailing ? 'SENDING…' : 'EMAIL RECEIPT COPY'}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="button outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', textDecoration: 'none', color: '#25D366', borderColor: '#166534' }}
            >
              <MessageCircle size={16} /> WHATSAPP CONCIERGE
            </a>

            <Link
              className="button outline"
              href="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', textDecoration: 'none' }}
            >
              SHOP MORE <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

