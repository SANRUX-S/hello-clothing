'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  X,
  UserCheck,
  Building
} from 'lucide-react';
import type { AdminUserSession } from './AdminLogin';

interface AdminTeamSectionProps {
  currentAdmin: AdminUserSession;
  onNotice: (message: string) => void;
}

type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'co_admin' | 'admin';
  status: 'active' | 'suspended';
  created_at?: string;
  last_login?: string | null;
};

const ROLE_META = {
  super_admin: {
    label: 'Super Admin',
    color: '#a855f7',
    bg: '#3b0764',
    border: '#7e22ce',
    tag: 'FULL STORE CONTROL',
    description: 'Financials, staff management, store settings, product catalog, orders & database administration',
  },
  co_admin: {
    label: 'Co-Admin (Manager)',
    color: '#38bdf8',
    bg: '#082f49',
    border: '#0284c7',
    tag: 'CATALOG & EDITORIAL',
    description: 'Product catalog, variant stock quantities, categories, store banners & editorial content',
  },
  admin: {
    label: 'Admin Staff',
    color: '#4ade80',
    bg: '#052e16',
    border: '#166534',
    tag: 'ORDERS & DISPATCH',
    description: 'Order fulfillment, courier waybills, receipt printing, customer WhatsApp & inventory inspection',
  },
};

