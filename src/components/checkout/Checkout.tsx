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
  Clock,
  Lock,
  Smartphone,
  Calendar,
} from 'lucide-react';
import './receipt.css';

import { useStore } from '@/store/store';
import { cartSubtotal } from '@/lib/cart';
import { products, money } from '@/lib/catalog';

type PaymentMethod = 'card' | 'wallet' | 'cod' | 'bank';
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

function VisaLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '22px',
        padding: '0 6px',
        borderRadius: '3px',
        background: '#ffffff',
        border: '1px solid var(--line)',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: '11px',
        color: '#1a1f71',
        letterSpacing: '0.8px',
        lineHeight: 1,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      VISA
    </span>
  );
}

function MastercardLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '22px',
        padding: '0 5px',
        borderRadius: '3px',
        background: '#ffffff',
        border: '1px solid var(--line)',
      }}
    >
      <svg width="22" height="14" viewBox="0 0 28 18" fill="none">
        <circle cx="9" cy="9" r="8" fill="#EB001B" />
        <circle cx="19" cy="9" r="8" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    </span>
  );
}

function AmexLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '22px',
        padding: '0 5px',
        borderRadius: '3px',
        background: '#006fcf',
        border: '1px solid #005bb5',
        fontWeight: 800,
        fontSize: '8px',
        color: '#ffffff',
        letterSpacing: '0.6px',
        lineHeight: 1,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      AMEX
    </span>
  );
}

function WalletPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '22px',
        padding: '0 7px',
        borderRadius: '3px',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        fontWeight: 700,
        fontSize: '9px',
        color: 'var(--ink)',
        letterSpacing: '0.5px',
        lineHeight: 1,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  );
}

function FriMiLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: '#f25a24',
        boxShadow: '0 2px 6px rgba(242, 90, 36, 0.35)',
        flexShrink: 0,
      }}
      title="Nations Trust FriMi"
    >
      <span
        style={{
          color: '#ffffff',
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: '10px',
          letterSpacing: '-0.3px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        FriMi
      </span>
    </span>
  );
}

function QPlusLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: '#ffffff',
        border: '1px solid #e4e4e7',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
      title="Commercial Bank Q+"
    >
      <span
        style={{
          fontWeight: 900,
          fontSize: '13px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #ea580c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
        }}
      >
        Q<sup>+</sup>
      </span>
    </span>
  );
}

function IPayLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#00609C',
        boxShadow: '0 2px 6px rgba(0, 96, 156, 0.35)',
        flexShrink: 0,
      }}
      title="LOLC iPay"
    >
      <span
        style={{
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '9.5px',
          letterSpacing: '-0.2px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        iPay
      </span>
    </span>
  );
}

function GooglePayBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        height: '24px',
        padding: '0 9px',
        borderRadius: '12px',
        background: '#202124',
        color: '#ffffff',
        fontSize: '10px',
        fontWeight: 600,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
      title="Google Pay"
    >
      Pay with
      <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 800 }}>
        <span style={{ color: '#4285F4' }}>G</span>
        <span style={{ color: '#EA4335' }}>o</span>
        <span style={{ color: '#FBBC05' }}>o</span>
        <span style={{ color: '#4285F4' }}>g</span>
        <span style={{ color: '#34A853' }}>l</span>
        <span style={{ color: '#EA4335' }}>e</span>
      </span>
      Pay
    </span>
  );
}

function PayHereLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <path d="M8 6H24C30.6274 6 36 11.3726 36 18C36 24.6274 30.6274 30 24 30H16L12 36H6L11 26H24C28.4183 26 32 22.4183 32 18C32 13.5817 28.4183 10 24 10H14L8 6Z" fill="#0056b3" />
        <path d="M12 12H24C27.3137 12 30 14.6863 30 18C30 21.3137 27.3137 24 24 24H15L12 12Z" fill="#0080ff" />
      </svg>
      <span style={{ fontSize: '20px', fontWeight: 900, color: '#0056b3', letterSpacing: '-0.5px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        Pay<span style={{ color: '#0284c7' }}>Here</span>
      </span>
    </span>
  );
}

function VisaCardBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '24px',
        padding: '0 8px',
        borderRadius: '4px',
        background: '#0a2540',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: '12px',
        color: '#ffffff',
        letterSpacing: '1px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      VISA
    </span>
  );
}

function MastercardBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        height: '24px',
        padding: '0 8px',
        borderRadius: '4px',
        background: '#18181b',
      }}
    >
      <svg width="24" height="15" viewBox="0 0 28 18" fill="none">
        <circle cx="9" cy="9" r="8" fill="#EB001B" />
        <circle cx="19" cy="9" r="8" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
      <span style={{ fontSize: '9px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>mastercard</span>
    </span>
  );
}

