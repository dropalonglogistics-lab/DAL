'use client';

import { useState, useEffect } from 'react';
import { Users, Package, AlertTriangle, CheckSquare, TrendingUp, TrendingDown, Eye, Check, Navigation, ShieldAlert, Activity } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminOverviewPage() {
    // Mock States for Real-Time Feel
    const [metrics, setMetrics] = useState({
        activeUsers: { value: 1245, trend: '+12%', isPositive: true },
        openDeliveries: { value: 89, trend: '+5%', isPositive: true },
        alertsToday: { value: 12, trend: '-2%', isPositive: true }, // less alerts = good
        pendingApprovals: { value: 43, trend: '+18%', isPositive: false }, // high queue = bad
    });

    const [recentAlerts, setRecentAlerts] = useState([
        { id: '1', type: 'Traffic', location: 'Aba Road', upvotes: 45, time: '10m ago' },
        { id: '2', type: 'Accident', location: 'Peter Odili Rd', upvotes: 112, time: '25m ago' },
        { id: '3', type: 'Police Check', location: 'Woji Bridge', upvotes: 8, time: '40m ago' },
    ]);

    const [activityLog, setActivityLog] = useState([
        { id: '1', action: 'Approved Route', detail: 'GRA Phase 2 Bypass', admin: 'Christopher E.', time: '5m' },
        { id: '2', action: 'Suspended User', detail: 'ID: a8f...2b1', admin: 'Boma O.', time: '12m' },
        { id: '3', action: 'Dismissed Alert', detail: 'False Accident Report', admin: 'System Auto', time: '1h' },
    ]);

    // Simulate 30s auto-refresh for metrics
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly jiggle data
            setMetrics(prev => ({
                ...prev,
                activeUsers: { ...prev.activeUsers, value: prev.activeUsers.value + Math.floor(Math.random() * 5 - 2) },
                openDeliveries: { ...prev.openDeliveries, value: prev.openDeliveries.value + Math.floor(Math.random() * 3 - 1) },
            }));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Admin Overview</h1>
                    <p className={styles.subtitle}>Live platform status and prioritized action queues.</p>
                </div>
                <div className={styles.liveIndicator}>
                    <div className={styles.pulseDot} />
                    <span>Live Metrics</span>
                </div>
            </div>

            {/* Metrics Row */}
            <div className={styles.metricsGrid}>
                {/* Active Users */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Active Users</span>
                        <div className={styles.metricIconWrap}><Users size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.activeUsers.value.toLocaleString()}</span>
                        <span className={`${styles.metricTrend} ${metrics.activeUsers.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {metrics.activeUsers.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {metrics.activeUsers.trend}
                        </span>
                    </div>
                </div>

                {/* Open Deliveries */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Open Deliveries</span>
                        <div className={styles.metricIconWrap}><Package size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.openDeliveries.value}</span>
                        <span className={`${styles.metricTrend} ${metrics.openDeliveries.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {metrics.openDeliveries.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {metrics.openDeliveries.trend}
                        </span>
                    </div>
                </div>

                {/* Alerts Today */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Alerts Today</span>
                        <div className={styles.metricIconWrap}><AlertTriangle size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.alertsToday.value}</span>
                        <span className={`${styles.metricTrend} ${metrics.alertsToday.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {metrics.alertsToday.isPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                            {metrics.alertsToday.trend}
                        </span>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className={`${styles.metricCard} ${!metrics.pendingApprovals.isPositive ? styles.metricAlert : ''}`}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Pending Queues</span>
                        <div className={styles.metricIconWrap}><CheckSquare size={18} /></div>
                    </div>
                    <div className={styles.metricBody}>
                        <span className={styles.metricValue}>{metrics.pendingApprovals.value}</span>
                        <span className={`${styles.metricTrend} ${metrics.pendingApprovals.isPositive ? styles.trendUp : styles.trendDown}`}>
                            {metrics.pendingApprovals.isPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                            {metrics.pendingApprovals.trend}
                        </span>
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
                            <button className={styles.textBtn}>View All</button>
                        </div>
                        <div className={styles.listContainer}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={styles.listItem}>
                                    <div className={styles.listInfo}>
                                        <div className={styles.listIcon}><Navigation size={16} /></div>
                                        <div>
                                            <p className={styles.listTitle}>Rumuola to GRA Bypass</p>
                                            <p className={styles.listSub}>Submitted by Alex O. • 45 Upvotes</p>
                                        </div>
                                    </div>
                                    <div className={styles.listActions}>
                                        <button className={styles.outlineBtn}><Eye size={14} /> View</button>
                                        <button className={styles.solidBtnSuccess}><Check size={14} /> Quick Approve</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.actionCard}>
                        <div className={styles.cardHeader}>
                            <h3>Business Applications</h3>
                            <button className={styles.textBtn}>View All</button>
                        </div>
                        <div className={styles.listContainer}>
                            {[1, 2].map((i) => (
                                <div key={i} className={styles.listItem}>
                                    <div className={styles.listInfo}>
                                        <div className={styles.listIcon}><Package size={16} /></div>
                                        <div>
                                            <p className={styles.listTitle}>The Food Place</p>
                                            <p className={styles.listSub}>Restaurant • 2 Docs uploaded</p>
                                        </div>
                                    </div>
                                    <div className={styles.listActions}>
                                        <button className={styles.outlineBtn}><Eye size={14} /> Review Info</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Feeds */}
                <div className={styles.rightCol}>
                    <div className={styles.feedCard}>
                        <div className={styles.cardHeader}>
                            <h3>Recent Alerts</h3>
                        </div>
                        <div className={styles.feedList}>
                            {recentAlerts.map(alert => (
                                <div key={alert.id} className={styles.feedItem}>
                                    <div className={styles.feedType}>
                                        <ShieldAlert size={14} />
                                        <span>{alert.type}</span>
                                    </div>
                                    <div className={styles.feedContent}>
                                        <p className={styles.feedMain}>{alert.location}</p>
                                        <div className={styles.feedMeta}>
                                            <span>{alert.upvotes} Confirmations</span>
                                            <span>•</span>
                                            <span>{alert.time}</span>
                                        </div>
                                    </div>
                                    <button className={styles.moderateBtn}>Moderate</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.feedCard}>
                        <div className={styles.cardHeader}>
                            <h3>Activity Log</h3>
                        </div>
                        <div className={styles.activityList}>
                            {activityLog.map(log => (
                                <div key={log.id} className={styles.activityItem}>
                                    <div className={styles.activityAvatar}>
                                        <Activity size={14} />
                                    </div>
                                    <div className={styles.activityContent}>
                                        <p className={styles.activityTitle}>
                                            <strong>{log.admin}</strong> {log.action}
                                        </p>
                                        <p className={styles.activityDetail}>{log.detail}</p>
                                    </div>
                                    <span className={styles.activityTime}>{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
