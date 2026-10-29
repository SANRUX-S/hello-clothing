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

      // Format structured WhatsApp order message
      const paymentText = paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'bank' ? 'Direct Bank Transfer' : 'Card / Online';
      const itemsList = fullOrder.items
        .map(it => `• *${it.name}* (${it.size} / ${it.color}) x ${it.quantity} - LKR ${(it.lineTotal / 100).toLocaleString()}`)
        .join('\n');

      const wpMessage = `🛒 *NEW ORDER - HELLO! CLOTHING*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Order Reference:* #${fullOrder.reference}\n` +
        `*Date:* ${new Date().toLocaleDateString('en-LK', { dateStyle: 'medium' })}\n\n` +
        `👤 *Customer Details:*\n` +
        `• Name: ${customerData.name}\n` +
        `• Phone: ${customerData.phone}\n` +
        `• Delivery Address: ${customerData.address}, ${customerData.city}\n` +
        `• Payment Method: ${paymentText}\n\n` +
        `📦 *Items Ordered:*\n` +
        `${itemsList}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Subtotal:* LKR ${(fullOrder.subtotal / 100).toLocaleString()}\n` +
        `*Delivery:* LKR ${(fullOrder.delivery / 100).toLocaleString()} (${deliveryMethod === 'express' ? 'Express 24h' : 'Standard 48-72h'})\n` +
        `*TOTAL AMOUNT:* LKR ${(fullOrder.total / 100).toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Please confirm my order and courier dispatch details. Thank you!`;

      const wpUrl = `https://wa.me/94786191260?text=${encodeURIComponent(wpMessage)}`;

      saveOrder(fullOrder);

      try {
        localStorage.setItem('hello-customer-profile', JSON.stringify(customerData));
      } catch {}

      store.clear();

      // Launch WhatsApp automatically
      try {
        window.open(wpUrl, '_blank');
      } catch {}

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

          <button
            disabled={busy || !store.ready}
            className="button dark"
            type="submit"
            style={{ background: '#16a34a', borderColor: '#15803d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '48px', fontSize: '12px', letterSpacing: '1px' }}
          >
            <MessageCircle size={18} />
            <span>{busy ? 'PREPARING ORDER…' : 'PLACE ORDER VIA WHATSAPP'}</span>
            <ArrowRight size={17} />
          </button>

          <p className="small muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
            <ShieldCheck size={14} color="#22c55e" /> Order will be saved and confirmed directly on HELLO! Official WhatsApp (+94 78 619 1260).
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
  const wpItems = (order?.items || [])
    .map(it => `• *${it.name}* (${it.size} / ${it.color}) x ${it.quantity} - LKR ${(it.lineTotal / 100).toLocaleString()}`)
    .join('\n');

  const fullWpMsg = `🛒 *ORDER CONFIRMATION - HELLO! CLOTHING*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `*Order Reference:* #${order?.reference || reference}\n` +
    `*Customer:* ${order?.customer?.name || 'Customer'} (${order?.customer?.phone || ''})\n` +
    `*Delivery Address:* ${order?.customer?.address || ''}, ${order?.customer?.city || ''}\n` +
    `*Total:* LKR ${((order?.total || 0) / 100).toLocaleString()}\n\n` +
    `*Items:*\n${wpItems}\n\n` +
    `Please confirm my dispatch and tracking details. Thank you!`;

  const whatsappUrl = `https://wa.me/94786191260?text=${encodeURIComponent(fullWpMsg)}`;

  return (
    <section className="receipt-page-wrapper">
      {isLoading ? (
        <div className="luxury-receipt-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #23252a', borderTopColor: '#4ade80', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Loading order <strong>{reference}</strong>…
          </p>
        </div>
      ) : order ? (
        <>
        <div className="receipt-whatsapp-banner no-print" style={{ background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.3) 0%, rgba(20, 83, 45, 0.2) 100%)', border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '12px', padding: '18px 22px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px' }}>
              <MessageCircle size={15} /> ORDER SAVED & WHATSAPP READY
            </span>
            <h3 style={{ margin: '6px 0 2px', fontSize: '15px', color: '#ffffff', fontWeight: 650 }}>Order #{order.reference} is ready for dispatch confirmation.</h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#d1d5db' }}>
              If WhatsApp didn't open automatically, click the button to send your receipt to our team (+94 78 619 1260).
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: '#052e16', fontWeight: 750, padding: '11px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.4px', flexShrink: 0 }}
          >
            <MessageCircle size={18} />
            OPEN IN WHATSAPP
            <ArrowRight size={16} />
          </a>
        </div>

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
                Official Order Receipt
              </span>
            </div>

            <div className="receipt-ref-col">
              <span className="receipt-ref-label">ORDER NUMBER</span>
              <div className="receipt-ref-pill">
                <span className="receipt-ref-code">{order.reference}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="receipt-copy-btn no-print"
                  title="Copy reference code"
                >
                  {copiedRef ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <span className="receipt-timestamp">
                {new Date(order.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          {/* Customer & Delivery & Payment Details */}
          <div className="receipt-meta-grid">
            <div className="receipt-meta-card">
              <span className="receipt-meta-label">Customer</span>
              <strong className="receipt-meta-val">{order.customer.name || 'Valued Customer'}</strong>
              <span className="receipt-meta-sub">{order.customer.phone || 'Phone on file'}</span>
              {order.customer.email && <span className="receipt-meta-sub">{order.customer.email}</span>}
            </div>

            <div className="receipt-meta-card">
              <span className="receipt-meta-label">Delivery Address</span>
              <strong className="receipt-meta-val">{order.customer.address}</strong>
              <span className="receipt-meta-sub">{order.customer.city}</span>
            </div>

            <div className="receipt-meta-card">
              <span className="receipt-meta-label">Payment Method</span>
              <strong className="receipt-meta-val" style={{ color: '#4ade80' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card'}
              </strong>
              <span className="receipt-meta-sub">
                {order.paymentMethod === 'cod' ? 'Cash payable upon delivery' : order.paymentMethod === 'bank' ? 'Deposit slip verification' : 'Paid'}
              </span>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="receipt-items-section">
            <div className="receipt-section-heading">
              <span>Items Ordered ({(order.items || []).length})</span>
            </div>

            {(order.items || []).map((item, i) => (
              <div key={i} className="receipt-item-row">
                <div className="receipt-item-left">
                  <div className="receipt-thumb-wrap">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="receipt-thumb-img" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#1c1f24' }} />
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
                  <span className="receipt-item-price">{money(item.lineTotal || (item.unitPrice * item.quantity))}</span>
                  <span className="receipt-item-unit">
                    {item.quantity > 1 ? `${money(item.unitPrice || item.lineTotal / item.quantity)} each` : 'Unit Price'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="receipt-ledger-section">
            <div className="receipt-ledger-box">
              <div className="ledger-line">
                <span>Subtotal:</span>
                <span className="ledger-val">{money(order.subtotal || order.total - order.delivery)}</span>
              </div>
              <div className="ledger-line">
                <span>Delivery:</span>
                <span className="ledger-val">{order.delivery === 0 ? 'FREE' : money(order.delivery || 50000)}</span>
              </div>
              <div className="ledger-total-line">
                <span className="ledger-total-label">TOTAL AMOUNT:</span>
                <span className="ledger-total-amount">{money(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Bank Transfer Instructions (Only if bank transfer) */}
          {order.paymentMethod === 'bank' && (
            <div className="receipt-payment-box bank" style={{ marginTop: '20px' }}>
              <div className="bank-header">
                <span>Commercial Bank of Ceylon Deposit Details:</span>
              </div>
              <div>
                Bank: <strong>Commercial Bank of Ceylon</strong> · Branch: <strong>Colombo City Branch</strong><br />
                Account Name: <strong>HELLO! CLOTHING PVT LTD</strong><br />
                Account Number: <strong>1000 2489 1234</strong>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ color: '#93c5fd', fontSize: '12px' }}>
                  Reference code: <strong>{order.reference}</strong>
                </span>
                <a
                  href={`https://wa.me/94786191260?text=${encodeURIComponent(`Hello! Here is the bank deposit slip for HELLO! order ${order.reference}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bank-wa-btn no-print"
                >
                  WhatsApp Slip to Us
                </a>
              </div>
            </div>
          )}
        </div>
        </>
      ) : (
        <div className="luxury-receipt-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '20px' }}>
            No order details found for reference <strong>{reference}</strong>.
          </p>
          <Link className="receipt-action-btn primary" href="/shop">
            EXPLORE THE COLLECTION
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

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="receipt-action-btn whatsapp"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: '#22c55e', color: '#4ade80' }}
          >
            <MessageCircle size={15} />
            CHAT ON WHATSAPP
          </a>

          <button
            type="button"
            className="receipt-action-btn primary"
            onClick={() => window.print()}
          >
            PRINT RECEIPT
          </button>

          <button
            type="button"
            className="receipt-action-btn"
            onClick={handleEmailReceipt}
            disabled={isEmailing}
          >
            {isEmailing ? 'SENDING…' : 'EMAIL RECEIPT'}
          </button>

          <Link
            className="receipt-action-btn"
            href="/shop"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      )}
    </section>
  );
}