export default function Checkout() {
  const store = useStore();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');

  // Card payment inputs (Image 2 format)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  function handleCardNumberChange(val: string) {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  }

  function handleExpiryChange(val: string) {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  }

  const subtotal = cartSubtotal(store.cart);
  const deliveryFee = deliveryMethod === 'express' ? 75000 : subtotal >= 1000000 ? 0 : 50000;
  const grandTotal = subtotal + deliveryFee;

  // Load PayHere JavaScript SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('payhere-sdk')) {
      const script = document.createElement('script');
      script.id = 'payhere-sdk';
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    // Validate card inputs if paying with credit/debit card
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length !== 16) {
        setError('Please enter a valid 16-digit Visa or Mastercard number.');
        setBusy(false);
        return;
      }
      if (!cardName.trim()) {
        setError('Please enter the name on your card.');
        setBusy(false);
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError('Please enter expiry date as MM/YY.');
        setBusy(false);
        return;
      }
      const [expMonth] = cardExpiry.split('/').map(Number);
      if (expMonth < 1 || expMonth > 12) {
        setError('Invalid expiry month. Must be between 01 and 12.');
        setBusy(false);
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter the 3 or 4 digit CVV on the back of your card.');
        setBusy(false);
        return;
      }
    }

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
        status: result.preview.status || (paymentMethod === 'card' || paymentMethod === 'wallet' ? 'pending_payment' : 'pending_confirmation'),
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

      // 1. If Paying via Card or Mobile Wallet, launch PayHere payment panel
      if ((paymentMethod === 'card' || paymentMethod === 'wallet') && result.payhere) {
        saveOrder(fullOrder);
        try {
          localStorage.setItem('hello-customer-profile', JSON.stringify(customerData));
        } catch {}

        store.clear();

        // Check if PayHere JS SDK is loaded and startPayment is available for modal popup
        const win = window as any;
        if (win.payhere && typeof win.payhere.startPayment === 'function') {
          win.payhere.onCompleted = function onCompleted(orderId: string) {
            router.push(`/order-confirmation/${fullOrder.reference}`);
          };
          win.payhere.onDismissed = function onDismissed() {
            setBusy(false);
          };
          win.payhere.onError = function onError(errorMsg: string) {
            setError(`Payment error: ${errorMsg}`);
            setBusy(false);
          };
          win.payhere.startPayment(result.payhere);
          return;
        }

        // Direct secure form submit fallback (clean full-page redirection)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.payhere.sandbox
          ? 'https://sandbox.payhere.lk/pay/checkout'
          : 'https://www.payhere.lk/pay/checkout';

        for (const key of Object.keys(result.payhere)) {
          const hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = key;
          hidden.value = String((result.payhere as any)[key]);
          form.appendChild(hidden);
        }

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // 2. If COD or Bank Transfer, route with structured WhatsApp confirmation
      const paymentText = paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer';
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* 1. Credit / Debit Card (Option 1 at top - Image 2) */}
            <div
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'card' ? '#2563eb' : 'var(--line)',
                background: paymentMethod === 'card' ? '#f8fafc' : 'transparent',
                transition: 'all 0.2s ease',
                borderRadius: '8px',
                padding: '16px',
              }}
              onClick={() => setPaymentMethod('card')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <CreditCard size={20} strokeWidth={1.5} color={paymentMethod === 'card' ? '#2563eb' : 'currentColor'} />
                  <div>
                    <strong style={{ fontSize: '13px' }}>Pay with Credit or Debit Card</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                      Visa and Mastercard accepted
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto' }}>
                  <VisaCardBadge />
                  <MastercardBadge />
                </div>
              </div>

              {/* Exact Card Details Panel from Image 2 */}
              {paymentMethod === 'card' && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '20px 22px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    boxShadow: '0 4px 18px -2px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header: PayHere & Secure Payment */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                    <PayHereLogo />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontSize: '13px', fontWeight: 700 }}>
                      <Lock size={15} color="#16a34a" strokeWidth={2.4} />
                      <span>Secure Payment</span>
                    </div>
                  </div>

                  {/* Soft Blue Card Header Box (matches Image 2) */}
                  <div
                    style={{
                      background: '#f0f7ff',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>
                        <CreditCard size={24} strokeWidth={1.8} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', fontWeight: 700 }}>
                          Pay with Credit or Debit Card
                        </strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          We only accept Visa and Mastercard.
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
                      <VisaCardBadge />
                      <MastercardBadge />
                    </div>
                  </div>

                  {/* Card Form Inputs (matches Image 2) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Card Number */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        Card Number
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          maxLength={19}
                          style={{
                            width: '100%',
                            height: '42px',
                            paddingLeft: '38px',
                            paddingRight: '12px',
                            borderRadius: '8px',
                            border: '1.5px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#0f172a',
                            letterSpacing: '1.2px',
                            fontWeight: 500,
                            outline: 'none',
                            background: '#ffffff',
                          }}
                        />
                      </div>
                    </div>

                    {/* Name on Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        Name on Card
                      </label>
                      <input
                        type="text"
                        autoComplete="cc-name"
                        placeholder="e.g. John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        maxLength={60}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#0f172a',
                          fontWeight: 500,
                          outline: 'none',
                          background: '#ffffff',
                        }}
                      />
                    </div>

                    {/* Expiry Date & CVV Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          Expiry Date (MM/YY)
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <Calendar size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            maxLength={5}
                            style={{
                              width: '100%',
                              height: '42px',
                              paddingLeft: '36px',
                              paddingRight: '10px',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '14px',
                              color: '#0f172a',
                              fontWeight: 500,
                              outline: 'none',
                              background: '#ffffff',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          CVV
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                          <input
                            type="password"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="CVV"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            style={{
                              width: '100%',
                              height: '42px',
                              paddingLeft: '34px',
                              paddingRight: '32px',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '14px',
                              color: '#0f172a',
                              fontWeight: 500,
                              outline: 'none',
                              background: '#ffffff',
                            }}
                          />
                          <span
                            title="3 or 4 digits on the back of your card"
                            style={{
                              position: 'absolute',
                              right: '10px',
                              color: '#94a3b8',
                              fontSize: '12px',
                              fontWeight: 700,
                              userSelect: 'none',
                            }}
                          >
                            ⓘ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accepted cards info banner (matches Image 2) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: '#eff6ff',
                      borderRadius: '8px',
                      color: '#1e40af',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>ⓘ</span>
                    <span>Accepted cards: Visa &amp; Mastercard only.</span>
                  </div>

                  {/* Blue Pay Now Button (matches Image 2) */}
                  <button
                    type="submit"
                    disabled={busy || !store.ready}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      height: '46px',
                      background: '#1d4ed8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Lock size={16} />
                    <span>{busy ? 'CONNECTING TO 3D SECURE…' : `Pay Now (${money(grandTotal)})`}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Mobile Wallets (Option 2 - FriMi, Q+, iPay as in Image 1) */}
            <div
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'wallet' ? '#0284c7' : 'var(--line)',
                background: paymentMethod === 'wallet' ? '#f0f9ff' : 'transparent',
                transition: 'all 0.2s ease',
                borderRadius: '8px',
                padding: '16px',
              }}
              onClick={() => setPaymentMethod('wallet')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <Smartphone size={20} strokeWidth={1.5} color={paymentMethod === 'wallet' ? '#0284c7' : 'currentColor'} />
                  <div>
                    <strong style={{ fontSize: '13px' }}>FriMi, Q+, iPay &amp; Wallets</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                      Nations FriMi, Commercial Bank Q+, LOLC iPay, Google Pay
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                  <FriMiLogo />
                  <QPlusLogo />
                  <IPayLogo />
                </div>
              </div>

              {paymentMethod === 'wallet' && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '16px 18px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={16} color="#0284c7" />
                      <strong style={{ fontSize: '12px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#0f172a' }}>
                        1-Click Instant Mobile Banking
                      </strong>
                    </div>
                    <GooglePayBadge />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                    Clicking <strong>PAY VIA WALLETS</strong> will directly launch the official PayHere gateway panel where you can authenticate and approve payment in seconds using your <strong>FriMi</strong>, <strong>Commercial Bank Q+</strong>, <strong>LOLC iPay</strong>, or <strong>Google Pay</strong> app.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <FriMiLogo />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>FriMi</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <QPlusLogo />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>Q+</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <IPayLogo />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>iPay</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Cash on Delivery (Option 3 at bottom - as requested) */}
            <div
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'cod' ? '#16a34a' : 'var(--line)',
                background: paymentMethod === 'cod' ? '#f0fdf4' : 'transparent',
                transition: 'all 0.2s ease',
                borderRadius: '8px',
                padding: '16px',
              }}
              onClick={() => setPaymentMethod('cod')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <CheckCircle2 size={20} strokeWidth={1.5} color="#16a34a" />
                  <div>
                    <strong style={{ fontSize: '13px' }}>Cash on Delivery (COD)</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                      Islandwide doorstep delivery across all 25 districts
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', border: '1px solid #bbf7d0', background: '#dcfce7', color: '#166534', borderRadius: '4px', letterSpacing: '0.4px' }}>
                  AVAILABLE
                </span>
              </div>

              {paymentMethod === 'cod' && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '14px 16px',
                    background: '#ffffff',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: 1.6, fontWeight: 500 }}>
                    Pay cash directly to our PromptX courier partner upon doorstep parcel delivery. Please have the exact cash amount ready for the delivery rider. Stock is reserved upon order dispatch.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Direct Bank Transfer */}
            <div
              className="checkout-option"
              style={{
                cursor: 'pointer',
                borderColor: paymentMethod === 'bank' ? 'var(--ink)' : 'var(--line)',
                background: paymentMethod === 'bank' ? 'var(--paper)' : 'transparent',
                transition: 'all 0.2s ease',
                borderRadius: '8px',
                padding: '16px',
              }}
              onClick={() => setPaymentMethod('bank')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                  />
                  <Building2 size={20} strokeWidth={1.2} />
                  <div>
                    <strong style={{ fontSize: '13px' }}>Direct Bank Transfer / Deposit</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                      Commercial Bank of Ceylon or Sampath Bank
                    </p>
                  </div>
                </div>
              </div>

              {paymentMethod === 'bank' && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '14px 16px',
                    background: '#ffffff',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>
                    Official Commercial Bank and Sampath Bank account numbers will be displayed on your confirmation screen. Please transfer within 24 hours and upload your bank slip via WhatsApp to initiate prompt dispatch.
                  </p>
                </div>
              )}
            </div>
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
            style={{ width: '100%', marginTop: '16px' }}
          >
            <span>
              {busy
                ? 'CONNECTING TO PAYHERE…'
                : paymentMethod === 'card'
                ? `PAY WITH CARD (${money(grandTotal)})`
                : paymentMethod === 'wallet'
                ? `PAY VIA FRIMI / Q+ / IPAY (${money(grandTotal)})`
                : paymentMethod === 'bank'
                ? `CONFIRM BANK TRANSFER (${money(grandTotal)})`
                : `PLACE CASH ON DELIVERY ORDER (${money(grandTotal)})`}
            </span>
            <ArrowRight size={17} />
          </button>

          <p className="small muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', lineHeight: 1.5 }}>
            <ShieldCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
            <span>
              {paymentMethod === 'card'
                ? 'Secured with 256-Bit SSL encryption & Central Bank 3D Secure OTP verification.'
                : paymentMethod === 'wallet'
                ? '1-Click wallet authentication powered by PayHere & Sri Lanka mobile banking networks.'
                : paymentMethod === 'bank'
                ? 'Bank deposit slip verification required within 24 hours to secure dispatch.'
                : 'Order will be dispatched via PromptX Courier. Pay cash on delivery.'}
            </span>
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
        {order.paymentMethod === 'card' || order.paymentMethod === 'wallet' ? (
          <div className="receipt-approved-banner no-print" style={{ background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.45) 0%, rgba(6, 78, 59, 0.35) 100%)', border: '1px solid rgba(74, 222, 128, 0.4)', borderRadius: '12px', padding: '18px 22px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px' }}>
                <CheckCircle2 size={16} /> PAYMENT APPROVED · ONLINE TRANSACTION
              </span>
              <h3 style={{ margin: '6px 0 2px', fontSize: '15px', color: '#ffffff', fontWeight: 650 }}>
                Order #{order.reference} is confirmed &amp; verified via PayHere Gateway.
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#d1d5db' }}>
                Your payment of {money(order.total)} was successfully processed. Our team will pack and dispatch your streetwear pieces via PromptX Courier. A receipt was sent to {order.customer.email || 'your email'}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: '#052e16', fontWeight: 750, padding: '11px 20px', borderRadius: '8px', fontSize: '13px', letterSpacing: '0.4px', flexShrink: 0, border: 'none', cursor: 'pointer' }}
            >
              <Printer size={16} />
              PRINT RECEIPT
            </button>
          </div>
        ) : (
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
        )}

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
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'bank' ? 'Bank Transfer' : order.paymentMethod === 'wallet' ? 'Mobile Wallet / Koko' : 'Credit / Debit Card'}
              </strong>
              <span className="receipt-meta-sub">
                {order.paymentMethod === 'cod' ? 'Cash payable upon delivery' : order.paymentMethod === 'bank' ? 'Deposit slip verification' : 'Verified via PayHere'}
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

          {/* Receipt Footer Credit */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#71717a', flexWrap: 'wrap', gap: '8px' }}>
            <span>© {new Date().getFullYear()} HELLO! CLOTHING. All rights reserved.</span>
            <span>
              Made by <a href="https://www.penetix.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>Penetix Cybersecurity Solutions</a>
            </span>
          </div>
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
            {order.paymentMethod === 'card' ? 'WHATSAPP CONCIERGE' : 'CONFIRM ON WHATSAPP'}
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

