'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Package, AlertTriangle, CheckSquare, RefreshCw, Eye, Navigation, ShieldAlert, Activity } from 'lucide-react';
import styles from './Admin.module.css';
import { getAdminDashboardData } from './actions';

export default function AdminOverviewPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const refreshData = useCallback(async () => {
        setLoading(true);
        const result = await getAdminDashboardData();
        if (result) {
            setData(result);
            setLastUpdated(new Date());
        }
        setLoading(false);
    }, []);

    // Initial load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Auto-refresh every 60s
    useEffect(() => {
        const interval = setInterval(refreshData, 60000);
        return () => clearInterval(interval);
    }, [refreshData]);

    if (!data && loading) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={32} style={{ animation: 'spin 2s linear infinite' }} />
                    <p style={{ marginTop: '16px' }}>Loading real-time intelligence...</p>
                </div>
            </div>
        );
    }

    const { metrics, recentAlerts, pendingRoutes, activityLog } = data || {
        metrics: { activeUsers: 0, pendingRoutes: 0, activeAlerts: 0, openDeliveries: 0 },
        recentAlerts: [],
        pendingRoutes: [],
        activityLog: []
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Admin Overview</h1>
                    <p className={styles.subtitle}>Direct connection to Supabase Intelligence Layer.</p>
                </div>
                <div className={styles.liveIndicator}>
                    <div className={`${styles.pulseDot} ${loading ? styles.refreshing : ''}`} />
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                    <button onClick={refreshData} disabled={loading} className={styles.refreshBtn}>
                        <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className={styles.metricsGrid}>
                {/* Active Users */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Total Users</span>
                        <div className={styles.metricIconWrap}><Users size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.activeUsers.toLocaleString()}</span>
                        <span className={styles.metricStatus}>Synced</span>
                    </div>
                </div>

                {/* Open Deliveries */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Active Orders</span>
                        <div className={styles.metricIconWrap}><Package size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.openDeliveries}</span>
                        <span className={styles.metricStatus}>Real-time</span>
                    </div>
                </div>

                {/* Alerts Today */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Active Alerts</span>
                        <div className={styles.metricIconWrap}><AlertTriangle size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.activeAlerts}</span>
                        <span className={styles.metricStatus}>Unresolved</span>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className={`${styles.metricCard} ${metrics.pendingRoutes > 0 ? styles.metricAlert : ''}`}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Pending Routes</span>
                        <div className={styles.metricIconWrap}><CheckSquare size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.pendingRoutes}</span>
                        <span className={styles.metricStatus}>Requires Review</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.bentoGrid}>
                {/* Left Column: Actions */}
                <div className={styles.leftCol}>
                    <div className={styles.actionCard}>
                        <div className={styles.cardHeader}>
                            <h3>Pending Route Submissions</h3>
                            <a href="/admin/routes" className={styles.textBtn}>View All</a>
                        </div>
                        <div className={styles.listContainer}>
                            {pendingRoutes.length === 0 ? (
                                <p className={styles.emptyList}>No pending submissions.</p>
                            ) : (
                                pendingRoutes.map((route: any) => (
                                    <div key={route.id} className={styles.listItem}>
                                        <div className={styles.listInfo}>
                                            <div className={styles.listIcon}><Navigation size={16} /></div>
                                            <div>
                                                <p className={styles.listTitle}>{route.origin} to {route.destination}</p>
                                                <p className={styles.listSub}>By {route.profiles?.full_name || 'Anonymous'} • {route.upvote_count || 0} Upvotes</p>
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <a href={`/admin/routes?id=${route.id}`} className={styles.outlineBtn}><Eye size={14} /> Review</a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={styles.actionCard}>
                        <div className={styles.cardHeader}>
                            <h3>Points Activity</h3>
                        </div>
                        <div className={styles.activityList}>
                            {activityLog.length === 0 ? (
                                <p className={styles.emptyList}>No recent activity logged.</p>
                            ) : (
                                activityLog.map((log: any) => (
                                    <div key={log.id} className={styles.activityItem}>
                                        <div className={styles.activityAvatar}>
                                            <Activity size={14} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <p className={styles.activityTitle}>
                                                <strong>{log.profiles?.full_name || 'System'}</strong> earned {log.points_change} pts
                                            </p>
                                            <p className={styles.activityDetail}>{log.action.replace('_', ' ')}</p>
                                        </div>
                                        <span className={styles.activityTime}>
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Feeds */}
                <div className={styles.rightCol}>
                    <div className={styles.feedCard}>
                        <div className={styles.cardHeader}>
                            <h3>Recent Road Alerts</h3>
                            <a href="/admin/alerts" className={styles.textBtn}>Manage</a>
                        </div>
                        <div className={styles.feedList}>
                            {recentAlerts.length === 0 ? (
                                <p className={styles.emptyList}>No active road alerts.</p>
                            ) : (
                                recentAlerts.map((alert: any) => (
                                    <div key={alert.id} className={styles.feedItem}>
                                        <div className={styles.feedType}>
                                            <ShieldAlert size={14} />
                                            <span>{alert.type.toUpperCase()}</span>
                                        </div>
                                        <div className={styles.feedContent}>
                                            <p className={styles.feedMain}>{alert.location || 'Unknown Location'}</p>
                                            <div className={styles.feedMeta}>
                                                <span>{alert.upvote_count || 0} Confirmations</span>
                                                <span>•</span>
                                                <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <span className={`${styles.statusBadge} ${styles[alert.status]}`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
