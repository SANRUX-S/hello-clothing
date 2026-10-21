import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { ShieldCheck, Scale, FileText, ShoppingBag, Truck, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | HELLO! Streetwear Sri Lanka',
  description:
    'Official Terms & Conditions for HELLO! Clothing (www.helloclothing.store). Website use, product availability, payments, delivery terms, and customer rights in Sri Lanka.',
};

const tocItems = [
  { id: 'website-use', title: '3.1. Use of Our Website' },
  { id: 'products-sizes', title: '3.2. Products, Sizes, and Information' },
  { id: 'prices-availability', title: '3.3. Prices and Availability' },
  { id: 'placing-order', title: '3.4. Placing an Order' },
  { id: 'payments', title: '3.5. Payments' },
  { id: 'shipping-delivery', title: '3.6. Shipping and Delivery' },
  { id: 'returns-refunds', title: '3.7. Returns, Exchanges, and Refunds' },
  { id: 'accounts-data', title: '3.8. Accounts and Data' },
  { id: 'intellectual-property', title: '3.9. Website Content' },
  { id: 'liability-responsibility', title: '3.10. Service Availability and Responsibility' },
  { id: 'terms-changes', title: '3.11. Changes to These Terms' },
  { id: 'contact', title: '3.12. Contact' },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      currentPath="/terms-and-conditions"
      title="Terms & Conditions"
      subtitle="HELLO! STORE POLICIES · GENERAL TERMS"
      lastUpdated="21 October 2026"
      tocItems={tocItems}
    >
      <div className="legal-callout legal-callout-info" style={{ marginBottom: '2.5rem' }}>
        <Scale size={20} />
        <div>
          <strong>Welcome to HELLO! Clothing</strong>
          <p>
            Welcome to HELLO! Clothing (<Link href="/">https://www.helloclothing.store</Link>). These Terms & Conditions apply to the
            use of our website and purchases made through it. Please read them before placing an order.
          </p>
        </div>
      </div>

      {/* 3.1. USE OF OUR WEBSITE */}
      <section id="website-use" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.1</span>
          <h2>Use of Our Website</h2>
        </div>
        <p>
          Customers must provide accurate information when placing an order and use the website for lawful purposes. If a customer is
          under 18, a parent or guardian should assist with the purchase where appropriate. Customers are responsible for protecting any
          account access under their control.
        </p>
      </section>

      {/* 3.2. PRODUCTS, SIZES, AND INFORMATION */}
      <section id="products-sizes" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.2</span>
          <h2>Products, Sizes, and Information</h2>
        </div>
        <p>
          We sell streetwear clothing and related fashion products as shown on the website. Customers should review product
          descriptions, sizes, colours, quantities, and availability carefully before ordering.
        </p>
        <p>
          We make reasonable efforts to present products accurately, but screen settings and photography may cause slight visual
          differences. A material discrepancy or faulty product will be handled under our{' '}
          <Link href="/refund-policy">Refund, Return & Exchange Policy</Link> and applicable law.
        </p>
      </section>

      {/* 3.3. PRICES AND AVAILABILITY */}
      <section id="prices-availability" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.3</span>
          <h2>Prices and Availability</h2>
        </div>
        <p>
          Product prices are shown in <strong>Sri Lankan Rupees (LKR)</strong>, unless expressly stated otherwise. Applicable delivery
          fees and the total amount payable should be displayed before order confirmation.
        </p>
        <p>
          Prices, stock availability, promotions, and product ranges may change. If a significant pricing or availability error is
          discovered, we will contact the customer about the available options, including cancellation and any appropriate refund.
        </p>
      </section>

      {/* 3.4. PLACING AN ORDER */}
      <section id="placing-order" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.4</span>
          <h2>Placing an Order</h2>
        </div>
        <p>
          Customers are responsible for checking the chosen products, sizes, colours, quantities, delivery information, and contact
          details before submitting an order.
        </p>
        <p>
          An order is subject to confirmation and product availability. We may contact the customer if information is incomplete or a
          product is unavailable.
        </p>
      </section>

      {/* 3.5. PAYMENTS */}
      <section id="payments" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.5</span>
          <h2>Payments</h2>
        </div>
        <p>
          Customers may use only the payment methods that are actually available and clearly displayed at checkout at the time of purchase.
          Any online card payment option will be offered only after an approved payment gateway is activated.
        </p>
        <p>
          <strong>Security Notice:</strong> HELLO! Clothing does not ask customers to provide full payment card details through ordinary
          messages or emails.
        </p>
      </section>

      {/* 3.6. SHIPPING AND DELIVERY */}
      <section id="shipping-delivery" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.6</span>
          <h2>Shipping and Delivery</h2>
        </div>
        <p>
          Orders are delivered to the address supplied by the customer, subject to service availability. Any delivery time shown at
          checkout or in an order confirmation is an estimate and may vary because of location, courier operations, public holidays,
          weather, or other circumstances.
        </p>
        <p>
          Customers must provide accurate delivery details and a reachable telephone number. Please contact us promptly if an address
          needs to be corrected; changes may not be possible after dispatch.
        </p>
      </section>

      {/* 3.7. RETURNS, EXCHANGES, AND REFUNDS */}
      <section id="returns-refunds" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.7</span>
          <h2>Returns, Exchanges, and Refunds</h2>
        </div>
        <p>
          Customers should notify HELLO! Clothing within <strong>seven (7) calendar days</strong> of delivery if an item is incorrect,
          defective, or damaged on arrival.
        </p>
        <p>
          Returns or exchanges are not generally accepted for customer ordering errors or change of mind, including choosing the wrong
          size, colour, or design. Full details, exceptions, and customer rights are described in our{' '}
          <Link href="/refund-policy">Refund, Return & Exchange Policy</Link>. Nothing in these Terms excludes rights that cannot legally
          be limited.
        </p>
      </section>

      {/* 3.8. ACCOUNTS AND DATA */}
      <section id="accounts-data" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.8</span>
          <h2>Accounts and Data</h2>
        </div>
        <p>
          Where Google Sign-In or another account feature is made available, customers must use their own account and are responsible
          for activity conducted through it. We handle order and account information as described in our{' '}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>

      {/* 3.9. WEBSITE CONTENT */}
      <section id="intellectual-property" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.9</span>
          <h2>Website Content</h2>
        </div>
        <p>
          HELLO! Clothing&apos;s original logos, product descriptions, photographs, designs, and website materials may be protected by
          applicable intellectual-property rights. Customers may not reproduce or commercially reuse those materials without permission,
          except where permitted by law or where the rights belong to another owner.
        </p>
      </section>

      {/* 3.10. SERVICE AVAILABILITY AND RESPONSIBILITY */}
      <section id="liability-responsibility" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.10</span>
          <h2>Service Availability and Responsibility</h2>
        </div>
        <p>
          We aim to provide accurate information and a reliable website, but temporary interruptions, technical problems, or delivery
          delays may occur. We will take reasonable steps to address issues brought to our attention.
        </p>
        <p>
          These Terms do not exclude liability or consumer remedies that cannot be excluded under applicable law.
        </p>
      </section>

      {/* 3.11. CHANGES TO THESE TERMS */}
      <section id="terms-changes" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.11</span>
          <h2>Changes to These Terms</h2>
        </div>
        <p>
          HELLO! Clothing may update these Terms & Conditions where necessary. Revised terms will be published on the website with an
          updated date. The terms applicable to a confirmed order will remain subject to applicable law and the information provided when
          the order was placed.
        </p>
      </section>

      {/* 3.12. CONTACT */}
      <section id="contact" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">3.12</span>
          <h2>Contact</h2>
        </div>
        <p>
          For order assistance or questions about these Terms & Conditions, please reach out to us:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Online Contact Form:</strong>{' '}
            <Link href="/contact">www.helloclothing.store/contact</Link>
          </li>
          <li>
            <strong>WhatsApp Concierge:</strong>{' '}
            <a href="https://wa.me/94786191260" target="_blank" rel="noopener noreferrer">
              +94 78 619 1260 (078 619 1260)
            </a>
          </li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
