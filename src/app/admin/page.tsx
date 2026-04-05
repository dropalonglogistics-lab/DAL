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

    const { metrics, recentAlerts, pendingRoutes, activityLog, recentVisits } = data || {
        metrics: { userCount: 0, pendingRoutes: 0, activeAlerts: 0, openDeliveries: 0 },
        recentAlerts: [],
        pendingRoutes: [],
        activityLog: [],
        recentVisits: []
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
                {/* Total Users */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Total Users</span>
                        <div className={styles.metricIconWrap}><Users size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{(metrics.userCount || 0).toLocaleString()}</span>
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
                        <span className={styles.metricValue}>{metrics.openDeliveries || 0}</span>
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
                        <span className={styles.metricValue}>{metrics.activeAlerts || 0}</span>
                        <span className={styles.metricStatus}>Live Feed</span>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Pending Approval</span>
                        <div className={styles.metricIconWrap}><CheckSquare size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.pendingRoutes || 0}</span>
                        <span className={styles.metricStatus}>Awaiting Review</span>
                    </div>
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                {/* Recent Alerts Feed */}
                <div className={styles.feedCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerIcon}><ShieldAlert size={16} /></div>
                        <h3>Recent Intelligence Alerts</h3>
                        <a href="/admin/alerts" className={styles.viewAll}>View History</a>
                    </div>
                    <div className={styles.activityList}>
                        {recentAlerts?.length === 0 ? (
                            <p className={styles.emptyList}>No active alerts found.</p>
                        ) : (
                            recentAlerts?.map((alert: any) => (
                                <div key={alert.id} className={styles.activityItem}>
                                    <div className={`${styles.statusDot} ${styles[alert.severity]}`} />
                                    <div className={styles.activityInfo}>
                                        <p className={styles.activityTitle}>{alert.title || alert.type}</p>
                                        <p className={styles.activityMeta}>
                                            Reported {new Date(alert.created_at).toLocaleTimeString()} · {alert.area || 'Unknown Area'}
                                        </p>
                                    </div>
                                    <span className={`${styles.badge} ${styles[alert.status]}`}>{alert.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Routes Feed */}
                <div className={styles.feedCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerIcon}><Navigation size={16} /></div>
                        <h3>Route Approvals Required</h3>
                        <a href="/admin/routes" className={styles.viewAll}>Manage All</a>
                    </div>
                    <div className={styles.activityList}>
                        {pendingRoutes?.length === 0 ? (
                            <p className={styles.emptyList}>No pending routes to review.</p>
                        ) : (
                            pendingRoutes?.map((route: any) => (
                                <div key={route.id} className={styles.activityItem}>
                                    <div className={styles.avatarMini}>{route.profiles?.full_name?.charAt(0) || 'U'}</div>
                                    <div className={styles.activityInfo}>
                                        <p className={styles.activityTitle}>{route.name}</p>
                                        <p className={styles.activityMeta}>
                                            by {route.profiles?.full_name || 'Anonymous'} · {route.origin} to {route.destination}
                                        </p>
                                    </div>
                                    <button className={styles.miniActionBtn}><Eye size={14} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Activity Log Feed */}
                <div className={styles.feedCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerIcon}><Activity size={16} /></div>
                        <h3>Global Activity Log</h3>
                    </div>
                    <div className={styles.activityList}>
                        {activityLog?.length === 0 ? (
                            <p className={styles.emptyList}>No recent activity logged.</p>
                        ) : (
                            activityLog?.map((action: any) => (
                                <div key={action.id} className={styles.activityItem}>
                                    <div className={styles.activityInfo}>
                                        <p className={styles.activityTitle}>
                                            <strong>{action.profiles?.full_name || 'User'}</strong> earned {action.points_change} points
                                        </p>
                                        <p className={styles.activityMeta}>
                                            Action: {action.action.replace('_', ' ')} · {new Date(action.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Visitors Feed */}
                <div className={styles.actionCard}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Platform Visitors</h3>
                    </div>
                    <div className={styles.activityList}>
                        {recentVisits?.length === 0 ? (
                            <p className={styles.emptyList}>No visits tracked yet.</p>
                        ) : (
                            recentVisits?.map((visit: any) => (
                                <div key={visit.id} className={styles.activityItem}>
                                    <div className={styles.activityInfo}>
                                        <p className={styles.activityTitle}>{visit.full_name || 'Anonymous Member'}</p>
                                        <p className={styles.activityMeta}>
                                            Last seen {new Date(visit.last_visited_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className={styles.onlineStatus} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
