'use client';

import { DollarSign, Package, TrendingUp, Users, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './Analytics.module.css';

export default function BusinessAnalyticsPage() {
    const METRICS = [
        { label: 'Total Revenue', value: '₦1,250,000', trend: '+12.5%', isPositive: true, icon: DollarSign },
        { label: 'Total Orders', value: '458', trend: '+5.2%', isPositive: true, icon: Package },
        { label: 'Avg. Order Value', value: '₦2,725', trend: '-1.4%', isPositive: false, icon: TrendingUp },
        { label: 'Unique Customers', value: '312', trend: '+8.1%', isPositive: true, icon: Users },
    ];

    const TOP_PRODUCTS = [
        { name: 'Spicy Chicken Burger', sales: 145, revenue: 507500, percentage: 40 },
        { name: 'Chilled Zobo Drink (1L)', sales: 98, revenue: 98000, percentage: 25 },
        { name: 'Yam Porridge (Special)', sales: 76, revenue: 212800, percentage: 20 },
        { name: 'Jollof Rice & Turkey', sales: 45, revenue: 135000, percentage: 15 },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Analytics & Reports</h1>
                    <p className={styles.subtitle}>Track your performance and gain customer insights across Port Harcourt.</p>
                </div>
                <div className={styles.headerRight}>
                    <select className={styles.dateSelector}>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                {METRICS.map((metric, i) => (
                    <div key={i} className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <span className={styles.metricLabel}>{metric.label}</span>
                            <div className={styles.metricIconWrap}>
                                <metric.icon size={18} className={styles.metricIcon} />
                            </div>
                        </div>
                        <div className={styles.metricBody}>
                            <span className={styles.metricValue}>{metric.value}</span>
                            <span className={`${styles.metricTrend} ${metric.isPositive ? styles.trendUp : styles.trendDown}`}>
                                {metric.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {metric.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3>Revenue Overview</h3>
                    </div>
                    {/* Mock Chart CSS Render */}
                    <div className={styles.mockChartArea}>
                        <div className={styles.chartBars}>
                            {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
                                <div key={i} className={styles.barWrap}>
                                    <div className={styles.bar} style={{ height: `${height}%` }} />
                                </div>
                            ))}
                        </div>
                        <div className={styles.chartLabels}>
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3>Orders Volume</h3>
                    </div>
                    {/* Mock Chart Line Render */}
                    <div className={styles.mockChartArea}>
                        <svg viewBox="0 0 100 40" className={styles.svgLineChart} preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="var(--brand-gold)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,40 L0,20 Q10,5 20,25 T40,15 T60,25 T80,10 T100,5 L100,40 Z" fill="url(#gradient)" />
                            <path d="M0,20 Q10,5 20,25 T40,15 T60,25 T80,10 T100,5" fill="none" stroke="var(--brand-gold)" strokeWidth="1.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className={styles.bottomRow}>
                {/* Top Products */}
                <div className={styles.topProductsCard}>
                    <div className={styles.cardHeader}>
                        <h3>Top Performing Products</h3>
                    </div>
                    <div className={styles.productList}>
                        {TOP_PRODUCTS.map((prod, i) => (
                            <div key={i} className={styles.productRow}>
                                <div className={styles.productDetails}>
                                    <span className={styles.productName}>{prod.name}</span>
                                    <span className={styles.productStats}>{prod.sales} sales • ₦{prod.revenue.toLocaleString()}</span>
                                </div>
                                <div className={styles.productProgressWrap}>
                                    <div className={styles.productProgressBar} style={{ width: `${prod.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Heatmap Mock */}
                <div className={styles.heatmapCard}>
                    <div className={styles.cardHeader}>
                        <h3>Customer Area Heatmap</h3>
                        <span className={styles.badge}><MapPin size={12} /> Live</span>
                    </div>
                    <div className={styles.heatmapMockup}>
                        {/* CSS Map dots */}
                        <div className={styles.mapDot} style={{ top: '30%', left: '40%', opacity: 0.9, transform: 'scale(1.5)' }} />
                        <div className={styles.mapDot} style={{ top: '45%', left: '60%', opacity: 0.6 }} />
                        <div className={styles.mapDot} style={{ top: '60%', left: '30%', opacity: 0.8, transform: 'scale(1.2)' }} />
                        <div className={styles.mapDot} style={{ top: '20%', left: '70%', opacity: 0.4 }} />

                        <div className={styles.mapOverlay}>
                            <span>Port Harcourt Grid</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
