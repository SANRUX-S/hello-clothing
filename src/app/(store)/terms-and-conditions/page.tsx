import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { FileText, ShieldAlert, CheckCircle, Scale, Truck, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | HELLO! Streetwear Sri Lanka',
  description:
    'Official Terms & Conditions for HELLO! Streetwear (www.helloclothing.store). Covers website usage, garment ordering, pricing in LKR, delivery across Sri Lanka, PayHere payments, and consumer rights.',
};

/*
 * ============================================================================
 * MERCHANT REVIEW NOTES (PayHere Pre-Activation Checklist)
 * ============================================================================
 * 1. Legal Jurisdiction: Governed by the laws of the Democratic Socialist Republic
 *    of Sri Lanka, respecting statutory consumer protections.
 * 2. Delivery Rates & Surcharges: Drafted as LKR 500 standard islandwide across all
 *    25 districts, free delivery over LKR 10,000, and LKR 750 express (Western Province).
 * 3. Commercial Registration: References HELLO! Streetwear Sri Lanka. Formal
 *    business registration numbers (BRN) can be appended if required by PayHere audit.
 * ============================================================================
 */

const tocItems = [
  { id: 'introduction', title: 'Introduction & Agreement' },
  { id: 'products-specs', title: 'Products, Sizing & Visual Accuracy' },
  { id: 'pricing-currency', title: 'Pricing, Currencies & Delivery Fees' },
  { id: 'orders-acceptance', title: 'Order Placement & Acceptance' },
  { id: 'payment-methods', title: 'Payment Options & Billing Security' },
  { id: 'delivery-logistics', title: 'Islandwide Delivery & Courier Logistics' },
  { id: 'returns-crossref', title: 'Returns, Exchanges & Refund Policy' },
  { id: 'customer-accounts', title: 'Customer Obligations & Acceptable Use' },
  { id: 'intellectual-property', title: 'Intellectual Property Rights' },
  { id: 'liability-law', title: 'Limitation of Liability & Governing Law' },
  { id: 'contact', title: 'Support Concierge & Contact Details' },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      currentPath="/terms-and-conditions"
      title="Terms & Conditions"
      subtitle="HELLO! STORE POLICIES · LEGAL TERMS"
      lastUpdated="October 21, 2026"
      tocItems={tocItems}
    >
      {/* 01. Introduction */}
      <section id="introduction" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">01</span>
          <h2>Introduction & Agreement</h2>
        </div>
        <p>
          Welcome to <strong>HELLO!</strong> at <Link href="/">www.helloclothing.store</Link>.
          These Terms & Conditions govern your access to and use of our online streetwear storefront, product catalog, and digital checkout services.
        </p>
        <p>
          Throughout this document, the terms &ldquo;HELLO!&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to HELLO! Clothing Sri Lanka.
          The terms &ldquo;customer&rdquo;, &ldquo;you&rdquo;, and &ldquo;user&rdquo; refer to any person visiting, browsing, or purchasing goods from our website.
        </p>
        <p>
          By accessing or using our website, placing an order, or communicating with our customer concierge, you agree to be bound by these
          Terms & Conditions and our incorporated <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/refund-policy">Refund Policy</Link>.
          If you do not agree with any part of these terms, please refrain from using the store.
        </p>
      </section>

      {/* 02. Products, Sizing & Accuracy */}
      <section id="products-specs" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">02</span>
          <h2>Products, Sizing & Visual Accuracy</h2>
        </div>
        <p>
          HELLO! designs, manufactures, and retails premium heavyweight streetwear garments, including oversized graphic tees, heavyweight French terry hoodies,
          relaxed cargo pants, and headwear accessories.
        </p>
        <ul>
          <li>
            <strong>Garment Specifications:</strong> Fabric compositions, weights (e.g. 240–380 GSM combed cotton and fleece), and silhouettes are detailed on each individual product page. All garments are pre-shrunk to minimize shrinkage during normal washing.
          </li>
          <li>
            <strong>Sizing & Fit:</strong> Our garments are engineered with relaxed, drop-shoulder, boxy streetwear cuts. Detailed flat measurements in both inches and centimeters are accessible on our <Link href="/size-guide">Size & Fit Guide</Link>. Customers are encouraged to review these measurements prior to checkout.
          </li>
          <li>
            <strong>Visual Representation:</strong> We shoot all campaign photography with real production garments under controlled lighting. However, actual fabric color nuances may vary slightly depending on your monitor or mobile display color profile.
          </li>
          <li>
            <strong>Stock Availability:</strong> All products are subject to stock availability. Because drops are limited, an item in your shopping bag is not reserved until checkout is completed.
          </li>
        </ul>
      </section>

      {/* 03. Pricing & Currency */}
      <section id="pricing-currency" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">03</span>
          <h2>Pricing, Currencies & Delivery Fees</h2>
        </div>
        <p>
          All prices displayed across <Link href="/">www.helloclothing.store</Link> are quoted in <strong>Sri Lankan Rupees (LKR)</strong> and include all applicable local taxes.
          There are no surprise administrative fees added at checkout.
        </p>
        <p>
          Shipping charges are clearly calculated and displayed before you submit your order:
        </p>
        <ul>
          <li><strong>Standard Islandwide Delivery (PromptX Logistics):</strong> LKR 500 across all 25 districts of Sri Lanka.</li>
          <li><strong>Free Islandwide Shipping:</strong> Automatically applied to all orders with a subtotal of <strong>LKR 10,000 or greater</strong>.</li>
          <li><strong>Express Colombo & Suburbs Priority:</strong> LKR 750 for guaranteed next-day delivery within the Western Province.</li>
        </ul>
        <p>
          In the rare event that a product is mistakenly listed at an incorrect price due to a typographical error, HELLO! reserves the right to notify the customer, cancel the affected order, and issue an immediate 100% refund.
        </p>
      </section>

      {/* 04. Order Acceptance */}
      <section id="orders-acceptance" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">04</span>
          <h2>Order Placement & Acceptance</h2>
        </div>
        <p>
          When you place an order on our storefront, our system automatically generates an official order reference code (e.g. <code>HL-XXXXXX</code>)
          and sends an order confirmation message to your registered email and mobile number.
        </p>
        <p>
          Please note that receiving an order reference confirmation indicates receipt of your purchase request, but does not constitute final legal acceptance of the order.
          Order acceptance and contract completion take place when the parcel is packed and handed over to our courier partner for delivery.
        </p>
        <p>
          HELLO! reserves the right to decline or cancel any order prior to dispatch for legitimate operational reasons, including:
        </p>
        <ul>
          <li>Unforeseen inventory stock exhaustion or factory defect detected during final pre-pack inspection.</li>
          <li>Inability to verify delivery contact details or fraudulent address information.</li>
          <li>Inability to authorize online card payment via the payment gateway.</li>
          <li>Violations of fair purchasing policies or suspected automated commercial scalper bots.</li>
        </ul>
      </section>

      {/* 05. Payment Methods */}
      <section id="payment-methods" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">05</span>
          <h2>Payment Options & Billing Security</h2>
        </div>
        <p>
          We offer secure, transparent payment options tailored to Sri Lankan shoppers:
        </p>
        <ul>
          <li>
            <strong>Cash on Delivery (COD):</strong> Available across all 25 districts of Sri Lanka with no additional surcharge. You pay the exact invoice total in cash directly to our courier partner upon parcel delivery.
          </li>
          <li>
            <strong>Direct Bank Transfer / Deposit:</strong> Payment can be transferred directly to our official accounts at <strong>Commercial Bank of Ceylon</strong> or <strong>Sampath Bank</strong>. Customers must send their deposit slip or transfer screenshot via WhatsApp to +94 77 123 4567 citing their order reference number for verification before parcel dispatch.
          </li>
          <li>
            <strong>Online Credit & Debit Cards (Visa, Mastercard, American Express):</strong> Processed securely via the <strong>PayHere Payment Gateway</strong> (PayHere Private Limited).
          </li>
        </ul>
        <div className="legal-callout">
          <CreditCard className="legal-callout-icon" size={20} />
          <div className="legal-callout-content">
            <strong>Secure PCI-DSS Level 1 Encrypted Card Processing</strong>
            HELLO! does <strong>NOT</strong> collect or store credit or debit card numbers, expiry dates, or CVV security codes. Online payments are conducted via PayHere&apos;s bank-grade 256-bit SSL encrypted gateway, monitored under Central Bank of Sri Lanka (CBSL) payment regulations.
          </div>
        </div>
      </section>

      {/* 06. Islandwide Delivery */}
      <section id="delivery-logistics" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">06</span>
          <h2>Islandwide Delivery & Courier Logistics</h2>
        </div>
        <p>
          Deliveries are handled across Sri Lanka in partnership with <strong>PromptX Logistics</strong> and <strong>Domex Courier</strong>:
        </p>
        <ul>
          <li><strong>Colombo & Greater Suburbs:</strong> Delivered within <strong>1 to 2 business days</strong>.</li>
          <li><strong>Outstation & Islandwide:</strong> Delivered within <strong>2 to 4 business days</strong> across all 25 districts.</li>
          <li><strong>Express Priority (Western Province):</strong> Next-day guaranteed delivery.</li>
        </ul>
        <p>
          Once your parcel is dispatched from our Colombo fulfillment hub, you will receive an SMS notification containing your active courier tracking number (formatted as <code>PX-XXXXXX</code>).
          You can track delivery progress anytime at <Link href="/track-order">www.helloclothing.store/track-order</Link>.
        </p>
        <p>
          While we make every effort to meet stated delivery timeframes, dispatch schedules may occasionally be affected by severe weather, courier operational disruptions, or public holidays.
          In such cases, our support concierge will provide proactive updates.
        </p>
      </section>

      {/* 07. Returns & Refunds Cross-Reference */}
      <section id="returns-crossref" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">07</span>
          <h2>Returns, Exchanges & Refund Policy</h2>
        </div>
        <p>
          All returns, size swaps, doorstep courier exchanges, and refunds are governed strictly by our dedicated{' '}
          <Link href="/refund-policy"><strong>HELLO! Refund & Return Policy</strong></Link>.
        </p>
        <ul>
          <li>Customers have <strong>7 calendar days</strong> from courier delivery to request an exchange or return.</li>
          <li>Garments must be unworn, unwashed, unaltered, and returned with all original HELLO! tags and dust bag packaging intact.</li>
          <li>Approved card refunds are reversed directly via PayHere within <strong>5 to 7 business days</strong>.</li>
          <li>Approved COD or bank transfer refunds are remitted directly to your nominated commercial bank account within <strong>3 to 5 business days</strong>.</li>
        </ul>
      </section>

      {/* 08. Customer Obligations */}
      <section id="customer-accounts" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">08</span>
          <h2>Customer Obligations & Acceptable Use</h2>
        </div>
        <p>
          When using our website or ordering products, you agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete delivery and contact details during checkout.</li>
          <li>Ensure that you or an authorized representative is available to receive Cash on Delivery parcels at the specified address.</li>
          <li>Not use the website for any unlawful, fraudulent, or malicious purpose.</li>
          <li>Not probe, scan, or test the vulnerability of the storefront, database, or API infrastructure.</li>
          <li>Not employ automated bots, scripts, or scrapers to extract product catalog data or manipulate inventory levels.</li>
        </ul>
      </section>

      {/* 09. Intellectual Property */}
      <section id="intellectual-property" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">09</span>
          <h2>Intellectual Property Rights</h2>
        </div>
        <p>
          All content published on <Link href="/">www.helloclothing.store</Link>—including but not limited to the &ldquo;HELLO!&rdquo; wordmark, logos, custom typography, apparel graphics, garment patterns, editorial lookbook photography, video media, website design, and code—is the exclusive intellectual property of HELLO! Clothing Sri Lanka.
        </p>
        <p>
          Unauthorized reproduction, copying, distribution, commercial exploitation, or imitation of our streetwear graphics, garments, or brand identity without our prior written consent is strictly prohibited and protected under Sri Lankan and international intellectual property legislation.
        </p>
      </section>

      {/* 10. Liability & Governing Law */}
      <section id="liability-law" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">10</span>
          <h2>Limitation of Liability & Governing Law</h2>
        </div>
        <p>
          To the maximum extent permitted by applicable law, HELLO! shall not be liable for any indirect, incidental, or consequential damages resulting from the use of, or inability to use, this website or the garments purchased.
          Our total liability for any claim arising from a product purchase shall not exceed the amount actually paid by you for the specific garment giving rise to the claim.
        </p>
        <p>
          These Terms & Conditions are governed by and construed in accordance with the substantive laws of the <strong>Democratic Socialist Republic of Sri Lanka</strong>.
          Any disputes arising in connection with these terms that cannot be resolved amicably shall be submitted to the competent courts of Sri Lanka.
          Nothing in these terms limits your mandatory statutory rights as a consumer under Sri Lankan law.
        </p>
      </section>

      {/* 11. Support & Contact */}
      <section id="contact" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">11</span>
          <h2>Support Concierge & Contact Details</h2>
        </div>
        <p>
          For inquiries regarding these Terms & Conditions, order status, or payment procedures, reach out through our official channels:
        </p>
        <ul>
          <li><strong>WhatsApp Concierge:</strong> +94 77 123 4567</li>
          <li><strong>Direct Telephone Hotline:</strong> 011 234 5678 (Mon – Sat: 9:00 AM – 7:00 PM)</li>
          <li><strong>Online Contact Form:</strong> <Link href="/contact">www.helloclothing.store/contact</Link></li>
          <li><strong>Live Order Tracking:</strong> <Link href="/track-order">www.helloclothing.store/track-order</Link></li>
          <li><strong>Fulfillment & Dispatch Hub:</strong> Colombo 07, Sri Lanka</li>
        </ul>
        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
          Related Documents: <Link href="/refund-policy">Refund & Return Policy</Link> ·{' '}
          <Link href="/privacy-policy">Privacy Policy</Link> ·{' '}
          <Link href="/size-guide">Size & Fit Guide</Link>
        </p>
      </section>
    </LegalPageLayout>
  );
}
