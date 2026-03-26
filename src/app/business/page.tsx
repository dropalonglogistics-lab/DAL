'use client';

import { useState } from 'react';
import { Package, TrendingUp, ShoppingCart, DollarSign, Check, X } from 'lucide-react';
import styles from './Business.module.css';

export default function BusinessOverview() {
    // Mock Data for Overview
    const STATS = [
        { label: "Today's Orders", value: 12, icon: Package, trend: '+3' },
        { label: 'Pending Orders', value: 4, icon: ShoppingCart, alert: true },
        { label: 'Monthly Revenue', value: '₦450,000', icon: DollarSign, trend: '+15%' },
        { label: 'Active Listings', value: 38, icon: TrendingUp },
    ];

    const [pendingOrders, setPendingOrders] = useState([
        { id: 'ORD-8901', customer: 'Joy O.', time: '10 mins ago', items: 3, total: '₦4,500' },
        { id: 'ORD-8902', customer: 'Kingsley E.', time: '15 mins ago', items: 1, total: '₦2,100' }
    ]);

    const handleAccept = (id: string) => {
        setPendingOrders(prev => prev.filter(o => o.id !== id));
    };

    const handleReject = (id: string) => {
        setPendingOrders(prev => prev.filter(o => o.id !== id));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Business Overview</h1>
                <p className={styles.subtitle}>Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Row */}
            <div className={styles.statsGrid}>
                {STATS.map((stat, i) => (
                    <div key={i} className={`${styles.statCard} ${stat.alert ? styles.statAlert : ''}`}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIconWrap}>
                                <stat.icon size={20} className={styles.statIcon} />
                            </div>
                            {stat.trend && <span className={styles.statTrend}>{stat.trend}</span>}
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Pending Orders Alerts */}
            {pendingOrders.length > 0 && (
                <div className={styles.pendingSection}>
                    <h2 className={styles.sectionTitle}>Requires Attention</h2>
                    <div className={styles.orderGrid}>
                        {pendingOrders.map(order => (
                            <div key={order.id} className={styles.pendingCard}>
                                <div className={styles.pendingHeader}>
                                    <span className={styles.orderId}>{order.id}</span>
                                    <span className={styles.orderTime}>{order.time}</span>
                                </div>
                                <div className={styles.pendingBody}>
                                    <div className={styles.orderCustomer}>{order.customer}</div>
                                    <div className={styles.orderSummary}>{order.items} items • {order.total}</div>
                                </div>
                                <div className={styles.pendingActions}>
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={() => handleReject(order.id)}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={() => handleAccept(order.id)}
                                    >
                                        <Check size={16} /> Accept Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Can add quick links or charts snippet below if needed */}
            <div className={styles.placeholderRow}>
                <div className={styles.placeholderCard}>
                    <h3 className={styles.cardTitle}>Recent Activity</h3>
                    <p className={styles.emptyState}>No other recent activity to show.</p>
                </div>
            </div>
        </div>
    );
}
