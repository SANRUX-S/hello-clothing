import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { ShieldCheck, Lock, Database, Cookie, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | HELLO! Streetwear Sri Lanka',
  description:
    'Official Privacy Policy for HELLO! Streetwear (www.helloclothing.store). Explains how personal data is collected, order fulfillment, secure PayHere card processing, and customer rights in Sri Lanka.',
};

/*
 * ============================================================================
 * MERCHANT REVIEW NOTES (PayHere Pre-Activation Checklist)
 * ============================================================================
 * 1. Business Legal Entity: Drafted under the trade name HELLO! Clothing Sri Lanka.
 *    If registered under a distinct formal business name (e.g. PV / Sole Proprietorship),
 *    this can be inserted prior to live merchant onboarding.
 * 2. Payment Gateway Status: Reflects active PayHere integration for card payments
 *    (PayHere Private Limited - CBSL Authorized). Confirms zero storage of card numbers.
 * 3. Data Retention Period: Set as up to 5 years in line with standard Sri Lankan
 *    statutory and commercial tax record-keeping requirements.
 * ============================================================================
 */

const tocItems = [
  { id: 'introduction', title: 'Introduction & Site Operator' },
  { id: 'data-collected', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Personal Data' },
  { id: 'payments-security', title: 'Payments & Card Security (PayHere)' },
  { id: 'service-providers', title: 'Service Providers & Data Sharing' },
  { id: 'storage-security', title: 'Data Storage & Security Safeguards' },
  { id: 'cookies-storage', title: 'Cookies & Browser Local Storage' },
  { id: 'data-retention', title: 'Data Retention Periods' },
  { id: 'customer-rights', title: 'Your Rights & Privacy Choices' },
  { id: 'changes-contact', title: 'Policy Updates & Contact Information' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      currentPath="/privacy-policy"
      title="Privacy Policy"
      subtitle="HELLO! STORE POLICIES · DATA PROTECTION"
      lastUpdated="October 21, 2026"
      tocItems={tocItems}
    >
      {/* 01. Introduction */}
      <section id="introduction" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">01</span>
          <h2>Introduction & Site Operator</h2>
        </div>
        <p>
          Welcome to <strong>HELLO!</strong> (<Link href="/">www.helloclothing.store</Link>). We are an online streetwear clothing
          retailer operating in Sri Lanka and dispatching nationwide from our Colombo fulfillment hub.
        </p>
        <p>
          HELLO! is committed to safeguarding the privacy and security of every customer who visits our store, subscribes to our
          drops, or purchases our heavyweight garments. This Privacy Policy transparently explains what personal information we
          collect, why we collect it, how it is handled, and your rights concerning your personal data.
        </p>
        <p>
          By accessing <Link href="/">www.helloclothing.store</Link> or placing an order through our checkout, you acknowledge the
          practices described in this policy.
        </p>
      </section>

      {/* 02. Information We Collect */}
      <section id="data-collected" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">02</span>
          <h2>Information We Collect</h2>
        </div>
        <p>
          We only collect personal information that is reasonably necessary to fulfill your streetwear orders, communicate dispatch updates,
          and maintain site security. This includes:
        </p>
        <ul>
          <li>
            <strong>Contact & Delivery Information:</strong> Full name, delivery street address, city, optional postal code, primary mobile telephone number, and email address provided during checkout or customer inquiry.
          </li>
          <li>
            <strong>Order & Transaction Records:</strong> Garments ordered, specific sizes, colorways, quantities, calculated order totals, delivery method, chosen payment method, order reference codes (e.g. <code>HL-XXXXXX</code>), and courier tracking numbers.
          </li>
          <li>
            <strong>Customer Service Communications:</strong> Records of inquiries, size exchange requests, feedback, or support messages submitted via our online contact form (<Link href="/contact">/contact</Link>) or our WhatsApp concierge (+94 77 123 4567).
          </li>
          <li>
            <strong>Technical Log Data:</strong> Standard server logs including IP addresses, browser types, operating systems, and access timestamps collected automatically to protect against cyber attacks, automated bot abuse, and checkout fraud.
          </li>
        </ul>
      </section>

      {/* 03. How We Use Data */}
      <section id="how-we-use" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">03</span>
          <h2>How We Use Your Personal Data</h2>
        </div>
        <p>
          We process personal customer data strictly for legitimate operational purposes:
        </p>
        <ul>
          <li>
            <strong>Order Processing & Fulfillment:</strong> Verifying order details, preparing garments at our fulfillment hub, generating shipping waybills, and dispatching parcels to your doorstep.
          </li>
          <li>
            <strong>Delivery & Courier Notifications:</strong> Providing your phone number and address to our courier partners (PromptX Logistics and Domex Courier) so they can reach you and transmit live SMS tracking updates.
          </li>
          <li>
            <strong>Customer Service & Exchanges:</strong> Assisting you with size swaps, address amendments, delivery tracking inquiries, and managing returns under our <Link href="/refund-policy">Refund Policy</Link>.
          </li>
          <li>
            <strong>Platform Security & Fraud Prevention:</strong> Validating origin headers, rate-limiting checkout requests, preventing automated scalper bots, and ensuring server stability.
          </li>
          <li>
            <strong>Optional Newsletters:</strong> If you explicitly opt in to our VIP Drop list, we may send email announcements regarding new garment drops and exclusive exhibitions. You can unsubscribe at any time.
          </li>
        </ul>
      </section>

      {/* 04. Payments & Card Security */}
      <section id="payments-security" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">04</span>
          <h2>Payments & Card Security (PayHere Gateway)</h2>
        </div>
        <p>
          Payment security is our highest priority. We offer three primary payment options at checkout:
        </p>
        <ul>
          <li><strong>Cash on Delivery (COD):</strong> Payment is collected in cash by our courier partner upon parcel delivery.</li>
          <li><strong>Direct Bank Transfer / Deposit:</strong> Payment is remitted directly to our designated commercial bank account.</li>
          <li><strong>Online Credit / Debit Card Payments (Visa, Mastercard, American Express):</strong> Processed securely via PayHere.</li>
        </ul>

        <div className="legal-callout">
          <Lock className="legal-callout-icon" size={22} />
          <div className="legal-callout-content">
            <strong>Zero Card Data Stored on HELLO! Servers</strong>
            HELLO! does <strong>NOT</strong> collect, view, process, or store credit or debit card numbers, expiration dates, or CVV/CVC security codes on our servers. All card transactions are redirected to and processed directly by the <strong>PayHere Payment Gateway</strong> (PayHere Private Limited), a Payment Service Provider monitored by the Central Bank of Sri Lanka (CBSL) operating under full PCI-DSS Level 1 compliance with 256-bit SSL encryption.
          </div>
        </div>

        <p>
          When paying online, your card details are transmitted directly and securely from your browser to PayHere.
          HELLO! only receives a secure transaction verification token, authorization status, and payment timestamp to confirm that your order has been funded.
        </p>
      </section>

      {/* 05. Service Providers */}
      <section id="service-providers" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">05</span>
          <h2>Service Providers & Data Sharing</h2>
        </div>
        <p>
          We do <strong>NOT</strong> sell, rent, monetize, or trade your personal information with third-party advertisers, data brokers, or marketing networks.
        </p>
        <p>
          To operate our online store, we partner with reputable service providers who process data strictly under our instructions:
        </p>
        <ul>
          <li>
            <strong>Payment Service Provider (PayHere):</strong> Processes online card transactions through bank-grade encrypted channels.
          </li>
          <li>
            <strong>Courier & Logistics Partners (PromptX Logistics, Domex Courier):</strong> Provided with recipient name, delivery address, phone number, and parcel order reference to execute islandwide doorstep delivery and send tracking SMS notifications.
          </li>
          <li>
            <strong>Cloud Hosting & Edge Infrastructure (Vercel Inc.):</strong> Hosts our web storefront and edge APIs with enterprise-level encryption and high-speed uptime.
          </li>
          <li>
            <strong>Serverless Database (Neon Database Inc.):</strong> Secure PostgreSQL cloud database located in encrypted AWS infrastructure, storing order records, inventory states, and catalog information.
          </li>
          <li>
            <strong>Legal & Regulatory Authorities:</strong> We may disclose information if required by applicable Sri Lankan law, court order, or official law enforcement investigation.
          </li>
        </ul>
      </section>

      {/* 06. Storage & Security */}
      <section id="storage-security" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">06</span>
          <h2>Data Storage & Security Safeguards</h2>
        </div>
        <p>
          We implement technical and organizational measures to safeguard your personal data against unauthorized access, loss, misuse, or alteration:
        </p>
        <ul>
          <li>
            <strong>End-to-End Encryption:</strong> All communication between your device and <Link href="/">www.helloclothing.store</Link> is secured using industry-standard TLS/SSL (HTTPS) encryption.
          </li>
          <li>
            <strong>Access Restrictions:</strong> Access to customer order records is restricted to authorized fulfillment and support staff with unique credentials and multi-factor authentication.
          </li>
          <li>
            <strong>Secure API Architecture:</strong> Storefront endpoints enforce same-origin checks, request payload validation via Zod schemas, and rate-limiting to block brute-force attacks.
          </li>
        </ul>
        <p>
          While we maintain robust safeguards, no method of electronic storage or transmission over the internet is 100% impenetrable.
          Customers are advised to maintain security on their personal devices and email accounts.
        </p>
      </section>

      {/* 07. Cookies & Local Storage */}
      <section id="cookies-storage" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">07</span>
          <h2>Cookies & Browser Local Storage</h2>
        </div>
        <p>
          We take a minimalist, privacy-first approach to web tracking:
        </p>
        <ul>
          <li>
            <strong>No Third-Party Ad Trackers:</strong> We do not employ third-party advertising cookies, cross-site trackers, or behavioral surveillance pixels on our website.
          </li>
          <li>
            <strong>Essential Browser Local Storage:</strong> We use your browser&apos;s standard <code>localStorage</code> strictly for functional store purposes:
            <ul style={{ marginTop: '8px' }}>
              <li>Persisting items in your shopping bag so your selections are preserved as you browse products.</li>
              <li>Optional customer convenience autofill (<code>hello-customer-profile</code>) to save you from re-typing your name, phone, and delivery address during subsequent checkouts.</li>
            </ul>
          </li>
        </ul>
        <p>
          You can clear your browser storage or disable cookies at any time through your browser settings; however, doing so will clear your active shopping bag items.
        </p>
      </section>

      {/* 08. Data Retention */}
      <section id="data-retention" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">08</span>
          <h2>Data Retention Periods</h2>
        </div>
        <p>
          We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy:
        </p>
        <ul>
          <li>
            <strong>Order Records:</strong> Retained for a period of up to <strong>5 years</strong> following order completion to comply with statutory commercial, accounting, tax, and auditing requirements under Sri Lankan business regulations.
          </li>
          <li>
            <strong>Customer Inquiries & Concierge Logs:</strong> Retained for up to 12 months following resolution to assist with any follow-up warranty or exchange questions.
          </li>
          <li>
            <strong>Server Security Logs:</strong> Automatically rotated and purged on a standard 30-day retention schedule.
          </li>
        </ul>
      </section>

      {/* 09. Customer Rights */}
      <section id="customer-rights" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">09</span>
          <h2>Your Rights & Privacy Choices</h2>
        </div>
        <p>
          You have full control over your personal data:
        </p>
        <ul>
          <li><strong>Access & Correction:</strong> You may request a copy of the personal information we hold about you or request corrections to inaccurate details.</li>
          <li><strong>Deletion (Right to be Forgotten):</strong> You may request that we delete your contact profile and non-essential records, subject to our legal obligations to maintain transaction records for tax compliance.</li>
          <li><strong>Marketing Opt-Out:</strong> You may unsubscribe from our email drop announcements at any time using the unsubscribe link provided in the newsletter footer or by notifying our concierge.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at <Link href="/contact">www.helloclothing.store/contact</Link> or message our WhatsApp concierge at +94 77 123 4567. We will respond within <strong>2 business days</strong>.
        </p>
      </section>

      {/* 10. Policy Updates & Contact */}
      <section id="changes-contact" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">10</span>
          <h2>Policy Updates & Contact Information</h2>
        </div>
        <p>
          We may periodically update this Privacy Policy to reflect changes in our store operations, new payment integrations, or relevant legislation.
          The effective revision date at the top of this document will always indicate when updates were published.
        </p>
        <p>
          For privacy questions, data requests, or compliance inquiries, reach out through our official channels:
        </p>
        <ul>
          <li><strong>WhatsApp Concierge:</strong> +94 77 123 4567</li>
          <li><strong>Direct Telephone Hotline:</strong> 011 234 5678 (Mon – Sat: 9:00 AM – 7:00 PM)</li>
          <li><strong>Online Contact Form:</strong> <Link href="/contact">www.helloclothing.store/contact</Link></li>
          <li><strong>Fulfillment & Dispatch Hub:</strong> Colombo 07, Sri Lanka</li>
        </ul>
        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
          Related Documents: <Link href="/terms-and-conditions">Terms & Conditions</Link> ·{' '}
          <Link href="/refund-policy">Refund & Return Policy</Link> ·{' '}
          <Link href="/track-order">Order Tracking</Link>
        </p>
      </section>
    </LegalPageLayout>
  );
}
