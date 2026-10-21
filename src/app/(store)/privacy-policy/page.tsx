import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { Lock, ShieldCheck, Database, KeyRound, Cookie, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | HELLO! Streetwear Sri Lanka',
  description:
    'Official Privacy Policy for HELLO! Clothing (www.helloclothing.store). Information collection, Firebase Authentication, data retention, security, and customer privacy rights.',
};

const tocItems = [
  { id: 'info-collected', title: '2.1. Information We Collect' },
  { id: 'how-we-use', title: '2.2. How We Use Information' },
  { id: 'where-stored', title: '2.3. Where Information Is Stored' },
  { id: 'sharing-info', title: '2.4. Sharing Information' },
  { id: 'data-retention', title: '2.5. Data Retention' },
  { id: 'security', title: '2.6. Security' },
  { id: 'cookies-storage', title: '2.7. Cookies and Local Storage' },
  { id: 'customer-requests', title: '2.8. Customer Requests' },
  { id: 'policy-changes', title: '2.9. Policy Changes' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      currentPath="/privacy-policy"
      title="Privacy Policy"
      subtitle="HELLO! STORE POLICIES · DATA & PRIVACY"
      lastUpdated="21 October 2026"
      tocItems={tocItems}
    >
      <div className="legal-callout legal-callout-info" style={{ marginBottom: '2.5rem' }}>
        <ShieldCheck size={20} />
        <div>
          <strong>Privacy Commitment</strong>
          <p>
            HELLO! Clothing respects the privacy of customers using{' '}
            <Link href="/">https://www.helloclothing.store</Link>. We collect and use personal information only where reasonably
            needed to operate the website, manage accounts where offered, process orders, provide delivery support, and meet applicable
            legal obligations. <strong>We do not sell customer personal information to advertisers or data brokers.</strong>
          </p>
        </div>
      </div>

      {/* 2.1. INFORMATION WE COLLECT */}
      <section id="info-collected" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.1</span>
          <h2>Information We Collect</h2>
        </div>
        <p>When a customer places an order, we may collect:</p>
        <ul className="legal-list">
          <li><strong>Full name.</strong></li>
          <li><strong>Delivery address and city or postal details</strong> needed for order fulfillment.</li>
          <li><strong>Contact telephone number</strong> for delivery updates and courier dispatch.</li>
          <li><strong>Email address</strong>, where requested in checkout or used for order communication.</li>
          <li>
            <strong>Order information</strong>, including products purchased, quantities, prices, order reference, payment method,
            and delivery or order status.
          </li>
        </ul>
        <p>
          If a customer chooses <strong>Google Sign-In</strong> when this feature is available, <strong>Firebase Authentication</strong>,
          a Google service, may process account information such as the customer&apos;s name, email address, Google profile photo, unique
          user identifier, and authentication/session information.
        </p>
        <p>
          The website may also process limited technical information needed to operate and protect the service, such as browser or
          device details, basic server logs, essential cookies, and browser local storage for carts or saved checkout details. These
          are not used to create or sell advertising profiles.
        </p>
      </section>

      {/* 2.2. HOW WE USE INFORMATION */}
      <section id="how-we-use" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.2</span>
          <h2>How We Use Information</h2>
        </div>
        <p>We use relevant information to:</p>
        <ul className="legal-list">
          <li>Confirm, prepare, and fulfil customer orders.</li>
          <li>Arrange delivery and contact customers when necessary about an order.</li>
          <li>Provide customer service, order tracking, returns, refunds, and after-sales support.</li>
          <li>Allow Google account sign-in and basic account functionality where enabled.</li>
          <li>Maintain the security and reliability of our website, prevent misuse, and meet legal obligations.</li>
        </ul>
        <p>
          We do not use order contact information for unrelated advertising campaigns without an appropriate legal basis or permission.
        </p>
      </section>

      {/* 2.3. WHERE INFORMATION IS STORED */}
      <section id="where-stored" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.3</span>
          <h2>Where Information Is Stored</h2>
        </div>
        <p>
          Order details required for fulfilment may be saved in our order management database. Certain cart, order-history, or
          delivery-profile details may also be saved locally in the customer&apos;s browser to support website functionality.
          Authentication information for Google Sign-In is handled through Firebase Authentication when that feature is enabled.
        </p>
        <div className="legal-callout legal-callout-warning">
          <Lock size={20} />
          <div>
            <strong>Payment Card Data Protection</strong>
            <p>
              HELLO! Clothing does not intentionally collect or store full payment card numbers or card security codes in its own order
              database. If an online payment option is introduced, card transactions will be handled through the payment provider&apos;s
              approved system, and this policy will be updated as necessary.
            </p>
          </div>
        </div>
      </section>

      {/* 2.4. SHARING INFORMATION */}
      <section id="sharing-info" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.4</span>
          <h2>Sharing Information</h2>
        </div>
        <p>
          We share only the information reasonably required with service providers that help us operate the website, host order data,
          provide authentication, process an available payment method, or deliver purchases. For example, a courier partner may need a
          recipient&apos;s name, telephone number, and delivery address.
        </p>
        <p>
          We may also disclose information where required by applicable law or a lawful request. <strong>We do not sell or rent
          customer information to third-party advertisers.</strong>
        </p>
      </section>

      {/* 2.5. DATA RETENTION */}
      <section id="data-retention" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.5</span>
          <h2>Data Retention</h2>
        </div>
        <p>
          Order information is kept only for as long as reasonably necessary to complete purchases, support delivery and returns,
          resolve disputes, maintain accurate business records, and meet applicable legal obligations. Customers may request
          information about, correction of, or deletion of their personal data, subject to any information that we must retain by law.
        </p>
      </section>

      {/* 2.6. SECURITY */}
      <section id="security" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.6</span>
          <h2>Security</h2>
        </div>
        <p>
          We take reasonable steps to protect the personal information used by our store, including limiting access to authorised
          personnel and using the security features available from our hosting, database, and authentication providers. No internet
          service can guarantee absolute security.
        </p>
      </section>

      {/* 2.7. COOKIES AND LOCAL STORAGE */}
      <section id="cookies-storage" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.7</span>
          <h2>Cookies and Local Storage</h2>
        </div>
        <p>
          Our website may use essential cookies and browser local storage for functions such as session management, shopping-cart
          continuity, and remembering customer-entered details. Customers can manage these through their browser, but disabling them may
          affect website functionality.
        </p>
      </section>

      {/* 2.8. CUSTOMER REQUESTS */}
      <section id="customer-requests" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.8</span>
          <h2>Customer Requests</h2>
        </div>
        <p>
          For questions about personal information or to request access, correction, or deletion where applicable, contact HELLO! Clothing
          through:
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
        <p>We will review all requests according to applicable requirements.</p>
      </section>

      {/* 2.9. POLICY CHANGES */}
      <section id="policy-changes" className="legal-section">
        <div className="legal-section-header">
          <span className="legal-section-number">2.9</span>
          <h2>Policy Changes</h2>
        </div>
        <p>
          We may update this Privacy Policy when our business practices, website functionality, service providers, or legal
          obligations change. The updated version and its effective date will be published on this page.
        </p>
      </section>
    </LegalPageLayout>
  );
}
