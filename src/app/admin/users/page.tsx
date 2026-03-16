'use client';

import { useState } from 'react';
import { Search, Shield, User, Star, MoreVertical, X, MapPin, Package, AlertTriangle, Navigation, ShieldOff, RotateCcw } from 'lucide-react';
import styles from './AdminUsers.module.css';

// Mock Data
const MOCK_USERS = [
    {
        id: 'USR-2021', name: 'Christopher Eke', email: 'ekechristopher@gmail.com',
        role: 'admin', isPremium: true, points: 450, joined: '2026-01-15', status: 'active',
        lastOrders: [{ id: 'ORD-991', desc: 'Jollof Rice delivery', date: 'Yesterday' }],
        alerts: 12, routes: 3
    },
    {
        id: 'USR-8910', name: 'Sarah Mensah', email: 'sarah.m@example.com',
        role: 'user', isPremium: false, points: 120, joined: '2026-02-20', status: 'active',
        lastOrders: [{ id: 'ORD-882', desc: 'Grocery run', date: '3 days ago' }],
        alerts: 2, routes: 0
    },
    {
        id: 'USR-9923', name: 'John Doe', email: 'john.d@example.com',
        role: 'user', isPremium: true, points: 890, joined: '2025-11-05', status: 'suspended',
        lastOrders: [], alerts: 45, routes: 12
    }
];

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const filteredUsers = MOCK_USERS.filter(user =>
        (filterRole === 'all' || user.role === filterRole) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Search and manage accounts, view deep profiles, and handle suspensions.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.filterWrap}>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className={styles.selectInput}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Standard Users</option>
                        <option value="admin">Admins</option>
                        <option value="superadmin">Super Admins</option>
                    </select>
                </div>

                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Users Table */}
                <div className={`${styles.tableWrap} ${selectedUser ? styles.shrinkTable : ''}`}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User Info</th>
                                <th>Role & Tier</th>
                                <th>Points</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr
                                    key={user.id}
                                    className={`${styles.trHover} ${selectedUser?.id === user.id ? styles.trActive : ''}`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatarWrap}>
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className={styles.userName}>{user.name}</div>
                                                <div className={styles.userEmail}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.roleWrap}>
                                            {user.role === 'admin' ? (
                                                <span className={`${styles.badge} ${styles.badgeAdmin}`}><Shield size={12} /> Admin</span>
                                            ) : (
                                                <span className={`${styles.badge} ${styles.badgeUser}`}>User</span>
                                            )}
                                            {user.isPremium && (
                                                <span className={styles.premiumStar} title="Premium Member"><Star size={14} fill="currentColor" /></span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.ptsWrap}>
                                            <strong>{user.points}</strong> pts
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusSuspended}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyTable}>
                                        <User size={32} className={styles.emptyIcon} />
                                        <p>No users match your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Side Panel */}
                {selectedUser && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <h2>User Profile Overview</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Profile Header */}
                            <div className={styles.profileHero}>
                                <div className={styles.heroAvatar}>
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className={styles.heroName}>{selectedUser.name}</h3>
                                    <p className={styles.heroId}>{selectedUser.id}</p>
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Points</span>
                                    <strong className={styles.statValueAuth}>{selectedUser.points}</strong>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Alerts Validated</span>
                                    <strong className={styles.statValueInfo}>{selectedUser.alerts}</strong>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Routes Mapped</span>
                                    <strong className={styles.statValueRoute}>{selectedUser.routes}</strong>
                                </div>
                            </div>

                            {/* Last Orders */}
                            <div className={styles.sectionWrap}>
                                <h4 className={styles.sectionTitle}><Package size={16} /> Recent Orders</h4>
                                {selectedUser.lastOrders.length > 0 ? (
                                    selectedUser.lastOrders.map((ord: any) => (
                                        <div key={ord.id} className={styles.orderRow}>
                                            <span>{ord.desc}</span>
                                            <span className={styles.orderDate}>{ord.date}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.emptyText}>No recent orders.</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className={styles.actionsWrapPanel}>
                                <h4 className={styles.sectionTitle}>Admin Controls</h4>

                                {selectedUser.status === 'active' ? (
                                    <button className={styles.btnDanger}>
                                        <ShieldOff size={16} /> Suspend Account (requires reason)
                                    </button>
                                ) : (
                                    <button className={styles.btnSuccess}>
                                        <Shield size={16} /> Reactivate Account
                                    </button>
                                )}

                                <button className={styles.btnWarning}>
                                    <RotateCcw size={16} /> Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
