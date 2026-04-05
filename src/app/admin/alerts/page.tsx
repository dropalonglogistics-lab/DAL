'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldAlert, CheckCircle, XCircle, AlertTriangle, AlertOctagon, Info, MapPin, Clock, User as UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getAdminAlerts, updateAlertStatus } from '../actions';
import styles from './AdminAlerts.module.css';

interface Alert {
    id: string;
    type: string;
    location: string;
    description: string;
    severity: string;
    status: string;
    upvote_count: number;
    created_at: string;
    profiles?: { full_name: string };
}

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const supabase = createClient();

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        const result = await getAdminAlerts();
        if (result.success) {
            setAlerts(result.data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAlerts();

        const channel = supabase
            .channel('admin_alerts_all')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
                fetchAlerts();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchAlerts]);

    const handleAction = async (alertId: string, status: string) => {
        setIsUpdating(alertId);
        const formData = new FormData();
        formData.append('alertId', alertId);
        formData.append('status', status);
        
        // We'll assume updateAlertStatus exists or create it in actions.ts
        const { updateAlertStatus } = await import('../actions');
        const result = await updateAlertStatus(formData);
        
        if (result.success) {
            fetchAlerts();
        } else {
            alert(result.error);
        }
        setIsUpdating(null);
    };

    const filteredAlerts = alerts.filter(alert =>
        (filterStatus === 'all' || alert.status === filterStatus) &&
        (alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (alert.location || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'accident': return <AlertOctagon size={16} />;
            case 'traffic': case 'traffic jam': return <AlertTriangle size={16} />;
            case 'police': case 'taskforce': return <ShieldAlert size={16} />;
            default: return <Info size={16} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>;
            case 'dismissed': return <span className={`${styles.badge} ${styles.badgeDismissed}`}>Dismissed</span>;
            case 'escalated': return <span className={`${styles.badge} ${styles.badgeEscalated}`}>Escalated</span>;
            default: return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Review</span>;
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Live Alerts Moderation</h1>
                    <p className={styles.subtitle}>Verify, dismiss, or escalate community reported incidents from the live database.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.filterWrap}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.selectInput}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active/New</option>
                        <option value="verified">Verified Active</option>
                        <option value="dismissed">Dismissed/Resolved</option>
                    </select>
                </div>

                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search locations or types..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Alert Details</th>
                            <th>Location & Time</th>
                            <th>Reporter</th>
                            <th>Status & Trust</th>
                            <th className={styles.actionsBox}>Moderation Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className={styles.emptyTable}>
                                    <div className={styles.spinner} />
                                    <p>Loading active alerts hierarchy...</p>
                                </td>
                            </tr>
                        ) : filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                            <tr key={alert.id} className={styles.trHover}>
                                <td className={styles.cellMain}>
                                    <div className={styles.typeWrap}>
                                        <div className={`${styles.typeIcon} ${alert.severity === 'critical' ? styles.iconHigh : styles.iconNormal}`}>
                                            {getIconForType(alert.type)}
                                        </div>
                                        <div>
                                            <div className={styles.typeText}>{alert.type}</div>
                                            <div className={styles.idText}>{alert.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                    <p className={styles.descText}>{alert.description || 'No description provided.'}</p>
                                </td>
                                <td>
                                    <div className={styles.metaRow}>
                                        <MapPin size={14} className={styles.metaIcon} />
                                        <span className={styles.metaMain}>{alert.location || 'Area unknown'}</span>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <Clock size={14} className={styles.metaIcon} />
                                        <span className={styles.metaSub}>{formatTime(alert.created_at)}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.metaRow}>
                                        <UserIcon size={14} className={styles.metaIcon} />
                                        <span className={styles.metaMain}>{alert.profiles?.full_name || 'Anonymous'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.statusWrap}>
                                        {getStatusBadge(alert.status)}
                                        <div className={styles.upvoteWrap}>
                                            <span className={styles.upvoteCount}>{alert.upvote_count}</span>
                                            <span className={styles.upvoteLabel}>Confirms</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.actionsBox}>
                                    {(alert.status === 'active' || alert.status === 'pending') ? (
                                        <div className={styles.actionGrid}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.btnVerify}`} 
                                                onClick={() => handleAction(alert.id, 'verified')}
                                                disabled={isUpdating === alert.id}
                                            >
                                                <CheckCircle size={16} /> Verify
                                            </button>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.btnDismiss}`}
                                                onClick={() => handleAction(alert.id, 'dismissed')}
                                                disabled={isUpdating === alert.id}
                                            >
                                                <XCircle size={16} /> Dismiss
                                            </button>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.btnEscalate}`}
                                                onClick={() => handleAction(alert.id, 'escalated')}
                                                disabled={isUpdating === alert.id}
                                            >
                                                <ShieldAlert size={16} /> Escalate
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={styles.resolvedText}>Settled as {alert.status}</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className={styles.emptyTable}>
                                    <ShieldAlert size={32} className={styles.emptyIcon} />
                                    <p>No active reports in this region.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
