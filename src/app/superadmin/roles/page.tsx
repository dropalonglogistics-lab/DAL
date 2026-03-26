'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Search, X, Check, History, Edit, Loader } from 'lucide-react';
import styles from './Roles.module.css';

const ALL_PERMISSIONS = [
    'View Analytics', 'Approve Routes', 'Moderate Alerts',
    'Manage Users', 'Manage Businesses', 'Manage Riders',
    'View Financials', 'Export Data', 'Send Broadcasts',
    'Manage Admins (Superadmin)', 'Manage Community'
];

type Admin = {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    avatar_url?: string;
    permissions: string[];
    lastActive: string;
};

type AuditEntry = {
    id: string;
    action: string;
    target_email: string;
    performed_by_name: string;
    permissions_after: string[];
    created_at: string;
};

type SearchResult = {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    avatar_url?: string;
};

export default function RolesPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<Admin | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
    const [selectedRole, setSelectedRole] = useState('admin');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/superadmin/roles');
            if (res.ok) {
                const data = await res.json();
                setAdmins(data.admins || []);
                setAuditLog(data.auditLog || []);
            }
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Search users with debounce
    useEffect(() => {
        if (editUser) return; // Don't search when editing existing
        const timer = setTimeout(async () => {
            if (searchQuery.length < 3) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            try {
                const res = await fetch(`/api/superadmin/search-user?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.results || []);
                }
            } finally {
                setSearching(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery, editUser]);

    const openModal = (admin: Admin | null = null) => {
        setEditUser(admin);
        if (admin) {
            setSelectedUser({ id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role });
            setSearchQuery(admin.email);
            setSelectedRole(admin.role);
            setSelectedPerms(admin.permissions.includes('All Permissions') ? ALL_PERMISSIONS : admin.permissions);
        } else {
            setSelectedUser(null);
            setSearchQuery('');
            setSearchResults([]);
            setSelectedRole('admin');
            setSelectedPerms([]);
        }
        setIsModalOpen(true);
    };

    const togglePerm = (perm: string) => {
        if (perm === 'Manage Admins (Superadmin)') return; // Safety — only via superadmin role
        setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
    };

    const handleSave = async () => {
        const target = selectedUser || (editUser ? { id: editUser.id, email: editUser.email } : null);
        if (!target) { alert('Please select a user first.'); return; }

        setSaving(true);
        try {
            const res = await fetch('/api/superadmin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: target.id,
                    role: selectedRole,
                    permissions: selectedPerms,
                    targetEmail: target.email,
                }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                await fetchData();
            } else {
                const data = await res.json();
                alert(`Failed to save: ${data.error}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleRevoke = async () => {
        if (!editUser) return;
        if (!confirm(`Revoke admin access for ${editUser.full_name}? They will be demoted to a regular user.`)) return;

        setSaving(true);
        try {
            const res = await fetch('/api/superadmin/roles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: editUser.id, targetEmail: editUser.email }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                await fetchData();
            } else {
                const data = await res.json();
                alert(`Failed to revoke: ${data.error}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Roles & Permissions</h1>
                    <p className={styles.subtitle}>Manage platform administrators and access control.</p>
                </div>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    <Plus size={18} /> Create Admin
                </button>
            </div>

            {/* Active Admins Table */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}><Shield size={20} /> Active Administrators</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '12px' }}>Loading administrators...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                        No administrators yet. Click "Create Admin" to assign the first one.
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Permissions Summary</th>
                                    <th>Last Active</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin.id}>
                                        <td>
                                            <div className={styles.userRow}>
                                                <div className={styles.avatar}>
                                                    {admin.avatar_url
                                                        ? <img src={admin.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                        : admin.full_name?.charAt(0)?.toUpperCase() || '?'
                                                    }
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{admin.full_name || 'Unknown'}</span>
                                                    <span className={styles.userEmail}>{admin.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${styles[admin.role]}`}>
                                                {admin.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.permissionsWrap}>
                                                {admin.permissions.slice(0, 3).map((p, i) => (
                                                    <span key={i} className={styles.permDot}>{p}</span>
                                                ))}
                                                {admin.permissions.length > 3 && (
                                                    <span className={styles.permMore}>+{admin.permissions.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.dateText}>{admin.lastActive}</td>
                                        <td>
                                            <button className={styles.actionBtn} onClick={() => openModal(admin)}>
                                                <Edit size={16} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Role Audit Log */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}><History size={20} /> Role Audit Log</h2>
                <div className={styles.tableWrapper}>
                    {auditLog.length === 0 ? (
                        <p style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            No role changes recorded yet.
                        </p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Action</th>
                                    <th>Target User</th>
                                    <th>Performed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLog.map(log => (
                                    <tr key={log.id}>
                                        <td className={styles.dateText}>{formatDate(log.created_at)}</td>
                                        <td style={{ fontWeight: 500 }}>{log.action}</td>
                                        <td>{log.target_email}</td>
                                        <td>{log.performed_by_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>{editUser ? 'Edit Administrator' : 'Assign Admin Role'}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            {/* User Search */}
                            <div className={styles.inputGroup}>
                                <label>Target User (Email, Phone, or Name)</label>
                                <div className={styles.searchBox} style={{ position: 'relative' }}>
                                    <Search size={18} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Search user..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        disabled={!!editUser}
                                    />
                                    {searching && (
                                        <Loader size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />
                                    )}
                                </div>
                                {/* Search results dropdown */}
                                {!editUser && searchResults.length > 0 && !selectedUser && (
                                    <div style={{
                                        position: 'relative', zIndex: 10, background: 'var(--surface-card)',
                                        border: '1px solid var(--border)', borderRadius: '8px', marginTop: '4px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)', overflow: 'hidden'
                                    }}>
                                        {searchResults.map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => { setSelectedUser(r); setSearchQuery(r.email); setSearchResults([]); }}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 14px', background: 'none', border: 'none',
                                                    cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)',
                                                    borderBottom: '1px solid var(--border)'
                                                }}
                                            >
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#000', flexShrink: 0 }}>
                                                    {r.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{r.full_name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.email}</div>
                                                </div>
                                                {r.role && r.role !== 'user' && (
                                                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', color: 'var(--color-gold)' }}>{r.role}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedUser && !editUser && (
                                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                                        <Check size={16} style={{ color: 'var(--color-gold)' }} />
                                        <span style={{ fontSize: '0.9rem' }}>Selected: <strong>{selectedUser.full_name}</strong> ({selectedUser.email})</span>
                                        <button onClick={() => { setSelectedUser(null); setSearchQuery(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={14} /></button>
                                    </div>
                                )}
                            </div>

                            {/* Role Selector */}
                            <div className={styles.inputGroup}>
                                <label>Assigned Role</label>
                                <select
                                    className={styles.select}
                                    value={selectedRole}
                                    onChange={e => setSelectedRole(e.target.value)}
                                >
                                    <option value="admin">Admin (Custom Permissions)</option>
                                    <option value="superadmin">Super Admin (Full Access)</option>
                                </select>
                            </div>

                            {/* Permissions Matrix — only for admin role */}
                            {selectedRole !== 'superadmin' && (
                                <>
                                    <div className={styles.matrixTitle}>Permissions Matrix</div>
                                    <div className={styles.permissionsGrid}>
                                        {ALL_PERMISSIONS.map(perm => (
                                            <label key={perm} className={styles.toggleRow}>
                                                <span className={styles.toggleText}>{perm}</span>
                                                <input
                                                    type="checkbox"
                                                    className={styles.toggleInput}
                                                    checked={selectedPerms.includes(perm)}
                                                    onChange={() => togglePerm(perm)}
                                                    disabled={perm === 'Manage Admins (Superadmin)'}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {selectedRole === 'superadmin' && (
                                <div style={{ padding: '14px', background: 'rgba(212,175,55,0.08)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Super Admins automatically receive all permissions.
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            {editUser && (
                                <button className={styles.revokeBtn} onClick={handleRevoke} disabled={saving}>
                                    Revoke Access
                                </button>
                            )}
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
