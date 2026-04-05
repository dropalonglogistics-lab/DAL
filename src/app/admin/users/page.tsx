'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, User as UserIcon, Star, MoreVertical, X, MapPin, Package, AlertTriangle, Navigation, ShieldOff, RotateCcw, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getAdminUsers, updateUserStatus } from '../actions';
import styles from './AdminUsers.module.css';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    is_admin: boolean;
    wallet_balance: number;
    created_at: string;
    status: string;
    last_visited_at: string;
    total_orders: number;
    total_alerts_submitted: number;
    total_routes_suggested: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClient();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await getAdminUsers();
        if (result.success) {
            setUsers(result.data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();

        const channel = supabase
            .channel('admin_users_all')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchUsers]);

    const handleStatusUpdate = async (userId: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'reactivate' : 'suspend'} this account?`)) return;
        
        setIsUpdating(true);
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('status', newStatus);
        
        const result = await updateUserStatus(formData);
        if (result.success) {
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, status: newStatus });
            }
            fetchUsers();
        } else {
            alert(result.error);
        }
        setIsUpdating(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        if (filterRole === 'all') return matchesSearch;
        if (filterRole === 'admin') return user.is_admin && matchesSearch;
        if (filterRole === 'user') return !user.is_admin && matchesSearch;
        return matchesSearch;
    });

    const formatLastVisited = (date: string) => {
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Search and manage accounts, track real-time activity, and handle moderation.</p>
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
                                <th>Activity Status</th>
                                <th>Real-time Tracker</th>
                                <th>Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyTable}>
                                        <div className={styles.spinner} />
                                        <p>Fetching user directory...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr
                                    key={user.id}
                                    className={`${styles.trHover} ${selectedUser?.id === user.id ? styles.trActive : ''}`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatarWrap}>
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <div className={styles.userName}>{user.full_name || 'Unnamed User'}</div>
                                                <div className={styles.userEmail}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.roleWrap}>
                                            {user.is_admin ? (
                                                <span className={`${styles.badge} ${styles.badgeAdmin}`}><Shield size={12} /> Admin</span>
                                            ) : (
                                                <span className={`${styles.badge} ${styles.badgeUser}`}>User</span>
                                            )}
                                            <span className={`${styles.statusBadge} ${user.status === 'suspended' ? styles.statusSuspended : styles.statusActive}`}>
                                                {user.status || 'active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.ptsWrap}>
                                            <Clock size={12} className={styles.dataIcon} />
                                            <span>{formatLastVisited(user.last_visited_at)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.ptsWrap}>
                                            <strong>{user.wallet_balance}</strong> pts
                                        </div>
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
                                        <UserIcon size={32} className={styles.emptyIcon} />
                                        <p>No users found in the database.</p>
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
                            <h2>User Dashboard Intelligence</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Profile Header */}
                            <div className={styles.profileHero}>
                                <div className={styles.heroAvatar}>
                                    <UserIcon size={32} />
                                </div>
                                <div>
                                    <h3 className={styles.heroName}>{selectedUser.full_name}</h3>
                                    <p className={styles.heroId}>{selectedUser.id}</p>
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Points</span>
                                    <strong className={styles.statValueAuth}>{selectedUser.wallet_balance}</strong>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Alerts</span>
                                    <strong className={styles.statValueInfo}>{selectedUser.total_alerts_submitted}</strong>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Routes</span>
                                    <strong className={styles.statValueRoute}>{selectedUser.total_routes_suggested}</strong>
                                </div>
                            </div>

                            {/* Timeline Info */}
                            <div className={styles.sectionWrap}>
                                <h4 className={styles.sectionTitle}><Clock size={16} /> Activity Tracking</h4>
                                <div className={styles.orderRow}>
                                    <span>Last Seen:</span>
                                    <span className={styles.orderDate}>{formatLastVisited(selectedUser.last_visited_at)}</span>
                                </div>
                                <div className={styles.orderRow}>
                                    <span>Joined:</span>
                                    <span className={styles.orderDate}>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actionsWrapPanel}>
                                <h4 className={styles.sectionTitle}>Admin Moderation</h4>

                                {selectedUser.status !== 'suspended' ? (
                                    <button 
                                        className={styles.btnDanger} 
                                        onClick={() => handleStatusUpdate(selectedUser.id, 'suspended')}
                                        disabled={isUpdating}
                                    >
                                        <ShieldOff size={16} /> {isUpdating ? 'Please wait...' : 'Suspend Account'}
                                    </button>
                                ) : (
                                    <button 
                                        className={styles.btnSuccess} 
                                        onClick={() => handleStatusUpdate(selectedUser.id, 'active')}
                                        disabled={isUpdating}
                                    >
                                        <Shield size={16} /> {isUpdating ? 'Please wait...' : 'Reactivate Account'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
