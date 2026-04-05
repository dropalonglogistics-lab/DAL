'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Users, Download, AlertCircle, BarChart2, RefreshCw, Activity } from 'lucide-react';
import styles from './Financials.module.css';
import { fetchFinancialData } from './actions';

export default function FinancialsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const refreshData = useCallback(async () => {
        setLoading(true);
        const result = await fetchFinancialData();
        if (result) {
            setData(result);
            setLastUpdated(new Date());
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    if (!data && loading) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={32} style={{ animation: 'spin 2s linear infinite' }} />
                    <p style={{ marginTop: '16px' }}>Fetching financial intelligence...</p>
                </div>
            </div>
        );
    }

    const { totalRevenue, mtdRevenue, stats, disputes } = data || {
        totalRevenue: 0,
        mtdRevenue: 0,
        stats: { riders: 0, errands: 0 },
        disputes: []
    };

    const fmt = (n: number) => '₦' + (n || 0).toLocaleString();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Financials Overview</h1>
                    <p className={styles.subtitle}>Real-time revenue streams and platform economics.</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.liveBadge}>
                        <div className={styles.pulseDot} />
                        <span>Last sync: {lastUpdated.toLocaleTimeString()}</span>
                        <button onClick={refreshData} disabled={loading} className={styles.refreshBtn}>
                            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                        </button>
                    </div>
                    <button className={styles.exportBtn} onClick={() => alert('Exporting platform financials...')}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}><DollarSign size={18} /> Total Platform Revenue</div>
                    <h2 className={styles.kpiValue}>{fmt(totalRevenue)}</h2>
                    <span className={styles.kpiTrend}>Cumulative</span>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}><TrendingUp size={18} /> Revenue (This Month)</div>
                    <h2 className={styles.kpiValue}>{fmt(mtdRevenue)}</h2>
                    <span className={styles.kpiTrend}>Month-to-Date</span>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}><Users size={18} /> Active Stakeholders</div>
                    <h2 className={styles.kpiValue}>{stats.riders + stats.errands}</h2>
                    <span className={styles.kpiTrend}>{stats.riders} Riders / {stats.errands} Errand Workers</span>
                </div>
            </div>

            {/* Data Chart Visualization */}
            <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                    <h3><BarChart2 size={20} /> Revenue Visualization</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Based on completed orders.</span>
                </div>
                <div className={styles.emptyChart}>
                    <p>Historical charts require more transactional data to generate trendlines.</p>
                </div>
            </div>

            {/* Dispute Management */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <h3><AlertCircle size={20} /> Open Disputes (Awaiting Resolution)</h3>
                </div>
                <div className={styles.tableContainer}>
                    {disputes.length === 0 ? (
                        <div className={styles.emptyTable}>
                            <p>No active disputes across the platform.</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order Reference</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date Filed</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disputes.map((d: any) => (
                                    <tr key={d.id}>
                                        <td style={{ fontFamily: 'monospace' }}>{d.reference}</td>
                                        <td>{d.profiles?.full_name || 'User'}</td>
                                        <td><span className={styles.amount}>{fmt(d.fee_amount / 100)}</span></td>
                                        <td><span className={styles.badgeDisputed}>{d.status}</span></td>
                                        <td style={{ fontSize: '0.85rem' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className={styles.btnDetail} onClick={() => window.location.href = `/admin/orders?ref=${d.reference}`}>Moderate</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
