'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import './admin-login.css';

export type AdminUserSession = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'co_admin' | 'admin';
  status: 'active' | 'suspended';
};

interface AdminLoginProps {
  onSuccess: (user: AdminUserSession) => void;
}

const DEFAULT_ACCOUNTS = [
  {
    roleLabel: 'Super Admin',
    roleKey: 'super_admin' as const,
    name: 'Executive Super Admin',
    email: 'superadmin@helloclothing.store',
    pass: 'HelloClothing#SuperAdmin2026!',
    badge: 'FULL STORE CONTROL',
    badgeColor: '#eab308',
    description: 'Products, Orders, Financials, Content, Settings & Staff Access',
  },
  {
    roleLabel: 'Co-Admin (Manager)',
    roleKey: 'co_admin' as const,
    name: 'Store Operations Manager',
    email: 'manager@helloclothing.store',
    pass: 'HelloClothing#CoAdmin2026!',
    badge: 'CATALOG & MARKETING',
    badgeColor: '#38bdf8',
    description: 'Inventory, Products, Categories, Editorial Content & Orders',
  },
  {
    roleLabel: 'Admin (Staff)',
    roleKey: 'admin' as const,
    name: 'Order Fulfillment Staff',
    email: 'staff@helloclothing.store',
    pass: 'HelloClothing#AdminStaff2026!',
    badge: 'FULFILLMENT & COURIER',
    badgeColor: '#a855f7',
    description: 'Order Tracking, Dispatch Waybills, Invoices & Stock Count',
  },
];

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.authorized) {
        throw new Error(data.error || 'Invalid email or password. Please verify your credentials.');
      }

      const session: AdminUserSession = data.user;

      // Save locally
      try {
        localStorage.setItem('hello-admin-session', JSON.stringify(session));
      } catch {}

      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAccount = (acc: typeof DEFAULT_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Top Branding */}
        <div className="admin-login-header">
          <Link href="/" className="admin-login-logo" aria-label="HELLO! home">
            <img src="/branding/hello-light.webp" alt="HELLO!" />
          </Link>
          <div className="admin-auth-badge">
            <span className="auth-dot" />
            STORE WORKSPACE ACCESS · PENETIX
          </div>
          <h1>Management Portal</h1>
          <p>Sign in to manage catalog, track islandwide fulfillment, and oversee store operations.</p>
        </div>

        {error && (
          <div className="admin-login-alert admin-login-alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="admin-input-group">
              <Mail size={16} />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@helloclothing.store"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <div className="admin-field-label-row">
              <label htmlFor="admin-password">Password</label>
            </div>
            <div className="admin-input-group">
              <Lock size={16} />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="admin-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING…' : 'SIGN IN TO WORKSPACE'} <ArrowRight size={17} />
          </button>
        </form>

        {/* Quick Roles Preset Selector */}
        <div className="admin-presets-section">
          <div className="admin-presets-header">
            <Sparkles size={14} color="#eab308" />
            <span>INSTANT TEST CREDENTIALS (CLICK TO FILL)</span>
          </div>

          <div className="admin-preset-cards">
            {DEFAULT_ACCOUNTS.map(acc => (
              <button
                key={acc.roleKey}
                type="button"
                className="admin-preset-card"
                onClick={() => handleFillAccount(acc)}
              >
                <div className="admin-preset-top">
                  <strong>{acc.roleLabel}</strong>
                  <span style={{ color: acc.badgeColor, borderColor: `${acc.badgeColor}40` }}>
                    {acc.badge}
                  </span>
                </div>
                <div className="admin-preset-email">{acc.email}</div>
                <div className="admin-preset-desc">{acc.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-login-footer">
          <Link href="/">
            <ArrowLeft size={14} /> Back to Storefront
          </Link>
          <span>HELLO! CLOTHING · SECURE ADMIN ACCESS</span>
        </div>
      </div>
    </div>
  );
}
