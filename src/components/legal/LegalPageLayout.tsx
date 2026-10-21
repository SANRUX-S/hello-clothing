'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  ExternalLink,
  ArrowRight,
  ListOrdered,
  FileText
} from 'lucide-react';
import './legal-page.css';

interface TocItem {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  currentPath: '/refund-policy' | '/privacy-policy' | '/terms-and-conditions';
  title: string;
  subtitle: string;
  lastUpdated: string;
  tocItems: TocItem[];
  children: ReactNode;
}

export default function LegalPageLayout({
  currentPath,
  title,
  subtitle,
  lastUpdated,
  tocItems,
  children,
}: LegalPageLayoutProps) {
  const policies = [
    { name: 'Refund Policy', path: '/refund-policy' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms-and-conditions' },
  ];

  return (
    <article className="legal-page-container page-gutter">
      {/* Breadcrumbs */}
      <nav className="legal-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="separator">/</span>
        <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{title}</span>
      </nav>

      {/* Header */}
      <header className="legal-header">
        <span className="eyebrow">{subtitle}</span>
        <h1>{title}</h1>
        <div className="legal-meta-bar">
          <div className="legal-meta-item">
            <span>Website:</span>
            <strong>www.helloclothing.store</strong>
          </div>
          <div className="legal-meta-item">
            <span>Last Updated:</span>
            <strong>{lastUpdated}</strong>
          </div>
          <div className="legal-meta-item">
            <span>Region:</span>
            <strong>Sri Lanka (Islandwide)</strong>
          </div>
        </div>

        {/* Quick Switcher Tabs */}
        <nav className="legal-nav-tabs" aria-label="Policy Navigation">
          {policies.map((p) => {
            const isActive = currentPath === p.path;
            return (
              <Link
                key={p.path}
                href={p.path}
                className={`legal-tab-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <FileText size={12} />
                {p.name}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Table of Contents */}
      {tocItems.length > 0 && (
        <nav className="legal-toc" aria-label="Table of Contents">
          <div className="legal-toc-title">
            <ListOrdered size={14} />
            <span>Table of Contents</span>
          </div>
          <ul className="legal-toc-list">
            {tocItems.map((item, index) => {
              const paddedIndex = String(index + 1).padStart(2, '0');
              return (
                <li key={item.id}>
                  <a href={`#${item.id}`}>
                    <span className="legal-toc-index">{paddedIndex}.</span>
                    <span>{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Policy Content */}
      <div className="legal-content">
        {children}
      </div>

      {/* Support & Concierge Card */}
      <aside className="legal-support-card" aria-label="Customer Support and Contact Information">
        <h3>Customer Support & Direct Concierge</h3>
        <p>
          Need assistance with an active order, size exchange, payment question, or policy clarification?
          Our team is available through the official channels below.
        </p>

        <div className="legal-contact-grid">
          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noopener noreferrer"
            className="legal-contact-item"
          >
            <MessageCircle size={18} color="#25D366" />
            <div>
              <strong>WhatsApp Concierge</strong>
              <span>+94 77 123 4567</span>
            </div>
            <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
          </a>

          <a href="tel:0112345678" className="legal-contact-item">
            <Phone size={18} />
            <div>
              <strong>Support Hotline</strong>
              <span>011 234 5678</span>
            </div>
          </a>

          <div className="legal-contact-item">
            <Clock size={18} />
            <div>
              <strong>Operating Hours</strong>
              <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
            </div>
          </div>

          <div className="legal-contact-item">
            <MapPin size={18} />
            <div>
              <strong>Dispatch & Fulfillment</strong>
              <span>Colombo 07, Sri Lanka</span>
            </div>
          </div>
        </div>

        <div className="legal-support-footer-links">
          <Link href="/contact">
            Submit a Web Inquiry <ArrowRight size={13} />
          </Link>
          <Link href="/track-order">
            Track Your Order Status <ArrowRight size={13} />
          </Link>
          <Link href="/faq">
            Frequently Asked Questions <ArrowRight size={13} />
          </Link>
        </div>
      </aside>
    </article>
  );
}