export default function AdminTeamSection({ currentAdmin, onNotice }: AdminTeamSectionProps) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'super_admin' | 'co_admin' | 'admin'>('admin');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          requesterEmail: currentAdmin.email,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.team)) {
        setTeam(data.team);
      } else {
        onNotice(data.error || 'Failed to load team members.');
      }
    } catch {
      onNotice('Could not connect to team management API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [currentAdmin.email]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('Please provide full name, email address, and initial password.');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_admin',
          requesterEmail: currentAdmin.email,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          password: formPassword.trim(),
          role: formRole,
          status: 'active',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onNotice(`Staff member ${formName} added as ${ROLE_META[formRole].label}!`);
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('admin');
        setAddModalOpen(false);
        await fetchTeam();
      } else {
        setFormError(data.error || 'Failed to save admin user.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error saving team member.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (target: TeamMember) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_admin',
          requesterEmail: currentAdmin.email,
          email: target.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onNotice(`Admin account for ${target.email} removed.`);
        setDeleteTarget(null);
        await fetchTeam();
      } else {
        onNotice(data.error || 'Failed to remove admin member.');
      }
    } catch {
      onNotice('Network error removing admin account.');
    }
  };

  if (currentAdmin.role !== 'super_admin') {
    return (
      <section className="admin-panel" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#eab308" style={{ margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Super Admin Authorization Required</h2>
        <p style={{ maxWidth: '520px', margin: '0 auto 20px', color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
          You are currently signed in as <strong>{currentAdmin.name}</strong> ({ROLE_META[currentAdmin.role]?.label || currentAdmin.role}).
          Access to add, modify, or revoke admin staff accounts is restricted exclusively to Super Admins.
        </p>
        <span style={{ display: 'inline-block', background: '#1c1d1d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', color: '#71717a' }}>
          Contact superadmin@helloclothing.store for permission escalation.
        </span>
      </section>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
            Store Administrators & Staff Roster
          </h2>
          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
            Hierarchical role permissions managed via Penetix Engine with encrypted authentication.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-button admin-button-quiet"
            onClick={fetchTeam}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'admin-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            className="admin-button"
            onClick={() => setAddModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: '#000', fontWeight: 700 }}
          >
            <UserPlus size={15} /> Add Team Member
          </button>
        </div>
      </div>

      {/* Role explanation cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {(['super_admin', 'co_admin', 'admin'] as const).map(roleKey => {
          const meta = ROLE_META[roleKey];
          const count = team.filter(m => m.role === roleKey).length;
          return (
            <div
              key={roleKey}
              style={{
                background: '#121215',
                border: `1px solid ${meta.border}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: meta.color,
                    background: meta.bg,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${meta.border}`,
                  }}
                >
                  {meta.tag}
                </span>
                <strong style={{ fontSize: '13px', color: '#fff' }}>
                  {count} Active
                </strong>
              </div>
              <h3 style={{ fontSize: '15px', margin: '4px 0 0', color: '#fff' }}>{meta.label}</h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                {meta.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Team table panel */}
      <section className="admin-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', margin: 0, color: '#fff' }}>Active Administrators ({team.length})</h3>
            <span style={{ fontSize: '12px', color: '#71717a' }}>Authorized store management identities</span>
          </div>
          <span style={{ fontSize: '11px', color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            Penetix Live Roster
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>
            <RefreshCw size={20} className="admin-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
            Loading admin members from database…
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ADMIN USER</th>
                  <th>ASSIGNED ROLE</th>
                  <th>STATUS</th>
                  <th>LAST LOGIN</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {team.map(member => {
                  const meta = ROLE_META[member.role] || ROLE_META.admin;
                  const isCurrent = member.email.toLowerCase() === currentAdmin.email.toLowerCase();
                  const isRoot = member.email.toLowerCase() === 'superadmin@helloclothing.store';

                  return (
                    <tr key={member.id || member.email}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: meta.border,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            {member.name ? member.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '13px', display: 'block', color: '#fff' }}>
                              {member.name}
                              {isCurrent && (
                                <span style={{ marginLeft: '6px', fontSize: '10px', color: '#4ade80', background: '#052e16', border: '1px solid #166534', padding: '1px 6px', borderRadius: '4px' }}>
                                  You
                                </span>
                              )}
                            </strong>
                            <small style={{ color: '#a1a1aa', fontSize: '11px' }}>{member.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: meta.bg,
                            border: `1px solid ${meta.border}`,
                            color: meta.color,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
                          {meta.label}
                        </span>
                      </td>

                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: member.status === 'active' ? '#4ade80' : '#f87171' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: member.status === 'active' ? '#22c55e' : '#ef4444' }} />
                          {member.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '11px', color: member.last_login ? '#e4e4e7' : '#71717a' }}>
                          {member.last_login ? new Date(member.last_login).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never logged in'}
                        </span>
                      </td>

                      <td>
                        {isRoot ? (
                          <span style={{ fontSize: '11px', color: '#71717a', fontStyle: 'italic' }}>
                            Primary Root Admin
                          </span>
                        ) : isCurrent ? (
                          <span style={{ fontSize: '11px', color: '#71717a', fontStyle: 'italic' }}>
                            Active Session
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="admin-icon-button"
                            onClick={() => setDeleteTarget(member)}
                            title="Remove staff account"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '12px 20px', background: '#09090b', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#71717a' }}>
          <span>Total: {team.length} authorized staff members</span>
          <span>Authentication Provider: Penetix Engine (Encrypted Scrypt)</span>
        </div>
      </section>

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setAddModalOpen(false); }}>
          <div className="admin-modal" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-heading">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="#22c55e" /> Add New Team Member
              </h2>
              <button className="admin-icon-button" onClick={() => setAddModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5 }}>
                Adding a staff member stores their credentials directly in the database. They can immediately log in at <strong>/admin</strong> using their email and assigned password.
              </div>

              {formError && (
                <div style={{ background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  {formError}
                </div>
              )}

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#a1a1aa' }}>
                Full Name
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  style={{ padding: '8px 10px', background: '#1c1d1d', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#a1a1aa' }}>
                Email Address
                <input
                  type="email"
                  required
                  placeholder="e.g. kasun@helloclothing.store"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  style={{ padding: '8px 10px', background: '#1c1d1d', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#a1a1aa' }}>
                Initial Password
                <input
                  type="text"
                  required
                  placeholder="e.g. HelloClothing#Staff2026!"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  style={{ padding: '8px 10px', background: '#1c1d1d', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#a1a1aa' }}>
                Role & Permissions
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as any)}
                  style={{ padding: '8px 10px', background: '#1c1d1d', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="admin">Admin Staff — Orders, Dispatch, Receipts & Stock Count</option>
                  <option value="co_admin">Co-Admin (Manager) — Catalog, Categories, Content & Stock</option>
                  <option value="super_admin">Super Admin — Full Ownership & Team Privileges</option>
                </select>
              </label>

              <div style={{ background: ROLE_META[formRole].bg, border: `1px solid ${ROLE_META[formRole].border}`, borderRadius: '6px', padding: '10px 12px', fontSize: '11px', color: ROLE_META[formRole].color }}>
                <strong>{ROLE_META[formRole].label} Scope:</strong> {ROLE_META[formRole].description}
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="admin-button admin-button-quiet"
                  onClick={() => setAddModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button"
                  disabled={formSubmitting}
                  style={{ background: '#22c55e', color: '#000', fontWeight: 700 }}
                >
                  {formSubmitting ? 'Saving…' : 'Save & Authorize Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="admin-modal" style={{ maxWidth: '440px' }}>
            <div className="admin-modal-heading">
              <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} /> Revoke Admin Access?
              </h2>
              <button className="admin-icon-button" onClick={() => setDeleteTarget(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#d4d4d8' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to revoke administrator access for{' '}
                <strong style={{ color: '#fff' }}>{deleteTarget.name}</strong> ({deleteTarget.email})?
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa' }}>
                This user will immediately lose access to the HELLO! admin portal and can no longer view customer orders or edit products.
              </p>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-button admin-button-quiet"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-danger"
                  onClick={() => handleDeleteAdmin(deleteTarget)}
                >
                  <Trash2 size={14} /> Revoke Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
