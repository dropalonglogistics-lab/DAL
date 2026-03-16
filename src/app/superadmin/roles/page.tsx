'use client';

import { useState } from 'react';
import { Shield, Plus, Search, X, Check, History, Edit } from 'lucide-react';
import styles from './Roles.module.css';

// Mock Data
const MOCK_ADMINS = [
    {
        id: 1, name: 'Christopher Eke', email: 'ekechristopher@gmail.com', role: 'superadmin',
        lastActive: 'Just now',
        permissions: ['All Permissions']
    },
    {
        id: 2, name: 'Belinda Osb', email: 'belsobunge@gmail.com', role: 'superadmin',
        lastActive: '2h ago',
        permissions: ['All Permissions']
    },
    {
        id: 3, name: 'Support Rep', email: 'support@dal.com', role: 'admin',
        lastActive: '5m ago',
        permissions: ['Moderate Alerts', 'Manage Users', 'Approve Routes']
    }
];

const MOCK_AUDIT = [
    { id: 101, timestamp: '2026-03-16 10:23 AM', action: 'Assigned admin role', target: 'support@dal.com', by: 'Christopher Eke' },
    { id: 102, timestamp: '2026-03-15 02:10 PM', action: 'Revoked admin role', target: 'oldrep@dal.com', by: 'Belinda Osb' },
];

const ALL_PERMISSIONS = [
    'View Analytics', 'Approve Routes', 'Moderate Alerts',
    'Manage Users', 'Manage Businesses', 'Manage Riders',
    'View Financials', 'Export Data', 'Send Broadcasts',
    'Manage Admins (Superadmin)', 'Manage Community'
];

export default function RolesPage() {
    const [admins, setAdmins] = useState(MOCK_ADMINS);
    const [auditLog, setAuditLog] = useState(MOCK_AUDIT);

    // Modal state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('admin');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

    type AdminUser = typeof MOCK_ADMINS[number];
    const openModal = (user: AdminUser | null = null) => {
        setEditUser(user);
        if (user) {
            setSearchTerm(user.email);
            setSelectedRole(user.role);
            setSelectedPerms((user as any).permissions.includes('All Permissions') ? ALL_PERMISSIONS : (user as any).permissions);
        } else {
            setSearchTerm('');
            setSelectedRole('admin');
            setSelectedPerms([]);
        }
        setIsMenuOpen(true);
    };

    const togglePerm = (perm: string) => {
        setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
    };

    const handleSave = () => {
        alert("Role changes saved (Mock)");
        setIsMenuOpen(false);
    };

    const handleRevoke = () => {
        if (confirm("Revoke admin access for this user?")) {
            alert("Role revoked (Mock)");
            setIsMenuOpen(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Roles & Permissions</h1>
                    <p className={styles.subtitle}>Manage platform administrators and access control.</p>
                </div>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    <Plus size={18} /> Assign Role
                </button>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}><Shield size={20} /> Active Administrators</h2>
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
                                            <div className={styles.avatar}>{admin.name.charAt(0)}</div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{admin.name}</span>
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
                                        <button className={styles.actionBtn} onClick={() => openModal(admin as any)}>
                                            <Edit size={16} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}><History size={20} /> Role Audit Log</h2>
                <div className={styles.tableWrapper}>
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
                                    <td className={styles.dateText}>{log.timestamp}</td>
                                    <td style={{ fontWeight: 500 }}>{log.action}</td>
                                    <td>{log.target}</td>
                                    <td>{log.by}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isMenuOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>{editUser ? 'Edit Administrator' : 'Assign Admin Role'}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label>Target User (Email or Phone)</label>
                                <div className={styles.searchBox}>
                                    <Search size={18} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Search user..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={!!editUser}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Assigned Role</label>
                                <select
                                    className={styles.select}
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="admin">Admin (Custom Permissions)</option>
                                    <option value="superadmin">Super Admin (Full Access)</option>
                                </select>
                            </div>

                            {selectedRole !== 'superadmin' && (
                                <>
                                    <div className={styles.matrixTitle}>Permissions Matrix</div>
                                    <div className={styles.permissionsGrid}>
                                        {ALL_PERMISSIONS.map(perm => {
                                            if (perm === 'Manage Admins (Superadmin)') return null; // Safety
                                            return (
                                                <label key={perm} className={styles.toggleRow}>
                                                    <span className={styles.toggleText}>{perm}</span>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.toggleInput}
                                                        checked={selectedPerms.includes(perm)}
                                                        onChange={() => togglePerm(perm)}
                                                    />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            {editUser && (
                                <button className={styles.revokeBtn} onClick={handleRevoke}>
                                    Revoke Access
                                </button>
                            )}
                            <button className={styles.cancelBtn} onClick={() => setIsMenuOpen(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave}>Save Configuration</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
