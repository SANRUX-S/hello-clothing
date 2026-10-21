import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { Truck, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | HELLO! Streetwear Sri Lanka',
  description:
    'Official Refund and Return Policy for HELLO! Streetwear (www.helloclothing.store). 7-day doorstep size exchanges, return eligibility, refund timelines, and customer support across Sri Lanka.',
};

/*
 * ============================================================================
 * MERCHANT REVIEW NOTES (PayHere Pre-Activation Checklist)
 * ============================================================================
 * 1. Return/Exchange Window: Drafted as 7 calendar days from confirmed delivery.
 *    Please verify if 7 days matches your operational capability.
 * 2. Return Shipping Cost: Drafted as LKR 500 flat for customer change-of-mind /
 *    size swaps, and 100% free for damaged/incorrect shipments.
 * 3. Refund Timelines: Drafted as 5-7 business days for PayHere card reversals
 *    and 3-5 business days for bank transfers following return inspection.
 * 4. Non-Returnables: Drafted as socks, caps/headwear, and intimate items for hygiene.
 * ============================================================================
 */

const tocItems = [
  { id: 'overview', title: 'Overview & Store Commitment' },
  { id: 'eligibility', title: 'Return & Exchange Eligibility' },
  { id: 'how-to-request', title: 'How to Request an Exchange or Return' },
  { id: 'damaged-incorrect', title: 'Damaged, Defective, or Incorrect Items' },
  { id: 'non-returnable', title: 'Items That Cannot Normally Be Returned' },
  { id: 'return-shipping', title: 'Return Shipping & Courier Arrangements' },
  { id: 'inspection-refunds', title: 'Inspection, Approval & Refund Processing' },
  { id: 'cancellations', title: 'Order Cancellations' },
  { id: 'contact', title: 'Questions & Concierge Contact' },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      currentPath="/refund-policy"
      title="Refund & Return Policy"
      subtitle="HELLO! STORE POLICIES · CUSTOMER CARE"
      lastUpdated="October 21, 2026"
      tocItems={tocItems}
    >
      {/* 01. Overview */}
      <section id="overview" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">01</span>
          <h2>Overview & Store Commitment</h2>
        </div>
        <p>
          Thank you for shopping with <strong>HELLO!</strong> at{' '}
          <Link href="/">www.helloclothing.store</Link>. We are an independent Sri Lankan streetwear label dedicated to
          crafting boxy-cut, heavyweight garments built to last.
        </p>
        <p>
          We want you to be completely satisfied with every piece you purchase. Because streetwear is fundamentally about the
          proper fit, silhouette, and drape, this policy clearly outlines how returns, size exchanges, and refunds work for orders
          placed across Sri Lanka.
        </p>
        <div className="legal-callout">
          <RotateCcw className="legal-callout-icon" size={20} />
          <div className="legal-callout-content">
            <strong>7-Day Doorstep Size Exchanges</strong>
            If your garment does not fit the way you intended, our concierge team can arrange a direct doorstep size swap via
            our courier partners anywhere in Sri Lanka.
          </div>
        </div>
      </section>

      {/* 02. Eligibility */}
      <section id="eligibility" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">02</span>
          <h2>Return & Exchange Eligibility</h2>
        </div>
        <p>
          To qualify for a return or size exchange, all requests must meet the following baseline conditions:
        </p>
        <ul>
          <li>
            <strong>Return Request Window:</strong> The return or exchange request must be submitted within <strong>7 calendar days</strong> from the date of confirmed delivery by our courier partner.
          </li>
          <li>
            <strong>Product Condition:</strong> The garment must be completely unworn, unwashed, unaltered, and free from perfume, smoke, deodorant marks, makeup stains, or pet hair.
          </li>
          <li>
            <strong>Tags & Packaging:</strong> The original HELLO! swing tags, woven care labels, and branded packaging (e.g. dust bags) must remain attached and intact.
          </li>
          <li>
            <strong>Proof of Purchase:</strong> You must provide your official HELLO! order reference code (formatted as <code>HL-XXXXXX</code>) or the order confirmation SMS/email received at checkout.
          </li>
        </ul>
        <p>
          These conditions apply to standard retail purchases and do not limit your statutory consumer rights under applicable
          Sri Lankan consumer protection laws.
        </p>
      </section>

      {/* 03. How to Request */}
      <section id="how-to-request" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">03</span>
          <h2>How to Request an Exchange or Return</h2>
        </div>
        <p>
          Please <strong>do not dispatch items back to our hub without contacting us first</strong>. To initiate a return or exchange:
        </p>
        <ol>
          <li>
            Message our dedicated <strong>WhatsApp Concierge at +94 77 123 4567</strong> or submit our web inquiry form at{' '}
            <Link href="/contact">www.helloclothing.store/contact</Link>.
          </li>
          <li>
            Provide your <strong>Order Reference (e.g. HL-XXXXXX)</strong>, the item you wish to return/exchange, and the specific reason (such as requiring a smaller or larger size).
          </li>
          <li>
            Our support concierge will confirm stock availability for your replacement size or approve the return inspection.
          </li>
          <li>
            We will coordinate with <strong>PromptX Logistics</strong> to schedule a doorstep parcel exchange or pickup from your registered delivery address.
          </li>
        </ol>
        <p>
          Exchanges for alternative styles, colors, or sizes are subject to current inventory availability at the time of your request.
          If an item of higher value is selected, the price difference must be settled prior to dispatch.
        </p>
      </section>

      {/* 04. Damaged or Incorrect Goods */}
      <section id="damaged-incorrect" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">04</span>
          <h2>Damaged, Defective, or Incorrect Items</h2>
        </div>
        <p>
          Every HELLO! garment undergoes strict quality assurance before parcel sealing. However, in the rare event that you
          receive an item with a factory defect, transit damage, or an incorrect size/style differing from your order confirmation:
        </p>
        <ul>
          <li>
            Please notify us within <strong>48 hours of delivery</strong> via WhatsApp (+94 77 123 4567) or email with clear photos of the defect or discrepancy and your shipping label.
          </li>
          <li>
            Once verified, we will immediately arrange an express courier replacement at <strong>zero additional expense</strong> to you.
          </li>
          <li>
            If a replacement is unavailable, you are entitled to a full 100% refund, including any delivery fees paid during initial checkout.
          </li>
        </ul>
      </section>

      {/* 05. Non-Returnables */}
      <section id="non-returnable" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">05</span>
          <h2>Items That Cannot Normally Be Returned</h2>
        </div>
        <p>
          For health, personal hygiene, and safety considerations, certain categories cannot be returned or exchanged once opened:
        </p>
        <ul>
          <li>
            <strong>Headwear & Accessories:</strong> Caps, beanies, socks, and intimate wear cannot be exchanged once packaging seals are broken, unless factory defective.
          </li>
          <li>
            <strong>Custom or Altered Garments:</strong> Products customized, hemmed, or personalized upon customer request.
          </li>
          <li>
            <strong>Final Archive Sale Items:</strong> Clearance garments explicitly sold as &ldquo;Final Archive Sale&rdquo; on the product page and checkout invoice.
          </li>
        </ul>
        <p>
          These exclusions do not affect your rights if an item arrives defective or does not match its product description.
        </p>
      </section>

      {/* 06. Return Shipping */}
      <section id="return-shipping" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">06</span>
          <h2>Return Shipping & Courier Arrangements</h2>
        </div>
        <p>
          Courier responsibilities and transportation charges are handled as follows:
        </p>
        <ul>
          <li>
            <strong>Defective or Incorrect Deliveries:</strong> All return and redelivery courier charges are <strong>100% covered by HELLO!</strong>.
          </li>
          <li>
            <strong>Customer Change of Mind or Size Swaps:</strong> A standard doorstep exchange courier charge of <strong>LKR 500</strong> applies across Sri Lanka to cover roundtrip courier dispatch via PromptX Logistics. Alternatively, customers located in the Western Province may coordinate drop-off at our Colombo 07 fulfillment hub by prior appointment.
          </li>
        </ul>
      </section>

      {/* 07. Inspection & Refunds */}
      <section id="inspection-refunds" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">07</span>
          <h2>Inspection, Approval & Refund Processing</h2>
        </div>
        <p>
          Once your returned garment arrives at our Colombo fulfillment hub, our quality inspection team will examine the item within <strong>2 business days</strong>.
          You will receive confirmation via SMS or WhatsApp regarding whether the return has been approved.
        </p>
        <p>
          Approved refunds are processed through the following channels:
        </p>
        <ul>
          <li>
            <strong>Credit / Debit Card Payments (PayHere):</strong> Approved refunds for online card orders are credited directly back to the original card used during purchase through the <strong>PayHere Payment Gateway</strong>. Card refunds typically reflect in your account within <strong>5 to 7 business days</strong>, depending on your card issuer and bank clearing cycles.
          </li>
          <li>
            <strong>Cash on Delivery (COD) & Bank Deposits:</strong> For orders placed via Cash on Delivery or Direct Bank Deposit, refunds are disbursed via direct electronic bank transfer (CEFT/SLIPS) to a nominated Sri Lankan commercial bank account in the customer&apos;s name within <strong>3 to 5 business days</strong> of return approval.
          </li>
        </ul>
        <p>
          Please note that outbound shipping charges from the initial order are non-refundable unless the return was due to our operational error.
        </p>
      </section>

      {/* 08. Cancellations */}
      <section id="cancellations" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">08</span>
          <h2>Order Cancellations</h2>
        </div>
        <p>
          If you need to cancel or amend an order, please contact our WhatsApp concierge immediately at <strong>+94 77 123 4567</strong>.
        </p>
        <p>
          Orders can be cancelled free of charge if the request is received prior to parcel handover to the courier (typically within 4 hours of order placement).
          Once a parcel has been handed over and a tracking number (<code>PX-XXXXXX</code>) has been issued, the order cannot be recalled in transit and must be received and handled under the return policy guidelines above.
        </p>
      </section>

      {/* 09. Contact */}
      <section id="contact" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">09</span>
          <h2>Questions & Concierge Contact</h2>
        </div>
        <p>
          If you have questions regarding return eligibility, exchange timelines, or a pending refund, reach out through our official channels:
        </p>
        <ul>
          <li><strong>WhatsApp Concierge:</strong> +94 77 123 4567</li>
          <li><strong>Direct Telephone Hotline:</strong> 011 234 5678 (Mon – Sat: 9:00 AM – 7:00 PM)</li>
          <li><strong>Online Contact Form:</strong> <Link href="/contact">www.helloclothing.store/contact</Link></li>
          <li><strong>Live Order Tracking:</strong> <Link href="/track-order">www.helloclothing.store/track-order</Link></li>
          <li><strong>Fulfillment & Dispatch Hub:</strong> Colombo 07, Sri Lanka</li>
        </ul>
        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
          Related Documents: <Link href="/terms-and-conditions">Terms & Conditions</Link> ·{' '}
          <Link href="/privacy-policy">Privacy Policy</Link> ·{' '}
          <Link href="/size-guide">Size & Fit Guide</Link>
        </p>
      </section>
    </LegalPageLayout>
  );
}
