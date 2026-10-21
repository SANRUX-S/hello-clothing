import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { RotateCcw, AlertTriangle, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund, Return & Exchange Policy | HELLO! Streetwear Sri Lanka',
  description:
    'Official Refund, Return & Exchange Policy for HELLO! Clothing (www.helloclothing.store). 7-day reporting period, defect remedies, customer error guidelines, and refund procedures.',
};

const tocItems = [
  { id: 'reporting-period', title: '1.1. Seven-Day Reporting Period' },
  { id: 'accepted-returns', title: '1.2. When a Return or Exchange May Be Accepted' },
  { id: 'selection-errors', title: '1.3. Customer Selection Errors and Change of Mind' },
  { id: 'product-condition', title: '1.4. Condition of Returned Products' },
  { id: 'refunds-replacements', title: '1.5. Refunds and Replacements' },
  { id: 'return-shipping', title: '1.6. Return Shipping' },
  { id: 'contact', title: '1.7. How to Contact Us' },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      currentPath="/refund-policy"
      title="Refund, Return & Exchange Policy"
      subtitle="HELLO! STORE POLICIES · CUSTOMER CARE"
      lastUpdated="21 October 2026"
      tocItems={tocItems}
    >
      <div className="legal-callout legal-callout-info" style={{ marginBottom: '2.5rem' }}>
        <ShieldCheck size={20} />
        <div>
          <strong>Our Commitment to You</strong>
          <p>
            Thank you for shopping with HELLO! Clothing, a Sri Lankan streetwear and fashion brand. We aim to supply products
            that match their descriptions and arrive in good condition. Please read the following policy before placing an order.
          </p>
        </div>
      </div>

      {/* 1.1. SEVEN-DAY REPORTING PERIOD */}
      <section id="reporting-period" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.1</span>
          <h2>Seven-Day Reporting Period</h2>
        </div>
        <p>
          Customers must contact HELLO! Clothing within <strong>seven (7) calendar days</strong> after receiving an order to report
          an incorrect item, manufacturing defect, or damage that occurred before delivery.
        </p>
        <p>
          Requests made after this period will be reviewed in accordance with any rights customers have under applicable law.
        </p>
      </section>

      {/* 1.2. WHEN A RETURN OR EXCHANGE MAY BE ACCEPTED */}
      <section id="accepted-returns" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.2</span>
          <h2>When a Return or Exchange May Be Accepted</h2>
        </div>
        <p>We may accept a return, exchange, replacement, or refund when:</p>
        <ul className="legal-list">
          <li>
            <strong>Incorrect Product:</strong> We supplied a product different from the item, size, or colour confirmed in the order.
          </li>
          <li>
            <strong>Manufacturing Defect:</strong> The product has a manufacturing defect or stitching issue.
          </li>
          <li>
            <strong>Damaged on Arrival:</strong> The product arrived damaged or materially different from its description.
          </li>
        </ul>
        <p>
          Customers should provide the order reference, a brief explanation, and clear photographs where reasonably possible.
          We may request that the item be returned for inspection before approving the appropriate remedy.
        </p>
      </section>

      {/* 1.3. CUSTOMER SELECTION ERRORS AND CHANGE OF MIND */}
      <section id="selection-errors" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.3</span>
          <h2>Customer Selection Errors and Change of Mind</h2>
        </div>
        <p>
          HELLO! Clothing does not generally accept returns or exchanges for a <strong>change of mind</strong> or for{' '}
          <strong>mistakes made by the customer when placing the order</strong>. This includes:
        </p>
        <ul className="legal-list">
          <li>Ordering the wrong size, colour, design, quantity, or product.</li>
          <li>Providing an incorrect delivery address or contact number.</li>
          <li>Failing to review the product information and size guide before checkout.</li>
        </ul>
        <div className="legal-callout legal-callout-warning">
          <AlertTriangle size={20} />
          <div>
            <strong>Careful Checkout Verification</strong>
            <p>
              Please check your order details carefully before confirming your purchase. Nothing in this section limits any rights that
              cannot legally be excluded under applicable consumer protection legislation.
            </p>
          </div>
        </div>
      </section>

      {/* 1.4. CONDITION OF RETURNED PRODUCTS */}
      <section id="product-condition" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.4</span>
          <h2>Condition of Returned Products</h2>
        </div>
        <p>
          Where a return is accepted, the item should be <strong>unworn, unwashed, and in its original condition</strong>, with its labels,
          accessories, and packaging where reasonably available. These conditions do not remove a customer&apos;s rights in relation to
          faulty, incorrectly supplied, or misdescribed products.
        </p>
        <p>
          Items that have been used, altered, washed, or damaged after delivery through customer handling are not ordinarily eligible for
          a return or exchange, unless required by applicable law.
        </p>
      </section>

      {/* 1.5. REFUNDS AND REPLACEMENTS */}
      <section id="refunds-replacements" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.5</span>
          <h2>Refunds and Replacements</h2>
        </div>
        <p>
          After reviewing a request and inspecting the item where necessary, we will inform the customer of the outcome. For an
          approved return, HELLO! Clothing may arrange a replacement, an exchange, or a refund, as appropriate to the issue and the
          customer&apos;s applicable rights.
        </p>
        <p>
          Approved refunds will be made to the original payment method where possible. For Cash on Delivery or other payment methods
          where that is not possible, we will agree on a suitable refund method with the customer. We aim to process approved refunds
          within <strong>seven (7) business days</strong> after approval; banks and payment providers may require additional time to
          complete the transfer.
        </p>
        <p>
          Original delivery charges are not normally refunded for customer-requested changes, but appropriate delivery or return charges
          will be addressed where the error or defect is attributable to HELLO! Clothing, in accordance with applicable law.
        </p>
      </section>

      {/* 1.6. RETURN SHIPPING */}
      <section id="return-shipping" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.6</span>
          <h2>Return Shipping</h2>
        </div>
        <p>
          If we supplied the wrong product or an item with a verified defect or delivery-related damage, HELLO! Clothing will provide
          instructions for the return and arrange or reimburse reasonable return shipping costs where appropriate.
        </p>
        <p>
          <strong>Important:</strong> Please do not send an item back before contacting us and receiving official return instructions.
        </p>
      </section>

      {/* 1.7. HOW TO CONTACT US */}
      <section id="contact" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">1.7</span>
          <h2>How to Contact Us</h2>
        </div>
        <p>
          To request assistance, contact HELLO! Clothing within the relevant period using our official channels:
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
        <p>
          Please include your <strong>order reference</strong>, a clear description of the issue, and relevant photographs if available.
          Our team will explain the next steps promptly.
        </p>
        <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: 'var(--muted)' }}>
          This policy is subject to applicable Sri Lankan consumer protection laws and does not override rights that cannot legally be excluded.
        </p>
      </section>
    </LegalPageLayout>
  );
}
